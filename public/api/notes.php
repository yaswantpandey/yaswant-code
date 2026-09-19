<?php
/**
 * Yaswant Code LMS — Public Study Notes API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoints:
 *   GET /api/notes.php               — List all active study notes
 *   GET /api/notes.php?category=...  — Filter by subject category
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
            $where[] = '(title LIKE ? OR topic LIKE ? OR description LIKE ? OR tags LIKE ?)';
            $like = '%' . $search . '%';
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }

        $sql = "SELECT id, title, topic, category, resource_type, url, file_size, thumbnail,
                       description, author, pinned, starred, tags, created_at, updated_at
                FROM study_notes
                WHERE " . implode(' AND ', $where) . "
                ORDER BY pinned DESC, created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $notes = array_map(function($n) {
            return [
                'id'           => $n['id'],
                'title'        => $n['title'],
                'topic'        => $n['topic'] ?? '',
                'courseOrTopic'=> $n['topic'] ?? '',
                'category'     => $n['category'] ?? 'General',
                'resourceType' => $n['resource_type'] ?? 'pdf',
                'url'          => $n['url'],
                'fileSize'     => $n['file_size'] ?? '',
                'thumbnail'    => $n['thumbnail'] ?: 'https://images.unsplash.com/photo-1516116211227-bbc13c6b2452?w=800&auto=format&fit=crop&q=80',
                'description'  => $n['description'] ?? '',
                'author'       => $n['author'] ?? 'Yaswant Pandey',
                'pinned'       => (bool)($n['pinned'] ?? false),
                'starred'      => (bool)($n['starred'] ?? false),
                'tags'         => $n['tags'] ? array_map('trim', explode(',', $n['tags'])) : [],
                'createdAt'    => $n['created_at'],
                'updatedAt'    => $n['updated_at'] ?? $n['created_at'],
            ];
        }, $rows);

        ok($notes, 'Study notes retrieved');
    } catch (Throwable $e) {
        ok([], 'No study notes found');
    }
}

ok([], 'No study notes available');

