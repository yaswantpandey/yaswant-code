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

$defaultTools = [
    [
        'id'            => 'tool-yt-insta-downloader',
        'name'          => 'Instagram Video Downloader | YouTube Video Downloader',
        'tagline'       => 'High-speed Instagram Reels, Stories & YouTube HD Video/Audio Downloader',
        'description'   => 'Fast, secure online web downloader to save Instagram Reels, videos, IGTV, and YouTube 4K/1080p videos or shorts with high-bitrate MP3 audio with no watermarks.',
        'category'      => 'Utilities',
        'downloadType'  => 'direct',
        'downloadUrl'   => 'https://yt-insta-video-downloader-toy4.onrender.com/',
        'fileSize'      => 'Free Web App',
        'version'       => 'v2.5.0',
        'osSupport'     => ['Cross-Platform', 'Windows', 'macOS', 'Linux'],
        'thumbnail'     => 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
        'downloadsCount'=> 18450,
        'featured'      => true,
        'author'        => 'Yaswant Pandey',
        'createdAt'     => '2026-09-27 12:00:00',
        'updatedAt'     => '2026-09-27 12:00:00',
    ],
    [
        'id'            => 'tool-docker-fullstack',
        'name'          => 'Full-Stack Docker Development Environment',
        'tagline'       => 'Production-ready Node.js, Python, MariaDB & Redis container bundle',
        'description'   => 'Pre-configured Docker Compose environment for rapid full-stack local development with hot reloading and volume persistence.',
        'category'      => 'DevOps & Docker',
        'downloadType'  => 'zip',
        'downloadUrl'   => 'https://github.com/yaswantpandey',
        'fileSize'      => '48 MB • ZIP',
        'version'       => 'v3.2.0',
        'osSupport'     => ['Windows', 'macOS', 'Linux'],
        'thumbnail'     => 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&auto=format&fit=crop&q=80',
        'downloadsCount'=> 4210,
        'featured'      => true,
        'author'        => 'Yaswant Pandey',
        'createdAt'     => '2026-09-26 12:00:00',
        'updatedAt'     => '2026-09-26 12:00:00',
    ],
    [
        'id'            => 'tool-vscode-pack',
        'name'          => 'VS Code Ultimate Web Dev Extension Pack',
        'tagline'       => 'Carefully curated extensions, snippets, and themes for maximum productivity',
        'description'   => 'Complete configuration bundle including settings.json, keybindings, linting rules, and top extensions for React, TypeScript, and Tailwind.',
        'category'      => 'IDE & Editors',
        'downloadType'  => 'drive',
        'downloadUrl'   => 'https://drive.google.com',
        'fileSize'      => '12 MB • Drive',
        'version'       => 'v2026.4',
        'osSupport'     => ['Cross-Platform', 'Windows', 'macOS'],
        'thumbnail'     => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
        'downloadsCount'=> 3890,
        'featured'      => false,
        'author'        => 'Yaswant Pandey',
        'createdAt'     => '2026-09-25 12:00:00',
        'updatedAt'     => '2026-09-25 12:00:00',
    ],
    [
        'id'            => 'tool-db-gui-studio',
        'name'          => 'Universal Database GUI & Query Visualizer',
        'tagline'       => 'Modern lightweight GUI client for MySQL, MariaDB, PostgreSQL & SQLite',
        'description'   => 'Instant SQL query runner, schema diagram generator, and table data exporter with dark mode and zero telemetry.',
        'category'      => 'Database GUI',
        'downloadType'  => 'zip',
        'downloadUrl'   => 'https://github.com/yaswantpandey',
        'fileSize'      => '34 MB • ZIP',
        'version'       => 'v1.9.2',
        'osSupport'     => ['Windows', 'macOS', 'Linux'],
        'thumbnail'     => 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
        'downloadsCount'=> 2950,
        'featured'      => false,
        'author'        => 'Yaswant Pandey',
        'createdAt'     => '2026-09-24 12:00:00',
        'updatedAt'     => '2026-09-24 12:00:00',
    ]
];

