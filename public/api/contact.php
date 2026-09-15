<?php
/**
 * Hostinger PHP Contact & Enrollment Inquiry Endpoint
 * URL: /api/contact.php
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response([
        'status'  => 'error',
        'message' => 'Method not allowed. Only POST requests are accepted.'
    ], 405);
}

$input = get_json_input();

$name    = trim($input['name'] ?? '');
$email   = trim($input['email'] ?? '');
$subject = trim($input['subject'] ?? 'General Inquiry from Yaswant Code LMS');
$message = trim($input['message'] ?? '');
$course  = trim($input['course'] ?? '');

// Validation
if (empty($name) || empty($email) || empty($message)) {
    json_response([
        'status'  => 'error',
        'message' => 'Validation failed. Please provide name, email, and message.'
    ], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response([
        'status'  => 'error',
        'message' => 'Please provide a valid email address.'
    ], 422);
}

// Prepare email headers & body for PHP mail()
$to = ADMIN_EMAIL;
$emailSubject = "[Yaswant Code] " . $subject;
$emailBody = "New Inquiry from " . PLATFORM_NAME . "\n\n" .
             "Name: " . $name . "\n" .
             "Email: " . $email . "\n" .
             (!empty($course) ? "Interested Course: " . $course . "\n" : "") .
             "Timestamp: " . date('Y-m-d H:i:s T') . "\n\n" .
             "Message:\n" . $message . "\n";

$headers = "From: " . PLATFORM_NAME . " <noreply@" . ($_SERVER['HTTP_HOST'] ?? 'yaswantcode.com') . ">\r\n" .
           "Reply-To: " . $name . " <" . $email . ">\r\n" .
           "X-Mailer: PHP/" . phpversion();

// Attempt delivery via PHP mail()
$mailSent = false;
try {
    // Only attempt if not running on test CLI
    if (function_exists('mail') && php_sapi_name() !== 'cli') {
        $mailSent = @mail($to, $emailSubject, $emailBody, $headers);
    }
} catch (Exception $e) {
    $mailSent = false;
}

// Optional: Store in MySQL if database connection exists
$savedToDb = false;
$pdo = get_db_connection();
if ($pdo !== null) {
    try {
        // Create table if not exists
        $pdo->exec("CREATE TABLE IF NOT EXISTS inquiries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            course VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $stmt = $pdo->prepare("INSERT INTO inquiries (name, email, subject, message, course) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $email, $subject, $message, $course]);
        $savedToDb = true;
    } catch (Exception $e) {
        $savedToDb = false;
    }
}

json_response([
    'status'      => 'success',
    'message'     => 'Thank you! Your message has been received by our engineering academy team.',
    'mail_sent'   => $mailSent,
    'saved_to_db' => $savedToDb,
    'data'        => [
        'name'      => htmlspecialchars($name),
        'email'     => htmlspecialchars($email),
        'subject'   => htmlspecialchars($subject),
        'timestamp' => date('c')
    ]
]);
