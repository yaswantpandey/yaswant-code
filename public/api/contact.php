<?php
/**
 * Yaswant Code LMS — Contact Form API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoint: POST /api/contact.php
 * Features: IP rate limiting, DB persistence, PHP mail() delivery
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed. Use POST.'], 405);
}

check_rate_limit('contact', 3, 3600); // max 3 contact requests per hour per IP

$input = get_json_input();

// Helper to prevent email header injection (CRLF stripping)
function strip_crlf(string $val): string {
    return preg_replace('/[\r\n\t\0\x0B]/', '', trim($val));
}

$name    = strip_crlf(sanitize(str_input($input, 'name')));
$email   = strip_crlf(strtolower(str_input($input, 'email')));
$subject = strip_crlf(sanitize(str_input($input, 'subject'))) ?: 'General Inquiry';
$message = sanitize(str_input($input, 'message'));
$course  = strip_crlf(sanitize(str_input($input, 'course')));
$phone   = strip_crlf(sanitize(str_input($input, 'phone')));

// Validation
if (!$name)                                          fail('Name is required.', 422);
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) fail('A valid email address is required.', 422);
if (preg_match('/[\r\n]/', $email))                  fail('Invalid characters in email.', 422);
if (strlen($message) < 10)                           fail('Message must be at least 10 characters.', 422);
if (strlen($name) > 150)                             fail('Name is too long.', 422);

// ─── Save to Database ───────────────────────────────────────────────────────
$savedToDb = false;
$pdo = get_db();
if ($pdo) {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS inquiries (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            name        VARCHAR(150)  NOT NULL,
            email       VARCHAR(255)  NOT NULL,
            subject     VARCHAR(255)  NOT NULL,
            message     TEXT          NOT NULL,
            course      VARCHAR(255)  DEFAULT NULL,
            phone       VARCHAR(50)   DEFAULT NULL,
            ip_address  VARCHAR(45)   DEFAULT NULL,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $ip = $_SERVER['HTTP_CF_CONNECTING_IP']
            ?? $_SERVER['HTTP_X_FORWARDED_FOR']
            ?? $_SERVER['REMOTE_ADDR']
            ?? null;

        $pdo->prepare(
            'INSERT INTO inquiries (name, email, subject, message, course, phone, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )->execute([$name, $email, $subject, $message, $course ?: null, $phone ?: null, $ip]);

        $savedToDb = true;
    } catch (Exception $e) {
        $savedToDb = false;
    }
}

// ─── Send Email ─────────────────────────────────────────────────────────────
$mailSent = false;
$host     = $_SERVER['HTTP_HOST'] ?? 'yaswantcode.com';

$emailBody = "═══════════════════════════════════════\n";
$emailBody .= "  New Contact Form Submission\n";
$emailBody .= "  Yaswant Code — Engineering Academy\n";
$emailBody .= "═══════════════════════════════════════\n\n";
$emailBody .= "Name:      {$name}\n";
$emailBody .= "Email:     {$email}\n";
if ($phone)  $emailBody .= "Phone:     {$phone}\n";
if ($course) $emailBody .= "Course:    {$course}\n";
$emailBody .= "Subject:   {$subject}\n";
$emailBody .= "Timestamp: " . date('Y-m-d H:i:s T') . "\n\n";
$emailBody .= "Message:\n";
$emailBody .= str_repeat('─', 40) . "\n";
$emailBody .= $message . "\n";
$emailBody .= str_repeat('─', 40) . "\n\n";
$emailBody .= "Reply directly to this email to respond.\n";

$headers  = "From: Yaswant Code <noreply@{$host}>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . PHP_VERSION;

try {
    if (function_exists('mail') && php_sapi_name() !== 'cli') {
        $mailSent = @mail(ADMIN_EMAIL, '[Yaswant Code] ' . $subject, $emailBody, $headers);
    }
} catch (Exception $e) {
    $mailSent = false;
}

ok([
    'name'         => $name,
    'email'        => $email,
    'subject'      => $subject,
    'mail_sent'    => $mailSent,
    'saved_to_db'  => $savedToDb,
    'timestamp'    => date('c'),
], 'Thank you! Your message has been received. We\'ll get back to you within 24 hours.');
