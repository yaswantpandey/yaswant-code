<?php
/**
 * notifications.php — In-App Notification API
 * Yaswant Code LMS Backend
 *
 * GET                         List notifications for authenticated user
 * GET  ?unread=1              Only unread notifications
 * PUT  ?action=read&id=X      Mark single notification as read
 * PUT  ?action=read_all       Mark all notifications as read
 * DELETE ?id=X               Delete a notification
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
    $userId  = requireAuth();
    $limit   = min(100, max(1, (int)($_GET['limit'] ?? 20)));
    $unread  = isset($_GET['unread']) && $_GET['unread'] === '1';

    $sql    = 'SELECT * FROM notifications WHERE user_id = ?';
    $params = [$userId];

    if ($unread) {
        $sql .= ' AND is_read = 0';
    }

    $sql .= ' ORDER BY created_at DESC LIMIT ?';
    $params[] = $limit;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $notifications = $stmt->fetchAll();

    // Unread count
    $cStmt = $pdo->prepare('SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0');
    $cStmt->execute([$userId]);
    $unreadCount = (int)$cStmt->fetchColumn();

    // Total count
    $tStmt = $pdo->prepare('SELECT COUNT(*) FROM notifications WHERE user_id = ?');
    $tStmt->execute([$userId]);
    $total = (int)$tStmt->fetchColumn();

    jsonResponse(true, [
        'notifications' => $notifications,
        'unread_count'  => $unreadCount,
        'total'         => $total,
    ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT — Mark read
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'PUT') {
    $userId = requireAuth();

    if ($action === 'read_all') {
        $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?')
            ->execute([$userId]);
        jsonResponse(true, null, 'All notifications marked as read');
    }

    if ($action === 'read') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            jsonResponse(false, null, 'id is required', 400);
        }
        $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?')
            ->execute([$id, $userId]);
        jsonResponse(true, null, 'Notification marked as read');
    }

    jsonResponse(false, null, 'Unknown action', 400);
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $userId = requireAuth();
    $id     = $_GET['id'] ?? null;

    if (!$id) {
        jsonResponse(false, null, 'id is required', 400);
    }

    $stmt = $pdo->prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $userId]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(false, null, 'Notification not found', 404);
    }

    jsonResponse(true, null, 'Notification deleted');
}
