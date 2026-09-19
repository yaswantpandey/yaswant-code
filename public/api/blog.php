<?php
/**
 * Yaswant Code LMS — Blog & Articles API
 * Shared Hosting & Database Compatible
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];
$slug   = trim($_GET['slug'] ?? '');
$id     = trim($_GET['id'] ?? '');

try {
    $pdo = get_db();
} catch (\Throwable $e) {
    // If DB is offline, return empty list gracefully
    echo json_encode(['success' => true, 'data' => []]);
    exit;
}

if ($method === 'GET') {
    if ($pdo === null) {
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }

    try {
        // Check if blog_posts table exists
        $stmt = $pdo->query("SHOW TABLES LIKE 'blog_posts'");
        if ($stmt->rowCount() === 0) {
            // Table doesn't exist yet, return empty list
            echo json_encode(['success' => true, 'data' => []]);
            exit;
        }

        if ($slug !== '') {
            $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE slug = ? AND published = 1 LIMIT 1");
            $stmt->execute([$slug]);
            $post = $stmt->fetch();
            if (!$post) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Post not found']);
                exit;
            }
            echo json_encode(['success' => true, 'data' => $post]);
            exit;
        }

        $stmt = $pdo->query("SELECT * FROM blog_posts WHERE published = 1 ORDER BY created_at DESC");
        $posts = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $posts]);
        exit;
    } catch (\Throwable $e) {
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }
}

// Fallback
echo json_encode(['success' => true, 'data' => []]);
