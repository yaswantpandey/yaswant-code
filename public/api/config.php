<?php
/**
 * Yaswant Code LMS — Unified API Configuration
 * Hostinger Shared Hosting Compatible (PHP 8.1+, MySQL/MariaDB)
 * Place this file in: public_html/api/config.php
 */

declare(strict_types=1);

// ─── Error Reporting ───────────────────────────────────────────────────────
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
date_default_timezone_set('UTC');

// ─── CORS Headers ──────────────────────────────────────────────────────────
// Only allow requests from the production domain and localhost for dev
$_allowedOrigins = [
    'https://yaswant.co.in',
    'https://www.yaswant.co.in',
    'http://localhost:5173',
    'http://localhost:3000',
];
$_requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($_requestOrigin, $_allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $_requestOrigin);
    header('Vary: Origin');
} elseif (empty($_requestOrigin)) {
    // Server-to-server or direct API call — allow
    header('Access-Control-Allow-Origin: https://yaswant.co.in');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ─── Environment Loader (.env) ──────────────────────────────────────────────
// Automatically reads .env from parent directories on Hostinger / Apache
if (!function_exists('load_env_file')) {
    function load_env_file(): void
    {
        $candidates = [
            dirname(__DIR__, 2) . '/.env', // /home/u865909543/domains/yaswant.co.in/.env
            dirname(__DIR__) . '/.env',    // public_html/.env
            __DIR__ . '/.env',            // public_html/api/.env
            (isset($_SERVER['DOCUMENT_ROOT']) ? dirname($_SERVER['DOCUMENT_ROOT']) . '/.env' : ''),
            ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/.env',
        ];
        foreach ($candidates as $file) {
            if ($file && @file_exists($file) && @is_readable($file)) {
                $lines = @file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                if ($lines === false)
                    continue;
                foreach ($lines as $line) {
                    $line = trim($line);
                    if ($line === '' || str_starts_with($line, '#') || str_starts_with($line, ';')) {
                        continue;
                    }
                    if (str_contains($line, '=')) {
                        [$k, $v] = explode('=', $line, 2);
                        $k = trim($k);
                        $v = trim($v);
                        if (
                            (str_starts_with($v, '"') && str_ends_with($v, '"')) ||
                            (str_starts_with($v, "'") && str_ends_with($v, "'"))
                        ) {
                            $v = substr($v, 1, -1);
                        }
                        if (!isset($_ENV[$k]))
                            $_ENV[$k] = $v;
                        if (!isset($_SERVER[$k]))
                            $_SERVER[$k] = $v;
                        putenv("{$k}={$v}");
                    }
                }
                break;
            }
        }
    }
}
load_env_file();

// ─── Database Configuration ────────────────────────────────────────────────
// Reads ONLY from .env / Hostinger environment variables — no hardcoded credentials
// If DB env vars are missing, the system falls back safely to SQLite.
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', (int) (getenv('DB_PORT') ?: 3306));
define('DB_NAME', getenv('DB_NAME') ?: '');
define('DB_USER', getenv('DB_USER') ?: '');
define('DB_PASS', getenv('DB_PASS') ?: '');

// ─── Platform Configuration ────────────────────────────────────────────────
define('PLATFORM_NAME', 'Yaswant Code');
define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: 'contact@yaswant.co.in');
define('PLATFORM_URL', getenv('PLATFORM_URL') ?: 'https://' . ($_SERVER['HTTP_HOST'] ?? 'yaswant.co.in'));
define('INSTALL_SECRET', getenv('INSTALL_SECRET') ?: '');

// Session token TTL in seconds (7 days)
define('TOKEN_TTL', 7 * 24 * 3600);

