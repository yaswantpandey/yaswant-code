<?php
/**
 * health.php — Backend Health Check API
 * Yaswant Code LMS Backend
 *
 * GET  Returns database connectivity status, PHP version, and API version
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/cors.php';

$dbOk   = false;
$dbMsg  = '';

try {
    $pdo  = Database::getConnection();
    $pdo->query('SELECT 1');
    $dbOk  = true;
    $dbMsg = 'Connected';
} catch (\Exception $e) {
    $dbMsg = 'Unavailable';
}

jsonResponse(true, [
    'status'      => $dbOk ? 'healthy' : 'degraded',
    'api_version' => '1.0.0',
    'php_version' => PHP_VERSION,
    'timestamp'   => date('c'),
    'services'    => [
        'database' => [
            'status'  => $dbOk ? 'ok' : 'error',
            'message' => $dbMsg,
        ],
    ],
]);
