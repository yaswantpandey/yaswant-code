<?php
/**
 * Yaswant Code LMS — Newsletter Subscription API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoint: POST /api/newsletter.php
 *           DELETE /api/newsletter.php  — Unsubscribe
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// ─── POST — Subscribe ───────────────────────────────────────────────────────
if ($method === 'POST') {
    check_rate_limit('newsletter', 5, 3600);

    $input = get_json_input();
    $email = strtolower(trim($input['email'] ?? ''));
    $name  = sanitize(str_input($input, 'name'));

    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail('Please provide a valid email address.', 422);
    }

    $pdo = require_db();

    // Ensure table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS subscribers (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        email          VARCHAR(255) NOT NULL UNIQUE,
        name           VARCHAR(150) DEFAULT NULL,
        is_active      TINYINT(1) DEFAULT 1,
        subscribed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at TIMESTAMP NULL DEFAULT NULL,
        INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Check if already exists
    $check = $pdo->prepare('SELECT id, is_active FROM subscribers WHERE email = ?');
    $check->execute([$email]);
    $existing = $check->fetch();

    if ($existing) {
        if ((bool)$existing['is_active']) {
            ok([
                'email'     => $email,
                'already_subscribed' => true,
            ], "You're already subscribed to Yaswant Code updates!");
        }
        // Re-subscribe
        $pdo->prepare('UPDATE subscribers SET is_active = 1, unsubscribed_at = NULL WHERE email = ?')
            ->execute([$email]);
        ok(['email' => $email], 'Welcome back! You\'ve been re-subscribed.');
    }

    $pdo->prepare('INSERT INTO subscribers (email, name) VALUES (?, ?)')->execute([$email, $name ?: null]);

    // Confirmation email
    $host    = $_SERVER['HTTP_HOST'] ?? 'yaswantcode.com';
    $subject = "Welcome to Yaswant Code Engineering Digest";
    $body    = "Hi {$name}!\n\nThank you for subscribing to Yaswant Code.\n\n"
             . "You'll receive updates on:\n"
             . "  • New engineering courses\n"
             . "  • Technical articles & tutorials\n"
             . "  • Exclusive learning paths\n\n"
             . "Visit us at: " . PLATFORM_URL . "\n\n"
             . "To unsubscribe, visit: " . PLATFORM_URL . "/unsubscribe?email=" . urlencode($email) . "&token=" . unsubscribe_token($email) . "\n\n"
             . "— The Yaswant Code Team";

    $headers = "From: Yaswant Code <noreply@{$host}>\r\nContent-Type: text/plain; charset=UTF-8";
    if (function_exists('mail') && php_sapi_name() !== 'cli') {
        @mail($email, $subject, $body, $headers);
    }

    ok([
        'email'     => $email,
        'timestamp' => date('c'),
    ], 'Subscribed successfully! Check your inbox for a confirmation email.');
}

// ─── DELETE — Unsubscribe ───────────────────────────────────────────────────
if ($method === 'DELETE') {
    $input = get_json_input();
    $email = strtolower(trim($input['email'] ?? $_GET['email'] ?? ''));

    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail('Valid email is required.', 422);
    }

    // Require the signed token from the unsubscribe email, or the logged-in owner of that address
    $token = (string)($input['token'] ?? $_GET['token'] ?? '');
    $viewer = auth_user();
    $isOwner = $viewer && strtolower((string)($viewer['email'] ?? '')) === $email;
    if (!$isOwner && !hash_equals(unsubscribe_token($email), $token)) {
        fail('Invalid or missing unsubscribe token.', 403);
    }

    $pdo = get_db();
    if ($pdo) {
        $pdo->prepare(
            'UPDATE subscribers SET is_active = 0, unsubscribed_at = NOW() WHERE email = ?'
        )->execute([$email]);
    }

    ok(['email' => $email], "You've been unsubscribed from Yaswant Code updates.");
}

fail('Method not allowed.', 405);

// HMAC of the email so unsubscribe links can't be forged for arbitrary addresses
function unsubscribe_token(string $email): string {
    $key = INSTALL_SECRET !== '' ? INSTALL_SECRET : DB_PASS . DB_NAME;
    return hash_hmac('sha256', 'unsubscribe:' . strtolower($email), $key);
}