// ─── PDO Singleton (MySQL Primary with SQLite Database Engine) ────────────
function get_db(): ?PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    // 1. Primary: Hostinger MySQL Database
    try {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            DB_HOST,
            DB_PORT,
            DB_NAME
        );
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 3,
        ]);
        return $pdo;
    } catch (Throwable $e) {
        // MySQL credentials pending or failed, proceed to local SQL database
    }

    // 2. Real Relational SQL Database: SQLite (Stored safely on Hostinger)
    try {
        $storageDir = dirname(__DIR__, 2) . '/database';
        if (!is_dir($storageDir)) {
            @mkdir($storageDir, 0755, true);
        }
        if (!is_dir($storageDir) || !is_writable($storageDir)) {
            $storageDir = dirname(__DIR__) . '/.data';
            if (!is_dir($storageDir))
                @mkdir($storageDir, 0755, true);
        }
        $dbPath = $storageDir . '/yaswant_lms.sqlite';
        $pdo = new PDO('sqlite:' . $dbPath, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $pdo->exec('PRAGMA foreign_keys = ON;');
        $pdo->exec('PRAGMA journal_mode = WAL;');
        return $pdo;
    } catch (Throwable $e) {
        return null;
    }
}

function get_db_driver(?PDO $pdo = null): string
{
    $db = $pdo ?? get_db();
    if (!$db)
        return 'none';
    return (string) $db->getAttribute(PDO::ATTR_DRIVER_NAME);
}

function require_db(): PDO
{
    $pdo = get_db();
    if ($pdo === null) {
        json_response([
            'success' => false,
            'error' => 'Database unavailable. Please check your DB credentials or run /api/install.php.',
        ], 503);
    }
    return $pdo;
}

// ─── Response Helpers ──────────────────────────────────────────────────────
function json_response(array $data, int $statusCode = 200): never
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

function ok(mixed $data = null, ?string $message = null, int $code = 200): never
{
    $res = ['success' => true];
    if ($message !== null)
        $res['message'] = $message;
    if ($data !== null)
        $res['data'] = $data;
    json_response($res, $code);
}

function fail(string $error, int $code = 400, mixed $details = null): never
{
    $res = ['success' => false, 'error' => $error];
    if ($details !== null)
        $res['details'] = $details;
    json_response($res, $code);
}

