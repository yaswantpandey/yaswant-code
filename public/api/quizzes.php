<?php
/**
 * Yaswant Code LMS — Quizzes API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoints:
 *   GET  ?quiz_id=X        — Get quiz questions (options shuffled, no answers)
 *   GET  ?course_id=X      — List quizzes for a course
 *   POST ?action=submit     — Submit answers, get score and results
 *   GET  ?action=history&user_id=X — Get quiz attempt history
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = strtolower(trim($_GET['action'] ?? ''));

// ─── GET ────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $pdo = require_db();
    $quizId = trim($_GET['quiz_id'] ?? '');

    // Attempt history for a user
    if ($action === 'history') {
        $userId = trim($_GET['user_id'] ?? '');
        if (!$userId)
            fail('user_id is required.', 400);

        $stmt = $pdo->prepare('
            SELECT qa.*, q.title AS quiz_title, c.title AS course_title
            FROM quiz_attempts qa
            JOIN quizzes q  ON qa.quiz_id  = q.id
            JOIN courses c  ON q.course_id = c.id
            WHERE qa.user_id = ?
            ORDER BY qa.attempted_at DESC
        ');
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['score'] = (int) $r['score'];
            $r['passed'] = (bool) $r['passed'];
        }
        ok($rows);
    }

    // Quizzes for a course
    if (!$quizId && isset($_GET['course_id'])) {
        $courseId = trim($_GET['course_id']);
        $stmt = $pdo->prepare(
            'SELECT id, title, duration_minutes, passing_score FROM quizzes WHERE course_id = ?'
        );
        $stmt->execute([$courseId]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['duration_minutes'] = (int) $r['duration_minutes'];
            $r['passing_score'] = (int) $r['passing_score'];
        }
        ok($rows);
    }

    // Single quiz with shuffled questions (no correct answers exposed)
    if ($quizId) {
        $stmt = $pdo->prepare('SELECT * FROM quizzes WHERE id = ?');
        $stmt->execute([$quizId]);
        $quiz = $stmt->fetch();
        if (!$quiz)
            fail('Quiz not found.', 404);

        $qStmt = $pdo->prepare(
            'SELECT id, question, options_json, order_index, explanation
             FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC'
        );
        $qStmt->execute([$quizId]);
        $questions = $qStmt->fetchAll();

        foreach ($questions as &$q) {
            $opts = json_decode($q['options_json'], true) ?: [];
            $q['options'] = array_values($opts);
            unset($q['options_json'], $q['explanation']); // don't expose answers
        }
        unset($q);

        ok([
            'id' => $quiz['id'],
            'title' => $quiz['title'],
            'duration_minutes' => (int) $quiz['duration_minutes'],
            'passing_score' => (int) $quiz['passing_score'],
            'questions' => $questions,
        ]);
    }

    // Return all quizzes if no filter specified
    $stmt = $pdo->query('
        SELECT q.id, q.course_id, q.title, q.duration_minutes, q.passing_score, c.title AS course_title
        FROM quizzes q
        JOIN courses c ON q.course_id = c.id
        ORDER BY q.id ASC
    ');
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['duration_minutes'] = (int)$r['duration_minutes'];
        $r['passing_score']    = (int)$r['passing_score'];
    }
    unset($r);
    ok($rows);
}

// ─── POST — Submit Quiz ─────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'submit') {
    $user = require_auth();
    $input = get_json_input();
    $pdo = require_db();

    $quizId = str_input($input, 'quiz_id');
    $answers = $input['answers'] ?? []; // array of ['question_id' => X, 'selected_index' => N]

    if (!$quizId)
        fail('quiz_id is required.', 422);
    if (empty($answers))
        fail('answers array is required.', 422);

    $stmt = $pdo->prepare('SELECT * FROM quizzes WHERE id = ?');
    $stmt->execute([$quizId]);
    $quiz = $stmt->fetch();
    if (!$quiz)
        fail('Quiz not found.', 404);

    // Load all questions with correct answers
    $qStmt = $pdo->prepare(
        'SELECT id, question, options_json, correct_option_index, explanation FROM quiz_questions WHERE quiz_id = ?'
    );
    $qStmt->execute([$quizId]);
    $questions = $qStmt->fetchAll();

    if (empty($questions))
        fail('Quiz has no questions.', 422);

    $totalQ = count($questions);
    $correct = 0;
    $results = [];

    $answerMap = [];
    foreach ($answers as $a) {
        if (isset($a['question_id'])) {
            $answerMap[$a['question_id']] = (int) ($a['selected_index'] ?? -1);
        }
    }

    foreach ($questions as $q) {
        $opts = json_decode($q['options_json'], true) ?: [];
        $correctIdx = (int) $q['correct_option_index'];
        $selectedIdx = $answerMap[$q['id']] ?? -1;
        $isCorrect = $selectedIdx === $correctIdx;

        if ($isCorrect)
            $correct++;

        $results[] = [
            'question_id' => $q['id'],
            'question' => $q['question'],
            'options' => $opts,
            'your_answer' => $selectedIdx >= 0 && $selectedIdx < count($opts) ? $opts[$selectedIdx] : null,
            'correct_answer' => $opts[$correctIdx] ?? null,
            'is_correct' => $isCorrect,
            'explanation' => $q['explanation'],
        ];
    }

    $score = (int) round($correct / $totalQ * 100);
    $passing = (int) ($quiz['passing_score'] ?? 80);
    $passed = $score >= $passing;

    // Store attempt
    $pdo->prepare(
        'INSERT INTO quiz_attempts (user_id, quiz_id, score, passed) VALUES (?, ?, ?, ?)'
    )->execute([$user['id'], $quizId, $score, (int) $passed]);

    ok([
        'score' => $score,
        'passed' => $passed,
        'passing_score' => $passing,
        'correct' => $correct,
        'total' => $totalQ,
        'results' => $results,
    ], $passed ? 'Congratulations! You passed the quiz.' : "You scored {$score}%. Keep trying!");
}

fail('Invalid request.', 405);