$pdo = get_db();

if ($pdo) {
    try {
        // Ensure table exists
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `developer_tools` (
                `id` VARCHAR(64) PRIMARY KEY,
                `name` VARCHAR(255) NOT NULL,
                `tagline` VARCHAR(255) DEFAULT '',
                `description` TEXT DEFAULT NULL,
                `category` VARCHAR(100) DEFAULT 'Utilities',
                `download_type` VARCHAR(50) DEFAULT 'direct',
                `download_url` TEXT NOT NULL,
                `file_size` VARCHAR(100) DEFAULT '',
                `version` VARCHAR(50) DEFAULT 'v1.0.0',
                `os_support` VARCHAR(255) DEFAULT 'Cross-Platform, Windows, macOS, Linux',
                `thumbnail` TEXT DEFAULT NULL,
                `downloads_count` INT DEFAULT 0,
                `featured` TINYINT(1) DEFAULT 0,
                `author` VARCHAR(100) DEFAULT 'Yaswant Pandey',
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Seed default tool if not present
        $seed = $pdo->prepare("
            INSERT IGNORE INTO `developer_tools` 
            (`id`, `name`, `tagline`, `description`, `category`, `download_type`, `download_url`, `file_size`, `version`, `os_support`, `thumbnail`, `downloads_count`, `featured`, `author`)
            VALUES 
            (
                'tool-yt-insta-downloader',
                'Instagram Video Downloader | YouTube Video Downloader',
                'High-speed Instagram Reels, Stories & YouTube HD Video/Audio Downloader',
                'Fast, secure online web downloader to save Instagram Reels, videos, IGTV, and YouTube 4K/1080p videos or shorts with high-bitrate MP3 audio with no watermarks.',
                'Utilities',
                'direct',
                'https://yt-insta-video-downloader-toy4.onrender.com/',
                'Free Web App',
                'v2.5.0',
                'Cross-Platform, Windows, macOS, Linux',
                'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
                18450,
                1,
                'Yaswant Pandey'
            )
        ");
        $seed->execute();

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

        if (!empty($rows)) {
            $tools = array_map(function($t) {
                return [
                    'id'            => $t['id'],
                    'name'          => $t['name'],
                    'tagline'       => $t['tagline'] ?? '',
                    'description'   => $t['description'] ?? '',
                    'category'      => $t['category'] ?? 'Utilities',
                    'downloadType'  => $t['download_type'] ?? 'direct',
                    'downloadUrl'   => $t['download_url'],
                    'fileSize'      => $t['file_size'] ?? '',
                    'version'       => $t['version'] ?? 'v1.0.0',
                    'osSupport'     => $t['os_support'] ? array_map('trim', explode(',', $t['os_support'])) : ['Cross-Platform', 'Windows', 'macOS', 'Linux'],
                    'thumbnail'     => $t['thumbnail'] ?: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
                    'downloadsCount'=> (int)($t['downloads_count'] ?? 0),
                    'featured'      => (bool)($t['featured'] ?? false),
                    'author'        => $t['author'] ?? 'Yaswant Pandey',
                    'createdAt'     => $t['created_at'],
                    'updatedAt'     => $t['updated_at'] ?? $t['created_at'],
                ];
            }, $rows);

            ok($tools, 'Developer tools retrieved');
        }
    } catch (Throwable $e) {
        // Fall through to defaultTools
    }
}

// Filter default tools if category or search was requested
$filtered = array_values(array_filter($defaultTools, function($t) use ($category, $search) {
    if ($category && $category !== 'All' && $t['category'] !== $category) {
        return false;
    }
    if ($search) {
        $s = mb_strtolower($search);
        return str_contains(mb_strtolower($t['name']), $s) ||
               str_contains(mb_strtolower($t['tagline']), $s) ||
               str_contains(mb_strtolower($t['description']), $s);
    }
    return true;
}));

ok($filtered, 'Developer tools retrieved');

