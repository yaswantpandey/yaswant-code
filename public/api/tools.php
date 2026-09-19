<?php
/**
 * Yaswant Code LMS — Public Developer Tools & Downloads API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoints:
 *   GET /api/tools.php               — List all active developer tools
 *   GET /api/tools.php?category=...  — Filter by tool category
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    fail('Method not allowed.', 405);
}

$category = trim($_GET['category'] ?? '');
$search   = trim($_GET['search'] ?? '');

$pdo = get_db();

if ($pdo) {
    try {
        $where = ['1=1'];
        $params = [];

        if ($category && $category !== 'All') {
            $where[] = 'category = ?';
            $params[] = $category;
        }

        if ($search) {
            $where[] = '(name LIKE ? OR tagline LIKE ? OR description LIKE ?)';
            $like = '%' . $search . '%';
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }

        $sql = "SELECT id, name, tagline, description, category, download_type, download_url,
                       file_size, version, os_support, thumbnail, downloads_count, featured,
                       author, created_at, updated_at
                FROM developer_tools
                WHERE " . implode(' AND ', $where) . "
                ORDER BY featured DESC, created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $tools = array_map(function($t) {
            return [
                'id'            => $t['id'],
                'name'          => $t['name'],
                'tagline'       => $t['tagline'] ?? '',
                'description'   => $t['description'] ?? '',
                'category'      => $t['category'] ?? 'Utilities',
                'downloadType'  => $t['download_type'] ?? 'zip',
                'downloadUrl'   => $t['download_url'],
                'fileSize'      => $t['file_size'] ?? '',
                'version'       => $t['version'] ?? 'v1.0.0',
                'osSupport'     => $t['os_support'] ? array_map('trim', explode(',', $t['os_support'])) : ['Windows', 'macOS', 'Linux'],
                'thumbnail'     => $t['thumbnail'] ?: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
                'downloadsCount'=> (int)($t['downloads_count'] ?? 0),
                'featured'      => (bool)($t['featured'] ?? false),
                'author'        => $t['author'] ?? 'Yaswant Team',
                'createdAt'     => $t['created_at'],
                'updatedAt'     => $t['updated_at'] ?? $t['created_at'],
            ];
        }, $rows);

        ok($tools, 'Developer tools retrieved');
    } catch (Throwable $e) {
        ok([], 'No developer tools found');
    }
}

ok([], 'No developer tools available');

