<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/cors.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $code = $_GET['code'] ?? null;
    $userId = $_GET['user_id'] ?? null;

    if ($code) {
        $stmt = $pdo->prepare("
            SELECT cert.*, c.title AS course_title, u.name AS student_name, inst.name AS instructor_name
            FROM certificates cert
            JOIN courses c ON cert.course_id = c.id
            JOIN users u ON cert.user_id = u.id
            JOIN users inst ON c.instructor_id = inst.id
            WHERE cert.verification_code = ? OR cert.credential_id = ?
        ");
        $stmt->execute([$code, $code]);
        $cert = $stmt->fetch();

        if (!$cert) {
            jsonResponse(false, null, 'Certificate not found or verification invalid', 404);
        }

        jsonResponse(true, $cert);
    }

    if ($userId) {
        $stmt = $pdo->prepare("
            SELECT cert.*, c.title AS course_title, inst.name AS instructor_name
            FROM certificates cert
            JOIN courses c ON cert.course_id = c.id
            JOIN users inst ON c.instructor_id = inst.id
            WHERE cert.user_id = ?
            ORDER BY cert.issue_date DESC
        ");
        $stmt->execute([$userId]);
        jsonResponse(true, $stmt->fetchAll());
    }

    jsonResponse(false, null, 'Provide either ?code= or ?user_id=', 400);
}

if ($method === 'POST') {
    $input = getJsonInput();
    $userId = $input['user_id'] ?? null;
    $courseId = $input['course_id'] ?? null;

    if (!$userId || !$courseId) {
        jsonResponse(false, null, 'user_id and course_id required', 422);
    }

    $certId = 'cert-' . uniqid();
    $credentialId = 'YASWANT-' . strtoupper(substr(md5(uniqid()), 0, 10));
    $verificationCode = bin2hex(random_bytes(16));

    $stmt = $pdo->prepare("
        INSERT INTO certificates (id, course_id, user_id, credential_id, grade, issue_date, verification_code)
        VALUES (?, ?, ?, ?, 'A+', CURDATE(), ?)
    ");
    $stmt->execute([$certId, $courseId, $userId, $credentialId, $verificationCode]);

    jsonResponse(true, [
        'certificateId' => $certId,
        'credentialId' => $credentialId,
        'verificationCode' => $verificationCode,
    ], 'Certificate issued successfully', 201);
}
