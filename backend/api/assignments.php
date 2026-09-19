<?php
/**
 * assignments.php — Capstone Project Assignments API
 * Yaswant Code LMS Backend
 *
 * GET  ?course_id=X[&user_id=X]   List assignments for a course + submission status
 * GET  ?user_id=X                  All assignments a user has submitted
 * POST ?action=submit              Submit a GitHub URL or file link
 * PUT  ?action=grade               Instructor/admin grades a submission
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth_middleware.php';

$pdo    = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

// ─────────────────────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $courseId = $_GET['course_id'] ?? null;
    $userId   = $_GET['user_id']   ?? null;

    if ($courseId) {
        $stmt = $pdo->prepare('SELECT * FROM assignments WHERE course_id = ?');
        $stmt->execute([$courseId]);
        $assignments = $stmt->fetchAll();

        // Attach submission status if user_id provided
        if ($userId && !empty($assignments)) {
            foreach ($assignments as &$assignment) {
                $subStmt = $pdo->prepare('
                    SELECT id, status, github_url, submitted_file, grade, feedback,
                           submitted_at, reviewed_at
                    FROM assignment_submissions
                    WHERE assignment_id = ? AND user_id = ?
                    ORDER BY submitted_at DESC LIMIT 1
                ');
                $subStmt->execute([$assignment['id'], $userId]);
                $assignment['submission'] = $subStmt->fetch() ?: null;
            }
            unset($assignment);
        }

        jsonResponse(true, $assignments);
    }

    if ($userId) {
        $stmt = $pdo->prepare('
            SELECT s.*, a.title AS assignment_title, a.description, a.deadline, a.difficulty,
                   c.id AS course_id, c.title AS course_title
            FROM assignment_submissions s
            JOIN assignments a ON s.assignment_id = a.id
            JOIN courses c ON a.course_id = c.id
            WHERE s.user_id = ?
            ORDER BY s.submitted_at DESC
        ');
        $stmt->execute([$userId]);
        jsonResponse(true, $stmt->fetchAll());
    }

    jsonResponse(false, null, 'Provide ?course_id= or ?user_id=', 400);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — Submit assignment
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'submit') {
    $userId       = requireAuth();
    $input        = getJsonInput();
    $assignmentId = $input['assignment_id'] ?? null;
    $githubUrl    = $input['github_url']    ?? null;
    $submittedFile = $input['submitted_file'] ?? null;

    if (!$assignmentId) {
        jsonResponse(false, null, 'assignment_id is required', 422);
    }
    if (!$githubUrl && !$submittedFile) {
        jsonResponse(false, null, 'Provide github_url or submitted_file', 422);
    }

    // Validate assignment exists
    $stmt = $pdo->prepare('SELECT id FROM assignments WHERE id = ?');
    $stmt->execute([$assignmentId]);
    if (!$stmt->fetch()) {
        jsonResponse(false, null, 'Assignment not found', 404);
    }

    $stmt = $pdo->prepare('
        INSERT INTO assignment_submissions (assignment_id, user_id, status, github_url, submitted_file)
        VALUES (?, ?, \'Submitted\', ?, ?)
    ');
    $stmt->execute([$assignmentId, $userId, $githubUrl, $submittedFile]);

    jsonResponse(true, [
        'submission_id' => (int)$pdo->lastInsertId(),
    ], 'Assignment submitted successfully', 201);
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT — Grade submission (instructor/admin)
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'PUT' && $action === 'grade') {
    requireAuth(); // Must be authenticated — role check can be added here
    $input        = getJsonInput();
    $submissionId = $input['submission_id'] ?? null;
    $grade        = $input['grade']         ?? null;
    $feedback     = $input['feedback']      ?? null;
    $status       = $input['status']        ?? 'Completed';

    if (!$submissionId || !$grade) {
        jsonResponse(false, null, 'submission_id and grade are required', 422);
    }

    $stmt = $pdo->prepare('
        UPDATE assignment_submissions
        SET grade = ?, feedback = ?, status = ?, reviewed_at = NOW()
        WHERE id = ?
    ');
    $stmt->execute([$grade, $feedback, $status, $submissionId]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(false, null, 'Submission not found', 404);
    }

    jsonResponse(true, null, 'Submission graded successfully');
}
