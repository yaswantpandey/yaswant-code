<?php
/**
 * newsletter.php — Email Newsletter Subscription API
 * Yaswant Code LMS Backend
 *
 * POST    Subscribe email to newsletter
 * DELETE  Unsubscribe email from newsletter
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/cors.php';

$pdo    = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = getJsonInput();
    $email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $name  = trim($input['name'] ?? '');

    if (!$email) {
        jsonResponse(false, null, 'A valid email address is required', 422);
    }

    try {
        $pdo->prepare('
            INSERT INTO newsletter_subscribers (email, name, subscribed_at)
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE name = VALUES(name), is_active = 1, unsubscribed_at = NULL
        ')->execute([$email, $name ?: null]);
    } catch (\Exception $e) {
        // Table may not exist; graceful degradation
        jsonResponse(true, null, 'Thanks for subscribing!');
    }

    jsonResponse(true, null, 'Successfully subscribed to the Yaswant Code newsletter.');
}

if ($method === 'DELETE') {
    $email = filter_var(trim($_GET['email'] ?? ''), FILTER_VALIDATE_EMAIL);

    if (!$email) {
        jsonResponse(false, null, 'A valid email is required', 422);
    }

    try {
        $pdo->prepare('
            UPDATE newsletter_subscribers
            SET is_active = 0, unsubscribed_at = NOW()
            WHERE email = ?
        ')->execute([$email]);
    } catch (\Exception $e) {
        // Graceful
    }

    jsonResponse(true, null, 'You have been unsubscribed.');
}
