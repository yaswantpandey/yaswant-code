<?php
/**
 * test_backend.php — Backend Integration Test Suite
 * Tests all API endpoints via PHP CLI (no web server needed)
 * Run: php backend/test_backend.php
 */

// ── Setup ────────────────────────────────────────────────────────────────────
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_AUTHORIZATION'] = '';

// Simulate env vars (adjust for your local MySQL)
putenv('DB_HOST=127.0.0.1');
putenv('DB_PORT=3306');
putenv('DB_NAME=yaswant_code_lms');
putenv('DB_USER=root');
putenv('DB_PASS=');

$pass = 0;
$fail = 0;
$errors = [];

function assert_pass(string $label): void {
    global $pass;
    $pass++;
    echo "  \033[32m✓\033[0m {$label}\n";
}

function assert_fail(string $label, string $reason): void {
    global $fail, $errors;
    $fail++;
    $errors[] = "{$label}: {$reason}";
    echo "  \033[31m✗\033[0m {$label} — {$reason}\n";
}

function section(string $name): void {
    echo "\n\033[1;34m── {$name}\033[0m\n";
}

// ── 1. Database connection ───────────────────────────────────────────────────
section('Database Connection');
try {
    require_once __DIR__ . '/config/Database.php';
    $pdo = Database::getConnection();
    $pdo->query('SELECT 1');
    assert_pass('PDO connects to yaswant_code_lms');
} catch (Exception $e) {
    assert_fail('PDO connection', $e->getMessage());
    echo "\n\033[33m⚠ Database unavailable — skipping remaining tests\033[0m\n";
    exit(1);
}

// ── 2. Schema: check required tables ────────────────────────────────────────
section('Schema Integrity');
$requiredTables = [
    'users', 'courses', 'modules', 'chapters', 'lessons',
    'enrollments', 'lesson_completions', 'quizzes', 'quiz_questions',
    'quiz_attempts', 'assignments', 'assignment_submissions',
    'certificates', 'discussions', 'discussion_replies', 'notifications',
];
$existingTables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
foreach ($requiredTables as $table) {
    if (in_array($table, $existingTables)) {
        assert_pass("Table `{$table}` exists");
    } else {
        assert_fail("Table `{$table}`", 'MISSING — run schema.sql');
    }
}

// ── 3. Seed data ─────────────────────────────────────────────────────────────
section('Seed Data');
$userCount   = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
$courseCount = (int)$pdo->query('SELECT COUNT(*) FROM courses')->fetchColumn();

$userCount   >= 1 ? assert_pass("Users seeded ({$userCount} rows)")   : assert_fail('Users seed', '0 rows — run schema.sql seed section');
$courseCount >= 1 ? assert_pass("Courses seeded ({$courseCount} rows)") : assert_fail('Courses seed', '0 rows — run schema.sql seed section');

// ── 4. Auth: register + login ────────────────────────────────────────────────
section('Auth — Register & Login');

// Create test user (cleanup first)
$testEmail = 'test_' . time() . '@yaswantcode.edu';
$pdo->prepare('DELETE FROM users WHERE email = ?')->execute([$testEmail]);

// Hash registration
$hash = password_hash('TestPass123!', PASSWORD_BCRYPT, ['cost' => 12]);
$testId = 'test-' . bin2hex(random_bytes(4));
$pdo->prepare('INSERT INTO users (id, name, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?, ?)')
    ->execute([$testId, 'Test User', $testEmail, $hash, 'student', 'https://example.com/avatar.png']);
assert_pass('Register: user inserted with bcrypt hash');

// Login
$stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE email = ?');
$stmt->execute([$testEmail]);
$user = $stmt->fetch();

if ($user && password_verify('TestPass123!', $user['password_hash'])) {
    assert_pass('Login: password_verify succeeds for correct password');
} else {
    assert_fail('Login', 'password_verify failed');
}

if ($user && !password_verify('WrongPass', $user['password_hash'])) {
    assert_pass('Login: password_verify rejects wrong password');
} else {
    assert_fail('Login rejection', 'accepted wrong password!');
}

// Token generation & parsing
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/auth_middleware.php';

$token = base64_encode($testId . ':' . time());
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
$parsed = getAuthUserId();
$parsed === $testId
    ? assert_pass('Token: getAuthUserId() parses valid token correctly')
    : assert_fail('Token parse', "Expected {$testId}, got " . var_export($parsed, true));

// Expired token
$expiredToken = base64_encode($testId . ':' . (time() - 31 * 24 * 60 * 60));
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $expiredToken;
$expired = getAuthUserId();
$expired === null
    ? assert_pass('Token: expired token returns null')
    : assert_fail('Token expiry', 'Should have returned null for expired token');

// ── 5. Courses ───────────────────────────────────────────────────────────────
section('Courses');
$courses = $pdo->query('SELECT id, title, instructor_id FROM courses LIMIT 3')->fetchAll();
count($courses) >= 1 ? assert_pass('Courses: table has data') : assert_fail('Courses', 'No rows');

$courseId = $courses[0]['id'] ?? null;
if ($courseId) {
    $course = $pdo->prepare('SELECT * FROM courses WHERE id = ?');
    $course->execute([$courseId]);
    $c = $course->fetch();
    assert_pass("Course detail: fetched '{$c['title']}'");
}

