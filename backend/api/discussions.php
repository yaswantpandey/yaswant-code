<?php
/**
 * discussions.php — Community Q&A / Discussion Forum API
 * Yaswant Code LMS Backend
 *
 * GET                          List discussions (with ?category=, ?course_id=, ?search=, ?page=)
 * GET  ?id=X                   Get single discussion + replies
 * POST                         Create a new discussion
 * POST ?action=reply           Add a reply to a discussion
 * PUT  ?action=upvote          Upvote a discussion or reply
 * PUT  ?action=accept          Mark a reply as accepted answer
 * DELETE ?id=X                 Delete own discussion (or admin)
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_middleware.php';

$pdo    = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

// ─────────────────────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $id       = $_GET['id']        ?? null;
    $category = $_GET['category']  ?? null;
    $courseId = $_GET['course_id'] ?? null;
    $search   = $_GET['search']    ?? null;
    $page     = max(1, (int)($_GET['page'] ?? 1));
    $perPage  = min(50, max(1, (int)($_GET['per_page'] ?? 20)));
    $offset   = ($page - 1) * $perPage;

    // Single discussion + replies
    if ($id) {
        $stmt = $pdo->prepare('
            SELECT d.*, u.name AS author_name, u.avatar AS author_avatar, u.title AS author_title
            FROM discussions d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        ');
        $stmt->execute([$id]);
        $disc = $stmt->fetch();
        if (!$disc) {
            jsonResponse(false, null, 'Discussion not found', 404);
        }
        $disc['tags'] = json_decode($disc['tags_json'] ?? '[]', true) ?? [];
        unset($disc['tags_json']);

        $rStmt = $pdo->prepare('
            SELECT r.*, u.name AS author_name, u.avatar AS author_avatar, u.title AS author_title
            FROM discussion_replies r
            JOIN users u ON r.user_id = u.id
            WHERE r.discussion_id = ?
            ORDER BY r.is_accepted DESC, r.upvotes DESC, r.created_at ASC
        ');
        $rStmt->execute([$id]);
        $disc['replies'] = $rStmt->fetchAll();

        jsonResponse(true, $disc);
    }

    // List discussions
    $sql    = '
        SELECT d.id, d.title, d.category, d.upvotes, d.has_accepted_answer, d.created_at,
               d.tags_json, u.name AS author_name, u.avatar AS author_avatar,
               (SELECT COUNT(*) FROM discussion_replies r WHERE r.discussion_id = d.id) AS replies_count
        FROM discussions d
        JOIN users u ON d.user_id = u.id
        WHERE 1=1
    ';
    $params = [];

    if ($category && $category !== 'All') {
        $sql .= ' AND d.category = ?';
        $params[] = $category;
    }
    if ($courseId) {
        $sql .= ' AND d.course_id = ?';
        $params[] = $courseId;
    }
    if ($search) {
        $sql .= ' AND (d.title LIKE ? OR d.content LIKE ?)';
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }

    // Count total for pagination
    $countStmt = $pdo->prepare(str_replace(
        'SELECT d.id, d.title, d.category, d.upvotes, d.has_accepted_answer, d.created_at, d.tags_json, u.name AS author_name, u.avatar AS author_avatar, (SELECT COUNT(*) FROM discussion_replies r WHERE r.discussion_id = d.id) AS replies_count',
        'SELECT COUNT(*) AS total',
        $sql
    ));
    $countStmt->execute($params);
    $total = (int)($countStmt->fetch()['total'] ?? 0);

    $sql .= ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    $params[] = $perPage;
    $params[] = $offset;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['tags'] = json_decode($row['tags_json'] ?? '[]', true) ?? [];
        unset($row['tags_json']);
    }
    unset($row);

    jsonResponse(true, [
        'discussions' => $rows,
        'total'       => $total,
        'page'        => $page,
        'per_page'    => $perPage,
        'total_pages' => (int)ceil($total / $perPage),
    ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — Create discussion or add reply
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $userId = requireAuth();
    $input  = getJsonInput();

    if ($action === 'reply') {
        $discussionId = $input['discussion_id'] ?? null;
        $content      = trim($input['content'] ?? '');

        if (!$discussionId || !$content) {
            jsonResponse(false, null, 'discussion_id and content are required', 422);
        }

        $replyId = 'reply-' . bin2hex(random_bytes(6));
        $pdo->prepare('
            INSERT INTO discussion_replies (id, discussion_id, user_id, content)
            VALUES (?, ?, ?, ?)
        ')->execute([$replyId, $discussionId, $userId, $content]);

        jsonResponse(true, ['reply_id' => $replyId], 'Reply posted', 201);
    }

    // Create discussion
    $title    = trim($input['title']    ?? '');
    $content  = trim($input['content']  ?? '');
    $category = $input['category'] ?? 'General';
    $tags     = is_array($input['tags'] ?? null) ? $input['tags'] : [];
    $courseId = $input['course_id'] ?? null;

    if (!$title || !$content) {
        jsonResponse(false, null, 'title and content are required', 422);
    }

    $discId = 'disc-' . bin2hex(random_bytes(6));
    $pdo->prepare('
        INSERT INTO discussions (id, user_id, course_id, title, content, category, tags_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ')->execute([$discId, $userId, $courseId, $title, $content, $category, json_encode($tags)]);

    jsonResponse(true, ['discussion_id' => $discId], 'Discussion created', 201);
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT — Upvote or accept answer
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'PUT') {
    requireAuth();
    $input = getJsonInput();

    if ($action === 'upvote') {
        $id   = $input['id']   ?? null;
        $type = $input['type'] ?? 'discussion';

        if (!$id) {
            jsonResponse(false, null, 'id is required', 422);
        }

        if ($type === 'reply') {
            $pdo->prepare('UPDATE discussion_replies SET upvotes = upvotes + 1 WHERE id = ?')
                ->execute([$id]);
        } else {
            $pdo->prepare('UPDATE discussions SET upvotes = upvotes + 1 WHERE id = ?')
                ->execute([$id]);
        }

        jsonResponse(true, null, 'Upvoted');
    }

    if ($action === 'accept') {
        $discussionId = $input['discussion_id'] ?? null;
        $replyId      = $input['reply_id']      ?? null;

        if (!$discussionId || !$replyId) {
            jsonResponse(false, null, 'discussion_id and reply_id are required', 422);
        }

        // Unaccept any existing accepted reply
        $pdo->prepare('UPDATE discussion_replies SET is_accepted = 0 WHERE discussion_id = ?')
            ->execute([$discussionId]);

        $pdo->prepare('UPDATE discussion_replies SET is_accepted = 1 WHERE id = ? AND discussion_id = ?')
            ->execute([$replyId, $discussionId]);

        $pdo->prepare('UPDATE discussions SET has_accepted_answer = 1 WHERE id = ?')
            ->execute([$discussionId]);

        jsonResponse(true, null, 'Answer accepted');
    }

    jsonResponse(false, null, 'Unknown action', 400);
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE — Remove own discussion
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $userId = requireAuth();
    $id     = $_GET['id'] ?? null;

    if (!$id) {
        jsonResponse(false, null, 'id is required', 400);
    }

    $stmt = $pdo->prepare('DELETE FROM discussions WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $userId]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(false, null, 'Discussion not found or access denied', 404);
    }

    jsonResponse(true, null, 'Discussion deleted');
}
