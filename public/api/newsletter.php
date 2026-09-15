<?php
/**
 * Hostinger PHP Newsletter Subscription Endpoint
 * URL: /api/newsletter.php
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response([
        'status'  => 'error',
        'message' => 'Method not allowed. Only POST requests are accepted.'
    ], 405);
}

$input = get_json_input();
$email = trim($input['email'] ?? '');

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response([
        'status'  => 'error',
        'message' => 'Please provide a valid developer email address.'
    ], 422);
}

// Optional: Store in MySQL if database connection exists
$savedToDb = false;
$pdo = get_db_connection();
if ($pdo !== null) {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS subscribers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $stmt = $pdo->prepare("INSERT IGNORE INTO subscribers (email) VALUES (?)");
        $stmt->execute([$email]);
        $savedToDb = true;
    } catch (Exception $e) {
        $savedToDb = false;
    }
}

json_response([
    'status'      => 'success',
    'message'     => 'Subscribed successfully to Yaswant Code engineering digests and course updates.',
    'email'       => htmlspecialchars($email),
    'saved_to_db' => $savedToDb,
    'timestamp'   => date('c')
]);
