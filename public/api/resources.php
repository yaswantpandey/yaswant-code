<?php
/**
 * Yaswant Code LMS — Resources API
 * Shared Hosting Compatible
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    $pdo = get_db();
} catch (\Throwable $e) {
    echo json_encode(['success' => true, 'data' => []]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($pdo === null) {
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }

    try {
        $stmt = $pdo->query("SHOW TABLES LIKE 'resources'");
        if ($stmt->rowCount() === 0) {
            echo json_encode(['success' => true, 'data' => []]);
            exit;
        }

        $stmt = $pdo->query("SELECT * FROM resources WHERE is_deleted = 0 ORDER BY created_at DESC");
        $resources = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $resources]);
        exit;
    } catch (\Throwable $e) {
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }
}

echo json_encode(['success' => true, 'data' => []]);
