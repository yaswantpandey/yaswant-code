<?php
/**
 * Hostinger PHP Health & Diagnostics Endpoint
 * URL: /api/health.php
 */

require_once __DIR__ . '/config.php';

$phpVersion = PHP_VERSION;
$serverSoftware = $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown / LiteSpeed';
$extensions = [
    'pdo'       => extension_loaded('pdo'),
    'pdo_mysql' => extension_loaded('pdo_mysql'),
    'curl'      => extension_loaded('curl'),
    'openssl'   => extension_loaded('openssl'),
    'mbstring'  => extension_loaded('mbstring'),
    'json'      => extension_loaded('json')
];

// Test Database Connection if available
$dbConnected = false;
$dbMessage = 'Database connection not initialized or using client storage';
$pdo = get_db_connection();
if ($pdo !== null) {
    $dbConnected = true;
    $dbMessage = 'Connected to MySQL on ' . DB_HOST;
}

json_response([
    'status'           => 'ok',
    'platform'         => PLATFORM_NAME,
    'message'          => 'Hostinger PHP compatibility runtime operational',
    'timestamp'        => date('c'),
    'php_version'      => $phpVersion,
    'server_software'  => $serverSoftware,
    'memory_limit'     => ini_get('memory_limit'),
    'upload_max_files' => ini_get('upload_max_filesize'),
    'post_max_size'    => ini_get('post_max_size'),
    'extensions'       => $extensions,
    'database'         => [
        'connected' => $dbConnected,
        'message'   => $dbMessage,
        'host'      => DB_HOST,
        'database'  => DB_NAME
    ],
    'environment'      => [
        'host'      => $_SERVER['HTTP_HOST'] ?? 'localhost',
        'protocol'  => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http',
        'api_path'  => '/api/'
    ]
]);
