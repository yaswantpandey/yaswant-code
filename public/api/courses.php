<?php
/**
 * Hostinger PHP Courses Catalog Endpoint
 * URL: /api/courses.php
 */

require_once __DIR__ . '/config.php';

// If MySQL database exists, query from table; otherwise return high-velocity architecture defaults
$courses = [];
$pdo = get_db_connection();

if ($pdo !== null) {
    try {
        $stmt = $pdo->query("SELECT * FROM courses ORDER BY id DESC LIMIT 50");
        $courses = $stmt->fetchAll();
    } catch (Exception $e) {
        $courses = [];
    }
}

if (empty($courses)) {
    // Standard LMS Course Catalog Payload
    $courses = [
        [
            'id'          => 'c1',
            'title'       => 'Advanced React 19 & Distributed Next.js 15 Architectures',
            'instructor'  => 'Elena Rostova',
            'level'       => 'Advanced',
            'duration'    => '36 Hours',
            'rating'      => 4.95,
            'category'    => 'Full-Stack Architecture',
            'enrolled'    => 14850
        ],
        [
            'id'          => 'c2',
            'title'       => 'Production LLM Engineering, Vector Search & RAG Systems',
            'instructor'  => 'Dr. Aris Vance',
            'level'       => 'Staff / Principal',
            'duration'    => '42 Hours',
            'rating'      => 4.98,
            'category'    => 'AI & Machine Learning',
            'enrolled'    => 18200
        ],
        [
            'id'          => 'c3',
            'title'       => 'High-Throughput Distributed Systems with Go & Raft',
            'instructor'  => 'Marcus Thorne',
            'level'       => 'Advanced',
            'duration'    => '28 Hours',
            'rating'      => 4.92,
            'category'    => 'Distributed Systems',
            'enrolled'    => 9650
        ]
    ];
}

json_response([
    'status'  => 'ok',
    'total'   => count($courses),
    'courses' => $courses
]);
