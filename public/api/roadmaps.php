<?php
/**
 * Yaswant Code LMS — Public Roadmaps API
 * Hostinger Shared Hosting Compatible (PHP 8.1+, MySQL/MariaDB)
 * Place this file in: public_html/api/roadmaps.php
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = trim($_GET['id'] ?? $_GET['slug'] ?? '');

// Helper to load fal tracks from seed file if DB is down or empty
function get_seed_tracks(?string $filterId = null): array
{
    $seedFile = __DIR__ . '/seed_roadmaps.json';
    if (!file_exists($seedFile)) {
        return [];
    }
    $raw = @file_get_contents($seedFile);
    $tracks = json_decode($raw ?: '[]', true);
    if (!is_array($tracks))
        return [];

    if ($filterId !== null && $filterId !== '') {
        foreach ($tracks as $t) {
            if (($t['id'] ?? '') === $filterId || ($t['slug'] ?? '') === $filterId) {
                return [$t];
            }
        }
        return [];
    }
    return $tracks;
}

function format_roadmap_row(array $r): array
{
    $stages = !empty($r['stages']) ? json_decode($r['stages'], true) : [];
    $totalTopics = (int) ($r['total_topics'] ?? 0);
    if ($totalTopics === 0 && is_array($stages)) {
        foreach ($stages as $stg) {
            if (!empty($stg['topics']) && is_array($stg['topics'])) {
                $totalTopics += count($stg['topics']);
            }
        }
    }

    return [
        'id' => $r['id'],
        'slug' => $r['slug'] ?? $r['id'],
        'title' => $r['title'],
        'subtitle' => $r['subtitle'] ?? $r['tagline'] ?? '',
        'description' => $r['description'] ?? '',
        'badge' => $r['badge'] ?? 'Official Career Track',
        'category' => $r['category'] ?? 'web',
        'categoryLabel' => $r['category_label'] ?? 'Web Development',
        'tagline' => $r['tagline'] ?? $r['subtitle'] ?? '',
        'difficulty' => $r['difficulty'] ?? 'Intermediate',
        'duration' => $r['duration'] ?? '6 months',
        'weeklyCommitment' => $r['weekly_commitment'] ?? '10-15 hrs/week',
        'totalTopics' => $totalTopics,
        'salaryBenchmark' => $r['salary_benchmark'] ?? '₹8–25 LPA',
        'careerRoles' => array_values(array_filter(array_map('trim', explode(',', $r['career_roles'] ?? '')))),
        'stages' => is_array($stages) ? $stages : [],
        'status' => $r['status'] ?? 'published',
        'orderIndex' => (int) ($r['order_index'] ?? 0),
        'createdAt' => $r['created_at'] ?? '',
        'updatedAt' => $r['updated_at'] ?? '',
    ];
}

if ($method === 'GET') {
    $pdo = null;
    try {
        $pdo = get_db();
    } catch (\Throwable $e) {
        $pdo = null;
    }

    if ($pdo !== null) {
        try {
            // Check if roadmaps table exists
            $tableExists = false;
            $driver = get_db_driver($pdo);
            if ($driver === 'mysql') {
                $checkStmt = $pdo->query("SHOW TABLES LIKE 'roadmaps'");
                $tableExists = ($checkStmt && $checkStmt->rowCount() > 0);
            } else {
                $checkStmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='roadmaps'");
                $tableExists = ($checkStmt && $checkStmt->fetchColumn() !== false);
            }

            if ($tableExists) {
                if ($id !== '') {
                    $stmt = $pdo->prepare("SELECT * FROM roadmaps WHERE (id = ? OR slug = ?) AND status = 'published' LIMIT 1");
                    $stmt->execute([$id, $id]);
                    $row = $stmt->fetch();
                    if ($row) {
                        echo json_encode(['success' => true, 'data' => format_roadmap_row($row)]);
                        exit;
                    }
                } else {
                    $stmt = $pdo->query("SELECT * FROM roadmaps WHERE status = 'published' ORDER BY order_index ASC, created_at ASC");
                    $rows = $stmt->fetchAll();
                    if (!empty($rows)) {
                        $list = array_map('format_roadmap_row', $rows);
                        echo json_encode(['success' => true, 'data' => $list]);
                        exit;
                    }
                }
            }
        } catch (\Throwable $e) {
            // Fall through to seed fallback
        }
    }

    // Fallback: Read from canonical seed_roadmaps.json
    $fallbackData = get_seed_tracks($id !== '' ? $id : null);
    if ($id !== '') {
        if (!empty($fallbackData)) {
            echo json_encode(['success' => true, 'data' => $fallbackData[0]]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Roadmap not found']);
        }
    } else {
        echo json_encode(['success' => true, 'data' => $fallbackData]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
