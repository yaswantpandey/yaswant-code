<?php
/**
 * contact.php — Contact Form & Message API
 * Yaswant Code LMS Backend
 *
 * POST  Send a contact message (optionally saves to DB or emails admin)
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/cors.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = getJsonInput();
    $name = trim($input['name'] ?? '');
    $email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $message = trim($input['message'] ?? '');
    $subject = trim($input['subject'] ?? 'General Inquiry');

    if (!$name || !$email || !$message) {
        jsonResponse(false, null, 'name, email, and message are required', 422);
    }
    if (strlen($message) < 10) {
        jsonResponse(false, null, 'Message must be at least 10 characters', 422);
    }

    // Optional: log to a contact_messages table if it exists
    try {
        $pdo = Database::getConnection();
        $pdo->prepare('
            INSERT INTO contact_messages (name, email, subject, message, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ')->execute([$name, $email, $subject, $message]);
    } catch (\Exception $e) {
        // Table may not exist in all environments — silently continue
    }

    // Optional: send email to admin using PHP mail() or a transactional service
    $adminEmail = getenv('ADMIN_EMAIL') ?: 'contact@yaswant.co.in';
    $emailBody = "Name: {$name}\nEmail: {$email}\nSubject: {$subject}\n\n{$message}";

    @mail(
        $adminEmail,
        "[Yaswant Code] Contact: {$subject}",
        $emailBody,
        "From: noreply@yaswant.co.in\r\nReply-To: {$email}"
    );

    jsonResponse(true, null, 'Message received. We\'ll respond within 24 hours.', 201);
}
