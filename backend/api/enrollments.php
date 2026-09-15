<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/cors.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = $_GET['user_id'] ?? null;
    if (!$userId) {
        jsonResponse(false, null, 'user_id query parameter is required', 400);
    }

    $stmt = $pdo->prepare("
        SELECT e.*, c.title, c.thumbnail, c.category, c.duration_hours, c.lessons_count,
               u.name AS instructor_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON c.instructor_id = u.id
        WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC
    ");
    $stmt->execute([$userId]);
    $enrollments = $stmt->fetchAll();

    jsonResponse(true, $enrollments);
}

if ($method === 'POST') {
    $input = getJsonInput();
    $userId = $input['user_id'] ?? null;
    $courseId = $input['course_id'] ?? null;

    if (!$userId || !$courseId) {
        jsonResponse(false, null, 'user_id and course_id required', 422);
    }

    $stmt = $pdo->prepare("
        INSERT INTO enrollments (user_id, course_id, progress_percent)
        VALUES (?, ?, 0)
        ON DUPLICATE KEY UPDATE progress_percent = progress_percent
    ");
    $stmt->execute([$userId, $courseId]);

    // Increment students count
    $upd = $pdo->prepare("UPDATE courses SET students_count = students_count + 1 WHERE id = ?");
    $upd->execute([$courseId]);

    jsonResponse(true, ['enrolled' => true], 'Enrolled in course successfully');
}
