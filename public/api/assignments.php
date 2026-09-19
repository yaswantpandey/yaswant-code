<?php
/**
 * Yaswant Code LMS — Assignments API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoints:
 *   GET  ?course_id=X             — List assignments for a course
 *   GET  ?user_id=X               — List student submission statuses
 *   GET  ?assignment_id=X         — Single assignment detail
 *   POST ?action=submit           — Submit an assignment (student, auth required)
 *   PUT  ?action=grade            — Grade a submission (instructor/admin, auth required)
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = strtolower(trim($_GET['action'] ?? ''));

// ─── GET ────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $pdo          = require_db();
    $courseId     = trim($_GET['course_id'] ?? '');
    $userId       = trim($_GET['user_id'] ?? '');
    $assignmentId = trim($_GET['assignment_id'] ?? '');

    // Single assignment
    if ($assignmentId) {
        $stmt = $pdo->prepare('
            SELECT a.*,
                   s.id AS submission_id, s.status AS submission_status,
                   s.github_url, s.submitted_file, s.grade, s.feedback,
                   s.submitted_at, s.reviewed_at
            FROM assignments a
            LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.user_id = ?
            WHERE a.id = ?
        ');
        $userCtx = auth_user();
        $stmt->execute([$userCtx['id'] ?? '', $assignmentId]);
        $row = $stmt->fetch();
        if (!$row) fail('Assignment not found.', 404);
        ok($row);
    }

    // All assignments for a course, joined with user's submission if user_id provided
    if ($courseId) {
        if ($userId) {
            $currentUser = require_auth();
            if ($currentUser['id'] !== $userId && !in_array($currentUser['role'], ['admin', 'instructor'], true)) {
                fail('Access denied to other users\' submissions.', 403);
            }
            $stmt = $pdo->prepare('
                SELECT a.*,
                       s.id AS submission_id, s.status AS submission_status,
                       s.github_url, s.submitted_file, s.grade, s.feedback,
                       s.submitted_at, s.reviewed_at
                FROM assignments a
                LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.user_id = ?
                WHERE a.course_id = ?
                ORDER BY a.id ASC
            ');
            $stmt->execute([$userId, $courseId]);
        } else {
            $stmt = $pdo->prepare('SELECT * FROM assignments WHERE course_id = ? ORDER BY id ASC');
            $stmt->execute([$courseId]);
        }
        ok($stmt->fetchAll());
    }

    // All submissions for a user (Requires authentication + ownership or staff permissions)
    if ($userId) {
        $currentUser = require_auth();
        if ($currentUser['id'] !== $userId && !in_array($currentUser['role'], ['admin', 'instructor'], true)) {
            fail('Access denied to other users\' submissions.', 403);
        }
        $stmt = $pdo->prepare('
            SELECT s.*, a.title AS assignment_title, a.difficulty,
                   c.title AS course_title, c.id AS course_id
            FROM assignment_submissions s
            JOIN assignments a ON s.assignment_id = a.id
            JOIN courses c     ON a.course_id = c.id
            WHERE s.user_id = ?
            ORDER BY s.submitted_at DESC
        ');
        $stmt->execute([$userId]);
        ok($stmt->fetchAll());
    }

    fail('Provide ?course_id=, ?user_id=, or ?assignment_id=', 400);
}

// ─── POST — Submit Assignment ───────────────────────────────────────────────
if ($method === 'POST' && $action === 'submit') {
    $user  = require_auth();
    $input = get_json_input();
    $pdo   = require_db();

    $assignmentId = str_input($input, 'assignment_id');
    if (!$assignmentId) fail('assignment_id is required.', 422);

    // Verify assignment exists
    $aStmt = $pdo->prepare('SELECT id, course_id FROM assignments WHERE id = ?');
    $aStmt->execute([$assignmentId]);
    if (!$aStmt->fetch()) fail('Assignment not found.', 404);

    $githubUrl = str_input($input, 'github_url');
    $fileUrl   = str_input($input, 'submitted_file');
    $notes     = str_input($input, 'notes');

    if (!$githubUrl && !$fileUrl) fail('Provide a github_url or submitted_file link.', 422);

    // Check for existing submission — update if exists
    $existing = $pdo->prepare('SELECT id FROM assignment_submissions WHERE assignment_id = ? AND user_id = ?');
    $existing->execute([$assignmentId, $user['id']]);
    $sub = $existing->fetch();

    if ($sub) {
        $pdo->prepare('
            UPDATE assignment_submissions
            SET status = "Submitted", github_url = ?, submitted_file = ?, submitted_at = NOW()
            WHERE id = ?
        ')->execute([$githubUrl ?: null, $fileUrl ?: null, $sub['id']]);
        ok(['submission_id' => $sub['id']], 'Assignment resubmitted');
    } else {
        $pdo->prepare('
            INSERT INTO assignment_submissions (assignment_id, user_id, status, github_url, submitted_file)
            VALUES (?, ?, "Submitted", ?, ?)
        ')->execute([$assignmentId, $user['id'], $githubUrl ?: null, $fileUrl ?: null]);
        ok(['submission_id' => $pdo->lastInsertId()], 'Assignment submitted successfully!', 201);
    }
}

// ─── PUT — Grade Submission ─────────────────────────────────────────────────
if ($method === 'PUT' && $action === 'grade') {
    $user  = require_role('instructor', 'admin');
    $input = get_json_input();
    $pdo   = require_db();

    $submissionId = str_input($input, 'submission_id');
    $grade        = str_input($input, 'grade');
    $feedback     = str_input($input, 'feedback');
    $status       = in_array($input['status'] ?? '', ['Completed','Needs Revision','Under Review'])
                    ? $input['status']
                    : 'Completed';

    if (!$submissionId) fail('submission_id is required.', 422);
    if (!$grade)        fail('grade is required.', 422);

    $pdo->prepare('
        UPDATE assignment_submissions
        SET grade = ?, feedback = ?, status = ?, reviewed_at = NOW()
        WHERE id = ?
    ')->execute([$grade, $feedback, $status, $submissionId]);

    ok(null, 'Submission graded');
}

fail('Invalid request.', 405);