set_exception_handler(function (Throwable $e): never {
    // Log full details server-side, return only a safe message to the client
    error_log('[LMS] Unhandled exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    fail('An internal server error occurred. Please try again later.', 500);
});

// ─── Input Helpers ─────────────────────────────────────────────────────────
function get_json_input(): array
{
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return $_POST ?: [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function str_input(array $input, string $key, string $default = ''): string
{
    return trim((string) ($input[$key] ?? $default));
}

function int_input(array $input, string $key, int $default = 0): int
{
    return (int) ($input[$key] ?? $default);
}

function sanitize(string $str): string
{
    return htmlspecialchars(strip_tags(trim($str)), ENT_QUOTES, 'UTF-8');
}

function require_param(string $key, array $source = []): string
{
    $src = empty($source) ? $_GET : $source;
    $val = trim((string) ($src[$key] ?? ''));
    if ($val === '') {
        fail("Missing required parameter: {$key}", 422);
    }
    return $val;
}

// ─── Token Authentication ──────────────────────────────────────────────────

/**
 * Extract Bearer token from Authorization header
 */
function get_bearer_token(): ?string
{
    $auth = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? $_SERVER['HTTP_X_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_X_AUTHORIZATION']
        ?? '';

    if (empty($auth) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $auth = $headers['Authorization']
            ?? $headers['authorization']
            ?? $headers['X-Authorization']
            ?? $headers['x-authorization']
            ?? '';
    }

    if (preg_match('/^Bearer\s+(.+)$/i', (string) $auth, $m)) {
        return trim($m[1]);
    }

    // Note: URL/POST token fallback intentionally removed.
    // Tokens in URLs appear in server logs, browser history, and referrer headers.
    // Always use the Authorization: Bearer <token> header.

    return null;
}

/**
 * Authenticate request — returns user row or null
 */
function auth_user(): ?array
{
    $token = get_bearer_token();
    if (!$token)
        return null;

    $pdo = get_db();
    if (!$pdo)
        return null;

    try {
        $stmt = $pdo->prepare('SELECT user_id FROM user_sessions WHERE token = ? AND expires_at > NOW()');
        $stmt->execute([$token]);
        $userId = $stmt->fetchColumn();
        if (!$userId) {
            return null;
        }

        $stmt2 = $pdo->prepare(
            'SELECT id, name, email, role, avatar, title, bio,
                    github_url, twitter_url, linkedin_url
             FROM users WHERE id = ? AND is_active = 1'
        );
        $stmt2->execute([$userId]);
        return $stmt2->fetch() ?: null;
    } catch (Throwable $e) {
        return null;
    }
}

/**
 * Require authentication — dies with 401 if not authenticated
 */
function require_auth(): array
{
    $user = auth_user();
    if (!$user) {
        fail('Authentication required. Please log in.', 401);
    }
    return $user;
}

/**
 * Require specific role(s)
 */
function require_role(string ...$roles): array
{
    $user = require_auth();
    if (!in_array($user['role'], $roles, true)) {
        fail('Insufficient permissions.', 403);
    }
    return $user;
}

// ─── Rate Limiting (IP-based via DB) ──────────────────────────────────────

/**
 * Check rate limit — fail with 429 if exceeded
 * @param string $action  Unique action key (e.g. 'contact', 'register')
 * @param int    $max     Max attempts allowed
 * @param int    $window  Time window in seconds
 */
function check_rate_limit(string $action, int $max = 10, int $window = 3600): void
{
    $pdo = get_db();
    if (!$pdo)
        return; // Skip rate limiting if DB not available

    // Security: HTTP_X_FORWARDED_FOR is attacker-controlled and must NOT be trusted.
    // HTTP_CF_CONNECTING_IP is set by Cloudflare and cannot be forged through CF.
    // REMOTE_ADDR is the socket-level IP (either Cloudflare edge or direct client).
    // We trust CF-Connecting-IP only when it exists; fall back to REMOTE_ADDR.
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP']
        ?? $_SERVER['REMOTE_ADDR']
        ?? '0.0.0.0';
    // Take only the first IP in case of unexpected comma-separated values
    $ip = trim(explode(',', $ip)[0]);

    // Clean old entries
    $pdo->prepare('DELETE FROM rate_limits WHERE expires_at < NOW()')->execute();

    $stmt = $pdo->prepare(
        'SELECT count FROM rate_limits WHERE ip = ? AND action = ?'
    );
    $stmt->execute([$ip, $action]);
    $row = $stmt->fetch();

    if ($row) {
        if ((int) $row['count'] >= $max) {
            fail("Too many requests. Please try again later.", 429);
        }
        $pdo->prepare('UPDATE rate_limits SET count = count + 1 WHERE ip = ? AND action = ?')
            ->execute([$ip, $action]);
    } else {
        $expires = date('Y-m-d H:i:s', time() + $window);
        $pdo->prepare('INSERT INTO rate_limits (ip, action, count, expires_at) VALUES (?, ?, 1, ?)')
            ->execute([$ip, $action, $expires]);
    }
}

// ─── Utility Helpers ───────────────────────────────────────────────────────

function generate_id(string $prefix = ''): string
{
    return ($prefix ? $prefix . '-' : '') . bin2hex(random_bytes(8));
}

function generate_token(): string
{
    return bin2hex(random_bytes(32));
}

function paginate(PDO $pdo, string $sql, array $params, int $page = 1, int $per_page = 20): array
{
    $page = max(1, $page);
    $per_page = max(1, min(100, $per_page));
    $offset = ($page - 1) * $per_page;

    // Count query
    $count_sql = 'SELECT COUNT(*) FROM (' . $sql . ') AS _count_wrap';
    $count_stmt = $pdo->prepare($count_sql);
    $count_stmt->execute($params);
    $total = (int) $count_stmt->fetchColumn();

    // Data query
    $data_stmt = $pdo->prepare($sql . " LIMIT {$per_page} OFFSET {$offset}");
    $data_stmt->execute($params);
    $items = $data_stmt->fetchAll();

    return [
        'items' => $items,
        'total' => $total,
        'page' => $page,
        'per_page' => $per_page,
        'total_pages' => (int) ceil($total / $per_page),
    ];
}
