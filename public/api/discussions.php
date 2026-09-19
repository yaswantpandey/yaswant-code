<?php
/**
 * Yaswant Code LMS — Community Discussions API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoints:
 *   GET                           — List discussions (paginated, filterable)
 *   GET  ?id=X                    — Single discussion with replies
 *   POST                          — Create discussion (auth required)
 *   POST ?action=reply            — Reply to discussion (auth required)
 *   PUT  ?action=upvote           — Upvote discussion or reply (auth required)
 *   PUT  ?action=accept           — Accept answer (OP only, auth required)
 *   DELETE ?id=X                  — Delete discussion (owner/admin, auth required)
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = strtolower(trim($_GET['action'] ?? ''));

// ─── GET ────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $pdo  = require_db();
    $id   = trim($_GET['id'] ?? '');

    // Single discussion with replies
    if ($id) {
        $stmt = $pdo->prepare('
            SELECT d.*,
                   u.name AS author_name, u.avatar AS author_avatar, u.role AS author_role,
                   u.title AS author_title
            FROM discussions d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        ');
        $stmt->execute([$id]);
        $disc = $stmt->fetch();
        if (!$disc) fail('Discussion not found.', 404);

        $disc['tags']    = json_decode($disc['tags_json'] ?? '[]', true) ?: [];
        $disc['upvotes'] = (int)$disc['upvotes'];
        unset($disc['tags_json']);

        $rStmt = $pdo->prepare('
            SELECT r.*,
                   u.name AS author_name, u.avatar AS author_avatar, u.role AS author_role
            FROM discussion_replies r
            JOIN users u ON r.user_id = u.id
            WHERE r.discussion_id = ?
            ORDER BY r.is_accepted DESC, r.upvotes DESC, r.created_at ASC
        ');
        $rStmt->execute([$id]);
        $replies = $rStmt->fetchAll();
        foreach ($replies as &$r) {
            $r['upvotes']    = (int)$r['upvotes'];
            $r['is_accepted']= (bool)$r['is_accepted'];
        }
        unset($r);

        $disc['replies']       = $replies;
        $disc['replies_count'] = count($replies);
        ok($disc);
    }

    // Listing with filters
    $category = trim($_GET['category'] ?? '');
    $courseId = trim($_GET['course_id'] ?? '');
    $search   = trim($_GET['search'] ?? '');
    $page     = max(1, (int)($_GET['page'] ?? 1));
    $perPage  = max(1, min(50, (int)($_GET['per_page'] ?? 20)));

    $where  = ['1=1'];
    $params = [];

    $validCategories = ['General','Frontend','Backend','AI & ML','Architecture','Career'];
    if ($category && in_array($category, $validCategories, true)) {
        $where[] = 'd.category = ?';
        $params[] = $category;
    }
    if ($courseId) {
        $where[] = 'd.course_id = ?';
        $params[] = $courseId;
    }
    if ($search) {
        $where[] = '(d.title LIKE ? OR d.content LIKE ?)';
        $like = '%' . $search . '%';
        $params[] = $like;
        $params[] = $like;
    }

    $whereStr = implode(' AND ', $where);

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM discussions d WHERE {$whereStr}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $offset  = ($page - 1) * $perPage;
    $dataStmt = $pdo->prepare("
        SELECT d.id, d.title, d.category, d.tags_json, d.upvotes,
               d.has_accepted_answer, d.created_at,
               u.name AS author_name, u.avatar AS author_avatar, u.role AS author_role,
               (SELECT COUNT(*) FROM discussion_replies r WHERE r.discussion_id = d.id) AS replies_count
        FROM discussions d
        JOIN users u ON d.user_id = u.id
        WHERE {$whereStr}
        ORDER BY d.created_at DESC
        LIMIT {$perPage} OFFSET {$offset}
    ");
    $dataStmt->execute($params);
    $discussions = $dataStmt->fetchAll();

    foreach ($discussions as &$disc) {
        $disc['tags']             = json_decode($disc['tags_json'] ?? '[]', true) ?: [];
        $disc['upvotes']          = (int)$disc['upvotes'];
        $disc['replies_count']    = (int)$disc['replies_count'];
        $disc['has_accepted_answer'] = (bool)$disc['has_accepted_answer'];
        unset($disc['tags_json']);
    }
    unset($disc);

    ok([
        'discussions' => $discussions,
        'total'       => $total,
        'page'        => $page,
        'per_page'    => $perPage,
        'total_pages' => (int)ceil($total / max(1, $perPage)),
    ]);
}

// ─── POST — Create Discussion / Reply ──────────────────────────────────────
if ($method === 'POST') {
    $user  = require_auth();
    $input = get_json_input();
    $pdo   = require_db();

    // Reply to existing discussion
    if ($action === 'reply') {
        $discussionId = str_input($input, 'discussion_id');
        $content      = str_input($input, 'content');

        if (!$discussionId) fail('discussion_id is required.', 422);
        if (!$content)      fail('content is required.', 422);

        $chk = $pdo->prepare('SELECT id FROM discussions WHERE id = ?');
        $chk->execute([$discussionId]);
        if (!$chk->fetch()) fail('Discussion not found.', 404);

        $replyId = generate_id('reply');
        $pdo->prepare(
            'INSERT INTO discussion_replies (id, discussion_id, user_id, content) VALUES (?, ?, ?, ?)'
        )->execute([$replyId, $discussionId, $user['id'], $content]);

        ok(['reply_id' => $replyId], 'Reply posted', 201);
    }

    // Create new discussion
    $title    = str_input($input, 'title');
    $content  = str_input($input, 'content');
    $category = in_array($input['category'] ?? '', ['General','Frontend','Backend','AI & ML','Architecture','Career'])
                ? $input['category'] : 'General';
    $tags     = is_array($input['tags'] ?? null) ? array_slice($input['tags'], 0, 10) : [];
    $courseId = str_input($input, 'course_id') ?: null;

    if (!$title)   fail('Discussion title is required.', 422);
    if (!$content) fail('Discussion content is required.', 422);

    $discId = generate_id('disc');
    $pdo->prepare('
        INSERT INTO discussions (id, user_id, course_id, title, content, category, tags_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ')->execute([
        $discId, $user['id'], $courseId,
        $title, $content, $category,
        json_encode(array_map('sanitize', $tags)),
    ]);

    ok(['discussion_id' => $discId], 'Discussion posted!', 201);
}

// ─── PUT — Upvote / Accept Answer ──────────────────────────────────────────
if ($method === 'PUT') {
    $user  = require_auth();
    $input = get_json_input();
    $pdo   = require_db();

    // Accept an answer (OP only)
    if ($action === 'accept') {
        $replyId      = str_input($input, 'reply_id');
        $discussionId = str_input($input, 'discussion_id');

        if (!$replyId || !$discussionId) fail('reply_id and discussion_id are required.', 422);

        // Only OP can accept
        $disc = $pdo->prepare('SELECT user_id FROM discussions WHERE id = ?');
        $disc->execute([$discussionId]);
        $row = $disc->fetch();
        if (!$row) fail('Discussion not found.', 404);
        if ($row['user_id'] !== $user['id'] && $user['role'] !== 'admin') {
            fail('Only the discussion author can accept an answer.', 403);
        }

        // Unaccept previous
        $pdo->prepare('UPDATE discussion_replies SET is_accepted = 0 WHERE discussion_id = ?')
            ->execute([$discussionId]);
        // Accept new
        $pdo->prepare('UPDATE discussion_replies SET is_accepted = 1 WHERE id = ?')
            ->execute([$replyId]);
        // Mark discussion as having accepted answer
        $pdo->prepare('UPDATE discussions SET has_accepted_answer = 1 WHERE id = ?')
            ->execute([$discussionId]);

        ok(null, 'Answer accepted');
    }

    // Upvote a discussion or reply
    if ($action === 'upvote') {
        $targetType = in_array($input['type'] ?? '', ['discussion', 'reply']) ? $input['type'] : 'discussion';
        $targetId   = str_input($input, 'id');

        if (!$targetId) fail('id is required.', 422);

        if ($targetType === 'discussion') {
            $pdo->prepare('UPDATE discussions SET upvotes = upvotes + 1 WHERE id = ?')->execute([$targetId]);
        } else {
            $pdo->prepare('UPDATE discussion_replies SET upvotes = upvotes + 1 WHERE id = ?')->execute([$targetId]);
        }

        ok(null, 'Upvoted');
    }

    fail('Invalid action.', 400);
}

// ─── DELETE — Remove Discussion ─────────────────────────────────────────────
if ($method === 'DELETE') {
    $user = require_auth();
    $id   = trim($_GET['id'] ?? '');

    if (!$id) fail('id is required.', 400);

    $pdo  = require_db();
    $stmt = $pdo->prepare('SELECT user_id FROM discussions WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    if (!$row) fail('Discussion not found.', 404);
    if ($row['user_id'] !== $user['id'] && $user['role'] !== 'admin') {
        fail('You do not have permission to delete this discussion.', 403);
    }

    $pdo->prepare('DELETE FROM discussions WHERE id = ?')->execute([$id]);
    ok(null, 'Discussion deleted');
}

fail('Invalid request.', 405);