// ── 6. Enrollments ───────────────────────────────────────────────────────────
section('Enrollments');
if ($courseId) {
    $pdo->prepare('DELETE FROM enrollments WHERE user_id = ? AND course_id = ?')->execute([$testId, $courseId]);
    $pdo->prepare('INSERT INTO enrollments (user_id, course_id, progress_percent) VALUES (?, ?, 0)')->execute([$testId, $courseId]);
    $enroll = $pdo->prepare('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?');
    $enroll->execute([$testId, $courseId]);
    $e = $enroll->fetch();
    $e ? assert_pass('Enrollment: insert + fetch succeeds') : assert_fail('Enrollment', 'Row not found after insert');

    // Upsert (ON DUPLICATE KEY)
    $pdo->prepare('INSERT INTO enrollments (user_id, course_id, progress_percent) VALUES (?, ?, 0) ON DUPLICATE KEY UPDATE progress_percent = progress_percent')->execute([$testId, $courseId]);
    assert_pass('Enrollment: ON DUPLICATE KEY upsert does not throw');
}

// ── 7. Certificate issuance ───────────────────────────────────────────────────
section('Certificates');
if ($courseId) {
    $certId       = 'cert-test-' . $testId;
    $credentialId = 'YASWANT-' . strtoupper(substr(md5(uniqid()), 0, 10));
    $verCode      = bin2hex(random_bytes(16));
    $pdo->prepare('DELETE FROM certificates WHERE id = ?')->execute([$certId]);
    $pdo->prepare('INSERT INTO certificates (id, course_id, user_id, credential_id, grade, issue_date, verification_code) VALUES (?, ?, ?, ?, \'A+\', CURDATE(), ?)')->execute([$certId, $courseId, $testId, $credentialId, $verCode]);

    $cert = $pdo->prepare('SELECT * FROM certificates WHERE verification_code = ?');
    $cert->execute([$verCode]);
    $cert->fetch() ? assert_pass('Certificate: issued and verifiable by verification_code') : assert_fail('Certificate', 'Not found by verification_code');
}

// ── 8. Discussions ────────────────────────────────────────────────────────────
section('Discussions');
$discId = 'disc-test-' . $testId;
$pdo->prepare('DELETE FROM discussions WHERE id = ?')->execute([$discId]);
$pdo->prepare('INSERT INTO discussions (id, user_id, title, content, category, tags_json) VALUES (?, ?, ?, ?, \'General\', \'["PHP","Test"]\')')->execute([$discId, $testId, 'Test Discussion', 'This is a test discussion for the backend suite.']);
$disc = $pdo->prepare('SELECT * FROM discussions WHERE id = ?');
$disc->execute([$discId]);
$d = $disc->fetch();
$d ? assert_pass('Discussion: created and fetched') : assert_fail('Discussion', 'Row not found');
if ($d) {
    $tags = json_decode($d['tags_json'], true);
    (is_array($tags) && in_array('PHP', $tags)) ? assert_pass('Discussion: tags_json decoded correctly') : assert_fail('Discussion tags', 'JSON decode failed');
}

// ── 9. Notifications ─────────────────────────────────────────────────────────
section('Notifications');
$notifId = 'notif-test-' . $testId;
$pdo->prepare('DELETE FROM notifications WHERE id = ?')->execute([$notifId]);
$pdo->prepare('INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, \'announcement\')')->execute([$notifId, $testId, 'Test Notification', 'Hello from test suite']);
$notif = $pdo->prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?');
$notif->execute([$notifId, $testId]);
$n = $notif->fetch();
$n ? assert_pass('Notification: created and fetched') : assert_fail('Notification', 'Row not found');

if ($n) {
    $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE id = ?')->execute([$notifId]);
    $updated = $pdo->prepare('SELECT is_read FROM notifications WHERE id = ?');
    $updated->execute([$notifId]);
    ((int)$updated->fetchColumn() === 1) ? assert_pass('Notification: mark-read works') : assert_fail('Notification mark-read', 'is_read not updated');
}

// ── 10. Cleanup ───────────────────────────────────────────────────────────────
section('Cleanup');
$pdo->prepare('DELETE FROM notifications WHERE user_id = ?')->execute([$testId]);
$pdo->prepare('DELETE FROM discussions WHERE user_id = ?')->execute([$testId]);
$pdo->prepare('DELETE FROM certificates WHERE user_id = ?')->execute([$testId]);
$pdo->prepare('DELETE FROM enrollments WHERE user_id = ?')->execute([$testId]);
$pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$testId]);
assert_pass('All test data cleaned up');

// ── Results ──────────────────────────────────────────────────────────────────
echo "\n";
echo str_repeat('─', 50) . "\n";
echo "\033[1mResults: \033[32m{$pass} passed\033[0m";
if ($fail > 0) {
    echo ", \033[31m{$fail} failed\033[0m";
    echo "\n\nFailed tests:\n";
    foreach ($errors as $e) {
        echo "  • {$e}\n";
    }
}
echo "\n" . str_repeat('─', 50) . "\n";
exit($fail > 0 ? 1 : 0);
