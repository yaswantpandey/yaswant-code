<?php
/**
 * quizzes.php — Quiz & Assessment API
 * Yaswant Code LMS Backend
 *
 * GET  ?quiz_id=X              Get quiz with questions (no answers exposed)
 * GET  ?course_id=X            List quiz stubs for a course
 * GET  ?action=history&user_id=X  Quiz attempt history for a user
 * POST ?action=submit          Submit quiz answers and get scored results
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

    // History
    if ($action === 'history') {
        $userId = $_GET['user_id'] ?? requireAuth();
        $stmt   = $pdo->prepare('
            SELECT qa.id, qa.quiz_id, qa.score, qa.passed, qa.attempted_at,
                   q.title AS quiz_title, q.passing_score,
                   c.id AS course_id, c.title AS course_title
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.id
            JOIN courses  c ON q.course_id = c.id
            WHERE qa.user_id = ?
            ORDER BY qa.attempted_at DESC
        ');
        $stmt->execute([$userId]);
        jsonResponse(true, $stmt->fetchAll());
    }

    // Quiz by id
    $quizId   = $_GET['quiz_id']   ?? null;
    $courseId = $_GET['course_id'] ?? null;

    if ($quizId) {
        $stmt = $pdo->prepare('SELECT * FROM quizzes WHERE id = ?');
        $stmt->execute([$quizId]);
        $quiz = $stmt->fetch();
        if (!$quiz) {
            jsonResponse(false, null, 'Quiz not found', 404);
        }

        // Questions — DO NOT expose correct_option_index or explanation to client
        $qStmt = $pdo->prepare('
            SELECT id, question, options_json AS options, order_index
            FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC
        ');
        $qStmt->execute([$quizId]);
        $questions = $qStmt->fetchAll();

        // Decode JSON options
        foreach ($questions as &$q) {
            $q['options'] = json_decode($q['options'], true) ?? [];
        }
        unset($q);

        $quiz['questions'] = $questions;
        jsonResponse(true, $quiz);
    }

    if ($courseId) {
        $stmt = $pdo->prepare('
            SELECT id, title, duration_minutes, passing_score
            FROM quizzes WHERE course_id = ?
        ');
        $stmt->execute([$courseId]);
        jsonResponse(true, $stmt->fetchAll());
    }

    jsonResponse(false, null, 'Provide ?quiz_id= or ?course_id= or ?action=history', 400);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — Submit quiz
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'submit') {
    $userId = requireAuth();
    $input  = getJsonInput();
    $quizId = $input['quiz_id'] ?? null;
    $answers = $input['answers'] ?? [];   // [{question_id, selected_index}]

    if (!$quizId) {
        jsonResponse(false, null, 'quiz_id is required', 422);
    }
    if (empty($answers) || !is_array($answers)) {
        jsonResponse(false, null, 'answers array is required', 422);
    }

    // Fetch quiz meta
    $qStmt = $pdo->prepare('SELECT * FROM quizzes WHERE id = ?');
    $qStmt->execute([$quizId]);
    $quiz = $qStmt->fetch();
    if (!$quiz) {
        jsonResponse(false, null, 'Quiz not found', 404);
    }

    // Fetch all questions with answers
    $qqStmt = $pdo->prepare('SELECT * FROM quiz_questions WHERE quiz_id = ?');
    $qqStmt->execute([$quizId]);
    $questions = $qqStmt->fetchAll();

    // Map question_id → question row for fast lookup
    $questionMap = [];
    foreach ($questions as $q) {
        $questionMap[$q['id']] = $q;
    }

    // Grade answers
    $correct = 0;
    $results = [];
    $answeredIds = [];

    $answerMap = [];
    foreach ($answers as $a) {
        if (isset($a['question_id'])) {
            $answerMap[$a['question_id']] = (int)($a['selected_index'] ?? -1);
        }
    }

    foreach ($questions as $q) {
        $options        = json_decode($q['options_json'], true) ?? [];
        $selected       = $answerMap[$q['id']] ?? null;
        $correctIdx     = (int)$q['correct_option_index'];
        $isCorrect      = ($selected !== null && $selected === $correctIdx);

        if ($isCorrect) $correct++;

        $results[] = [
            'question_id'    => $q['id'],
            'question'       => $q['question'],
            'options'        => $options,
            'your_answer'    => $selected !== null ? ($options[$selected] ?? null) : null,
            'correct_answer' => $options[$correctIdx] ?? null,
            'is_correct'     => $isCorrect,
            'explanation'    => $q['explanation'],
        ];
    }

    $total   = count($questions);
    $score   = $total > 0 ? (int)round(($correct / $total) * 100) : 0;
    $passed  = $score >= (int)$quiz['passing_score'];

    // Persist attempt
    $pdo->prepare('
        INSERT INTO quiz_attempts (user_id, quiz_id, score, passed)
        VALUES (?, ?, ?, ?)
    ')->execute([$userId, $quizId, $score, $passed ? 1 : 0]);

    jsonResponse(true, [
        'score'        => $score,
        'passed'       => $passed,
        'passing_score'=> (int)$quiz['passing_score'],
        'correct'      => $correct,
        'total'        => $total,
        'results'      => $results,
    ]);
}
