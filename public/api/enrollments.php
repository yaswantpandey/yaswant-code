<?php
/**
 * Yaswant Code LMS — Enrollments & Progress API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoints:
 *   GET    ?user_id=X             — List enrollments for a user
 *   GET    ?user_id=X&course_id=Y — Single enrollment status
 *   POST                          — Enroll user in course (auth required)
 *   PUT    ?action=progress       — Update lesson progress (auth required)
 *   POST   ?action=complete_lesson — Mark a lesson complete (auth required)
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = strtolower(trim($_GET['action'] ?? ''));

// ─── GET — Enrollment status / listing ─────────────────────────────────────
if ($method === 'GET') {
    $currentUser = auth_user();
    $userId   = trim($_GET['user_id'] ?? '') ?: ($currentUser['id'] ?? '');
    $courseId = trim($_GET['course_id'] ?? '');

    if (!$userId) {
        ok([]);
    }

    if ($currentUser && $currentUser['id'] !== $userId && !in_array($currentUser['role'], ['admin', 'instructor'], true)) {
        fail('Access denied to other users\' enrollment records.', 403);
    }

    $pdo = require_db();

    // Single enrollment check
    if ($courseId) {
        $stmt = $pdo->prepare('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?');
        $stmt->execute([$userId, $courseId]);
        $row = $stmt->fetch();
        ok($row ?: null);
    }

    // All enrollments for user with course info
    $stmt = $pdo->prepare('
        SELECT e.id, e.user_id, e.course_id, e.progress_percent, e.current_lesson_id,
               e.enrolled_at, e.completed_at,
               c.title, c.thumbnail, c.category, c.duration_hours, c.lessons_count,
               c.difficulty, c.has_certificate,
               u.name AS instructor_name, u.avatar AS instructor_avatar
        FROM enrollments e
        JOIN courses c  ON e.course_id = c.id
        JOIN users u    ON c.instructor_id = u.id
        WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC
    ');
    $stmt->execute([$userId]);
    $enrollments = $stmt->fetchAll();

    foreach ($enrollments as &$enr) {
        $enr['progress_percent'] = (int)$enr['progress_percent'];
        $enr['duration_hours']   = (int)$enr['duration_hours'];
        $enr['lessons_count']    = (int)$enr['lessons_count'];
        $enr['has_certificate']  = (bool)$enr['has_certificate'];

        // Count completed lessons for this enrollment
        $compStmt = $pdo->prepare('
            SELECT COUNT(*) AS completed
            FROM lesson_completions lc
            JOIN lessons l  ON lc.lesson_id = l.id
            JOIN chapters ch ON l.chapter_id = ch.id
            JOIN modules m   ON ch.module_id = m.id
            WHERE lc.user_id = ? AND m.course_id = ?
        ');
        $compStmt->execute([$userId, $enr['course_id']]);
        $enr['completed_lessons'] = (int)$compStmt->fetchColumn();
    }
    unset($enr);

    ok($enrollments);
}

// ─── POST — Enroll in course / Mark lesson complete ────────────────────────
if ($method === 'POST') {
    $user  = require_auth();
    $input = get_json_input();
    $pdo   = require_db();

    // ── Mark lesson complete ──────────────────────────────────────────────
    if ($action === 'complete_lesson') {
        $lessonId = str_input($input, 'lesson_id');
        $courseId = str_input($input, 'course_id');

        if (!$lessonId || !$courseId) fail('lesson_id and course_id are required.', 422);

        // Verify enrollment
        $enrStmt = $pdo->prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?');
        $enrStmt->execute([$user['id'], $courseId]);
        if (!$enrStmt->fetch()) fail('You are not enrolled in this course.', 403);

        // Insert completion (ignore duplicate)
        $pdo->prepare(
            'INSERT IGNORE INTO lesson_completions (user_id, lesson_id) VALUES (?, ?)'
        )->execute([$user['id'], $lessonId]);

        // Recalculate progress
        $totalStmt = $pdo->prepare('
            SELECT COUNT(*) FROM lessons l
            JOIN chapters ch ON l.chapter_id = ch.id
            JOIN modules m   ON ch.module_id = m.id
            WHERE m.course_id = ?
        ');
        $totalStmt->execute([$courseId]);
        $total = (int)$totalStmt->fetchColumn();

        $doneStmt = $pdo->prepare('
            SELECT COUNT(*) FROM lesson_completions lc
            JOIN lessons l   ON lc.lesson_id = l.id
            JOIN chapters ch ON l.chapter_id = ch.id
            JOIN modules m   ON ch.module_id = m.id
            WHERE lc.user_id = ? AND m.course_id = ?
        ');
        $doneStmt->execute([$user['id'], $courseId]);
        $done = (int)$doneStmt->fetchColumn();

        $progress   = $total > 0 ? (int)round($done / $total * 100) : 0;
        $completed  = $progress >= 100 ? date('Y-m-d H:i:s') : null;

        $pdo->prepare(
            'UPDATE enrollments SET progress_percent = ?, current_lesson_id = ?, completed_at = ? 
             WHERE user_id = ? AND course_id = ?'
        )->execute([$progress, $lessonId, $completed, $user['id'], $courseId]);

        ok([
            'progress_percent'   => $progress,
            'completed_lessons'  => $done,
            'total_lessons'      => $total,
            'course_completed'   => $progress >= 100,
        ], 'Lesson marked complete');
    }

    // ── Enroll ────────────────────────────────────────────────────────────
    $userId   = str_input($input, 'user_id') ?: $user['id'];
    $courseId = str_input($input, 'course_id');

    if (!$courseId) fail('course_id is required.', 422);

    // Verify course exists
    $cStmt = $pdo->prepare('SELECT id, price FROM courses WHERE id = ? AND is_deleted = 0');
    $cStmt->execute([$courseId]);
    $course = $cStmt->fetch();
    if (!$course) fail('Course not found.', 404);

    // Check already enrolled
    $chkStmt = $pdo->prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?');
    $chkStmt->execute([$userId, $courseId]);
    if ($chkStmt->fetch()) {
        ok(['enrolled' => true, 'already_enrolled' => true], 'Already enrolled in this course');
    }

    $pdo->prepare(
        'INSERT INTO enrollments (user_id, course_id, progress_percent) VALUES (?, ?, 0)'
    )->execute([$userId, $courseId]);

    // Increment students count
    $pdo->prepare('UPDATE courses SET students_count = students_count + 1 WHERE id = ?')
        ->execute([$courseId]);

    // Increment instructor student count
    $pdo->prepare('
        UPDATE users SET students_count = students_count + 1
        WHERE id = (SELECT instructor_id FROM courses WHERE id = ?)
    ')->execute([$courseId]);

    ok(['enrolled' => true, 'already_enrolled' => false], 'Enrolled successfully!', 201);
}

// ─── PUT — Update progress manually ────────────────────────────────────────
if ($method === 'PUT') {
    $user  = require_auth();
    $input = get_json_input();
    $pdo   = require_db();

    $courseId        = str_input($input, 'course_id');
    $currentLessonId = str_input($input, 'current_lesson_id');
    $progress        = int_input($input, 'progress_percent', -1);

    if (!$courseId) fail('course_id is required.', 422);

    $sets = []; $vals = [];
    if ($currentLessonId) { $sets[] = 'current_lesson_id = ?'; $vals[] = $currentLessonId; }
    if ($progress >= 0)   { $sets[] = 'progress_percent = ?';  $vals[] = min(100, $progress); }

    if (empty($sets)) fail('No update fields provided.', 422);

    $vals[] = $user['id'];
    $vals[] = $courseId;
    $pdo->prepare('UPDATE enrollments SET ' . implode(', ', $sets) . ' WHERE user_id = ? AND course_id = ?')
        ->execute($vals);

    ok(null, 'Progress updated');
}

fail('Invalid request.', 405);
