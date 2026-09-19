<?php
/**
 * Yaswant Code LMS — Notifications API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoints:
 *   GET                           — List user notifications (auth required)
 *   PUT  ?action=read&id=X        — Mark one notification as read
 *   PUT  ?action=read_all         — Mark all notifications as read
 *   DELETE ?id=X                  — Delete a notification
 *   POST (admin only)             — Create notification for user(s)
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = strtolower(trim($_GET['action'] ?? ''));

// ─── GET — List Notifications ───────────────────────────────────────────────
if ($method === 'GET') {
    $user = require_auth();
    $pdo  = require_db();

    $limit  = max(1, min(100, (int)($_GET['limit'] ?? 50)));
    $unread = isset($_GET['unread']) && $_GET['unread'] === '1';

    $where = 'user_id = ?';
    $params = [$user['id']];
    if ($unread) {
        $where .= ' AND is_read = 0';
    }

    $stmt = $pdo->prepare(
        "SELECT * FROM notifications WHERE {$where} ORDER BY is_read ASC, created_at DESC LIMIT {$limit}"
    );
    $stmt->execute($params);
    $notifications = $stmt->fetchAll();

    foreach ($notifications as &$n) {
        $n['is_read'] = (bool)$n['is_read'];
    }
    unset($n);

    // Unread count
    $unreadCount = $pdo->prepare('SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0');
    $unreadCount->execute([$user['id']]);

    ok([
        'notifications'   => $notifications,
        'unread_count'    => (int)$unreadCount->fetchColumn(),
        'total'           => count($notifications),
    ]);
}

// ─── PUT — Mark Read ────────────────────────────────────────────────────────
if ($method === 'PUT') {
    $user = require_auth();
    $pdo  = require_db();

    if ($action === 'read_all') {
        $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?')
            ->execute([$user['id']]);
        ok(null, 'All notifications marked as read');
    }

    if ($action === 'read') {
        $id = trim($_GET['id'] ?? '');
        if (!$id) fail('Notification id is required.', 400);

        $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?')
            ->execute([$id, $user['id']]);
        ok(null, 'Notification marked as read');
    }

    fail('Invalid action.', 400);
}

// ─── DELETE — Remove Notification ──────────────────────────────────────────
if ($method === 'DELETE') {
    $user = require_auth();
    $id   = trim($_GET['id'] ?? '');

    if (!$id) fail('Notification id is required.', 400);

    $pdo = require_db();
    $pdo->prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?')
        ->execute([$id, $user['id']]);

    ok(null, 'Notification deleted');
}

// ─── POST — Create Notification (admin) ────────────────────────────────────
if ($method === 'POST') {
    $user  = require_role('admin', 'instructor');
    $input = get_json_input();
    $pdo   = require_db();

    $title     = str_input($input, 'title');
    $message   = str_input($input, 'message');
    $type      = in_array($input['type'] ?? '', ['course','assignment','quiz','certificate','announcement','community'])
                 ? $input['type'] : 'announcement';
    $link      = str_input($input, 'link') ?: null;
    $targetUserId = str_input($input, 'user_id');
    $broadcast = !empty($input['broadcast']); // send to all users

    if (!$title)   fail('title is required.', 422);
    if (!$message) fail('message is required.', 422);

    if ($broadcast && $user['role'] === 'admin') {
        // Send to all active users
        $usersStmt = $pdo->query('SELECT id FROM users WHERE is_active = 1');
        $userIds   = $usersStmt->fetchAll(PDO::FETCH_COLUMN);
    } elseif ($targetUserId) {
        $userIds = [$targetUserId];
    } else {
        fail('Provide user_id or set broadcast: true (admin only).', 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO notifications (id, user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?, ?)'
    );
    foreach ($userIds as $uid) {
        $stmt->execute([generate_id('notif'), $uid, $title, $message, $type, $link]);
    }

    ok(['sent_to' => count($userIds)], 'Notification(s) sent', 201);
}

fail('Invalid request.', 405);
