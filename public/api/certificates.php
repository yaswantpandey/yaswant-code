<?php
/**
 * Yaswant Code LMS — Certificates API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoints:
 *   GET ?user_id=X                — List student certificates
 *   GET ?code=YASWANT-XXXXX       — Verify certificate (public)
 *   GET ?credential_id=XXXXX      — Verify by credential ID (public)
 *   POST                          — Issue certificate on course completion (auth)
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// ─── GET ────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $pdo = require_db();

    $code         = trim($_GET['code'] ?? '');
    $credentialId = trim($_GET['credential_id'] ?? '');
    $userId       = trim($_GET['user_id'] ?? '');

    // Verify by code or credential_id (public endpoint)
    if ($code || $credentialId) {
        $val  = $code ?: $credentialId;
        $stmt = $pdo->prepare('
            SELECT cert.*,
                   c.title      AS course_title,
                   c.category   AS course_category,
                   c.thumbnail  AS course_thumbnail,
                   c.difficulty AS course_difficulty,
                   u.name       AS student_name,
                   u.email      AS student_email,
                   inst.name    AS instructor_name,
                   inst.title   AS instructor_title
            FROM certificates cert
            JOIN courses c   ON cert.course_id = c.id
            JOIN users u     ON cert.user_id   = u.id
            JOIN users inst  ON c.instructor_id = inst.id
            WHERE cert.verification_code = ? OR cert.credential_id = ?
        ');
        $stmt->execute([$val, $val]);
        $cert = $stmt->fetch();

        if (!$cert) fail('Certificate not found or verification code is invalid.', 404);
        ok($cert, 'Certificate verified');
    }

    // User certificate listing
    if ($userId) {
        $stmt = $pdo->prepare('
            SELECT cert.*,
                   c.title      AS course_title,
                   c.category   AS course_category,
                   c.thumbnail  AS course_thumbnail,
                   c.difficulty AS course_difficulty,
                   inst.name    AS instructor_name,
                   inst.title   AS instructor_title
            FROM certificates cert
            JOIN courses c   ON cert.course_id  = c.id
            JOIN users inst  ON c.instructor_id = inst.id
            WHERE cert.user_id = ?
            ORDER BY cert.issue_date DESC
        ');
        $stmt->execute([$userId]);
        ok($stmt->fetchAll());
    }

    // Return verified public certificates registry
    $stmt = $pdo->query('
        SELECT cert.*,
               c.title      AS course_title,
               c.category   AS course_category,
               c.thumbnail  AS course_thumbnail,
               c.difficulty AS course_difficulty,
               u.name       AS student_name,
               inst.name    AS instructor_name,
               inst.title   AS instructor_title
        FROM certificates cert
        JOIN courses c   ON cert.course_id  = c.id
        JOIN users u     ON cert.user_id    = u.id
        JOIN users inst  ON c.instructor_id = inst.id
        ORDER BY cert.issue_date DESC
        LIMIT 50
    ');
    ok($stmt->fetchAll());
}

// ─── POST — Issue Certificate ───────────────────────────────────────────────
if ($method === 'POST') {
    $user  = require_auth();
    $input = get_json_input();
    $pdo   = require_db();

    $requestedUserId = str_input($input, 'user_id');
    $userId = (in_array($user['role'], ['admin', 'instructor'], true) && $requestedUserId)
        ? $requestedUserId
        : $user['id'];
    $courseId = str_input($input, 'course_id');

    if (!$courseId) fail('course_id is required.', 422);

    // Verify course exists
    $cStmt = $pdo->prepare('SELECT id, title FROM courses WHERE id = ? AND is_deleted = 0');
    $cStmt->execute([$courseId]);
    if (!$cStmt->fetch()) fail('Course not found.', 404);

    // Check if already issued
    $existing = $pdo->prepare('SELECT id, credential_id, verification_code FROM certificates WHERE user_id = ? AND course_id = ?');
    $existing->execute([$userId, $courseId]);
    $cert = $existing->fetch();
    if ($cert) {
        ok([
            'certificateId'    => $cert['id'],
            'credentialId'     => $cert['credential_id'],
            'verificationCode' => $cert['verification_code'],
            'already_issued'   => true,
        ], 'Certificate already issued');
    }

    // Check enrollment exists and is complete (≥ 80% progress)
    $enrStmt = $pdo->prepare('SELECT progress_percent FROM enrollments WHERE user_id = ? AND course_id = ?');
    $enrStmt->execute([$userId, $courseId]);
    $enr = $enrStmt->fetch();
    if (!$enr) fail('User is not enrolled in this course.', 403);

    // Allow admin/instructor to issue without 100% completion check
    if ($user['role'] === 'student' && (int)$enr['progress_percent'] < 80) {
        fail('Course must be at least 80% complete to receive a certificate.', 403);
    }

    $certId          = generate_id('cert');
    $credentialId    = 'YASWANT-' . strtoupper(bin2hex(random_bytes(5)));
    $verificationCode = bin2hex(random_bytes(20));
    $grade           = $input['grade'] ?? 'A+';

    $pdo->prepare('
        INSERT INTO certificates
          (id, course_id, user_id, credential_id, grade, issue_date, verification_code)
        VALUES (?, ?, ?, ?, ?, CURDATE(), ?)
    ')->execute([$certId, $courseId, $userId, $credentialId, $grade, $verificationCode]);

    // Mark enrollment as completed if not already
    $pdo->prepare(
        'UPDATE enrollments SET progress_percent = 100, completed_at = NOW() WHERE user_id = ? AND course_id = ? AND completed_at IS NULL'
    )->execute([$userId, $courseId]);

    ok([
        'certificateId'    => $certId,
        'credentialId'     => $credentialId,
        'verificationCode' => $verificationCode,
        'verificationUrl'  => PLATFORM_URL . '/certificates?code=' . $verificationCode,
    ], 'Certificate issued successfully!', 201);
}

fail('Invalid request.', 405);
