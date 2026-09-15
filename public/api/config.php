<?php
/**
 * Hostinger PHP API Configuration & Utilities
 * Platform: Yaswant Code - Engineering LMS
 */

// Enable strict types and error reporting for development (tune in production)
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Set default timezone
date_default_timezone_set('UTC');

// 1. CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Database Configuration (Hostinger MySQL / MariaDB via hPanel)
// Update these with your Hostinger MySQL details from hPanel -> Databases -> MySQL Databases
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'u123456789_lms');
define('DB_USER', getenv('DB_USER') ?: 'u123456789_user');
define('DB_PASS', getenv('DB_PASS') ?: 'YourSecurePasswordHere');
define('DB_PORT', getenv('DB_PORT') ?: '3306');

// 3. Platform Configuration
define('PLATFORM_NAME', 'Yaswant Code');
define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: 'ecotech.internship@gmail.com');
define('PLATFORM_URL', getenv('PLATFORM_URL') ?: 'https://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));

/**
 * Standardized JSON response helper
 */
function json_response($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

/**
 * Helper to safely extract JSON body payload
 */
function get_json_input() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Optional PDO MySQL Connection helper
 * Returns PDO instance if MySQL database is configured, or null with soft error if not yet setup.
 */
function get_db_connection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        // Return null if database is not yet created on Hostinger
        return null;
    }
}
