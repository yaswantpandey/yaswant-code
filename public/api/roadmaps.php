<?php
/**
 * Yaswant Code LMS — Public Roadmaps API
 * Hostinger Shared Hosting Compatible (PHP 8.1+, MySQL/MariaDB)
 * Place this file in: public_html/api/roadmaps.php
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];
$id     = trim($_GET['id'] ?? '');

try {
    $pdo = get_db();
} catch (\Throwable $e) {
    echo json_encode(['success' => true, 'data' => []]);
    exit;
}

if ($method === 'GET') {
    if ($pdo === null) {
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }

    try {
        // Check if roadmaps table exists
        $stmt = $pdo->query("SHOW TABLES LIKE 'roadmaps'");
        if ($stmt->rowCount() === 0) {
            echo json_encode(['success' => true, 'data' => []]);
            exit;
        }

        if ($id !== '') {
            $stmt = $pdo->prepare("SELECT * FROM roadmaps WHERE id = ? LIMIT 1");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Roadmap not found']);
                exit;
            }

            $roadmap = [
                'id' => $row['id'],
                'title' => $row['title'],
                'category' => $row['category'] ?? 'web',
                'categoryLabel' => $row['category_label'] ?? 'Web Development',
                'tagline' => $row['tagline'] ?? '',
                'description' => $row['description'] ?? '',
                'difficulty' => $row['difficulty'] ?? 'Intermediate',
                'duration' => $row['duration'] ?? '6 months',
                'weeklyCommitment' => $row['weekly_commitment'] ?? '10-15 hrs/week',
                'totalTopics' => (int)($row['total_topics'] ?? 0),
                'salaryBenchmark' => $row['salary_benchmark'] ?? '',
                'careerRoles' => array_values(array_filter(array_map('trim', explode(',', $row['career_roles'] ?? '')))),
                'mindtree' => !empty($row['mindtree']) ? json_decode($row['mindtree'], true) : [],
                'milestones' => !empty($row['milestones']) ? json_decode($row['milestones'], true) : [],
            ];

            echo json_encode(['success' => true, 'data' => $roadmap]);
            exit;
        }

        $stmt = $pdo->query("SELECT * FROM roadmaps ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();

        $roadmaps = array_map(function($r) {
            return [
                'id' => $r['id'],
                'title' => $r['title'],
                'category' => $r['category'] ?? 'web',
                'categoryLabel' => $r['category_label'] ?? 'Web Development',
                'tagline' => $r['tagline'] ?? '',
                'description' => $r['description'] ?? '',
                'difficulty' => $r['difficulty'] ?? 'Intermediate',
                'duration' => $r['duration'] ?? '6 months',
                'weeklyCommitment' => $r['weekly_commitment'] ?? '10-15 hrs/week',
                'totalTopics' => (int)($r['total_topics'] ?? 0),
                'salaryBenchmark' => $r['salary_benchmark'] ?? '',
                'careerRoles' => array_values(array_filter(array_map('trim', explode(',', $r['career_roles'] ?? '')))),
                'mindtree' => !empty($r['mindtree']) ? json_decode($r['mindtree'], true) : [],
                'milestones' => !empty($r['milestones']) ? json_decode($r['milestones'], true) : [],
            ];
        }, $rows);

        echo json_encode(['success' => true, 'data' => $roadmaps]);
        exit;
    } catch (\Throwable $e) {
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
