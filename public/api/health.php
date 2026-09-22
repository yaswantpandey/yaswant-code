<?php
/**
 * Yaswant Code LMS — Health & Diagnostics API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoint: GET /api/health.php
 * Returns: PHP version, extensions, DB connection status, table counts
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

// Only respond to GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

// Require admin authentication — health data is internal-only
require_role('admin');

// ─── PHP Info ──────────────────────────────────────────────────────────────
$phpVersion     = PHP_VERSION;
$phpVersionOk   = version_compare(PHP_VERSION, '8.1.0', '>=');
$serverSoftware = $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown';

// ─── Required Extensions ────────────────────────────────────────────────────
$requiredExt = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'openssl', 'curl'];
$optionalExt = ['gd', 'intl', 'zip', 'fileinfo'];

$extensions = [];
foreach ($requiredExt as $ext) {
    $extensions['required'][$ext] = extension_loaded($ext);
}
foreach ($optionalExt as $ext) {
    $extensions['optional'][$ext] = extension_loaded($ext);
}

$allRequiredLoaded = !in_array(false, $extensions['required'], true);

// ─── Database Check ─────────────────────────────────────────────────────────
$dbStatus = [
    'connected'   => false,
    'host'        => DB_HOST,
    'database'    => DB_NAME,
    'message'     => 'Not connected',
    'tables'      => [],
    'row_counts'  => [],
];
$pdo = get_db();
if ($pdo) {
    $driver = get_db_driver($pdo);
    $dbStatus['connected'] = true;
    $dbStatus['driver']    = $driver;
    $dbStatus['message']   = $driver === 'mysql' ? 'Connected to MySQL' : 'Connected to SQLite Database Engine';

    try {
        $tables = $driver === 'sqlite'
            ? $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")->fetchAll(PDO::FETCH_COLUMN)
            : $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        $dbStatus['tables'] = $tables;

        // Row counts for key tables
        $keyTables = ['users','courses','enrollments','certificates','discussions'];
        foreach ($keyTables as $tbl) {
            if (in_array($tbl, $tables, true)) {
                $count = $pdo->query("SELECT COUNT(*) FROM `{$tbl}`")->fetchColumn();
                $dbStatus['row_counts'][$tbl] = (int)$count;
            }
        }

        // Check schema version marker
        $installed = in_array('user_sessions', $tables, true) && in_array('rate_limits', $tables, true);
        $dbStatus['schema_installed'] = $installed;
        if (!$installed) {
            $dbStatus['message'] = 'DB connected (' . $driver . ') but schema not installed. Run /api/install.php';
        }
    } catch (Exception $e) {
        $dbStatus['message'] = 'Connected but query failed: ' . $e->getMessage();
    }
} else {
    $dbStatus['message'] = 'Connection failed. Check DB_HOST, DB_NAME, DB_USER, DB_PASS in config.php';
}

// ─── PHP Config ─────────────────────────────────────────────────────────────
$phpConfig = [
    'memory_limit'       => ini_get('memory_limit'),
    'upload_max_filesize'=> ini_get('upload_max_filesize'),
    'post_max_size'      => ini_get('post_max_size'),
    'max_execution_time' => ini_get('max_execution_time'),
    'display_errors'     => ini_get('display_errors'),
    'log_errors'         => ini_get('log_errors'),
];

// ─── Overall Status ──────────────────────────────────────────────────────────
$overallOk = $phpVersionOk && $allRequiredLoaded && $dbStatus['connected'];

json_response([
    'success'            => true,
    'status'             => $overallOk ? 'ok' : 'degraded',
    'platform'           => PLATFORM_NAME,
    'php_version'        => $phpVersion,
    'server_software'    => $serverSoftware,
    'database_connected' => $dbStatus['connected'],
    'message'            => $overallOk ? 'Hostinger PHP compatibility runtime operational' : 'PHP 8.x operational (Database: ' . $dbStatus['message'] . ')',
    'timestamp'          => date('c'),
    'php'                => [
        'version'   => $phpVersion,
        'version_ok'=> $phpVersionOk,
        'required'  => '>= 8.1.0',
        'sapi'      => PHP_SAPI,
        'config'    => $phpConfig,
    ],
    'extensions'    => $extensions,
    'database'      => $dbStatus,
    'environment'   => [
        'host'      => $_SERVER['HTTP_HOST'] ?? 'localhost',
        'protocol'  => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http',
        'platform'  => PLATFORM_URL,
        'admin_email' => ADMIN_EMAIL,
    ],
    'api_endpoints' => [
        '/api/auth.php'          => 'Authentication (register, login, profile)',
        '/api/courses.php'       => 'Course catalog & curriculum',
        '/api/enrollments.php'   => 'Enrollment & progress tracking',
        '/api/certificates.php'  => 'Certificate issuance & verification',
        '/api/quizzes.php'       => 'Quiz engine',
        '/api/assignments.php'   => 'Assignment submission & grading',
        '/api/discussions.php'   => 'Community discussions',
        '/api/notifications.php' => 'User notifications',
        '/api/contact.php'       => 'Contact form',
        '/api/newsletter.php'    => 'Newsletter subscription',
        '/api/install.php'       => 'Database installer (run once)',
    ],
]);
