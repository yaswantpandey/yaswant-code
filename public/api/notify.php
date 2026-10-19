<?php
/**
 * Yaswant Code — Push Notification API
 * Actions:
 *   subscribe   (POST, public)   — save FCM token
 *   unsubscribe (POST, public)   — remove FCM token
 *   send        (POST, admin)    — send push to all subscribers via FCM
 *   stats       (GET,  admin)    — subscriber count
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

// FCM Server Key — add FCM_SERVER_KEY=<your_key> to your .env file
// Get it from: Firebase Console → Project Settings → Cloud Messaging
//              → Cloud Messaging API (Legacy) → Server key
define('FCM_SERVER_KEY', getenv('FCM_SERVER_KEY') ?: '');
define('FCM_API_URL',    'https://fcm.googleapis.com/fcm/send');

$method = $_SERVER['REQUEST_METHOD'];
$input  = get_json_input();
$action = str_input($input, 'action');

// ── GET /stats — subscriber count (admin only) ────────────────────────────────
if ($method === 'GET' && ($_GET['action'] ?? '') === 'stats') {
    require_role('admin');
    $pdo = get_db();
    ensure_table($pdo);
    $total  = (int) $pdo->query("SELECT COUNT(*) FROM push_subscribers WHERE is_active = 1")->fetchColumn();
    $recent = (int) $pdo->query(
        "SELECT COUNT(*) FROM push_subscribers WHERE is_active = 1 AND subscribed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    )->fetchColumn();
    ok(['total' => $total, 'last_30_days' => $recent], 'Stats loaded');
}

if ($method !== 'POST') {
    fail('Method not allowed', 405);
}

// ── POST /subscribe ───────────────────────────────────────────────────────────
if ($action === 'subscribe') {
    check_rate_limit('push_subscribe', 10, 3600);
    $token = str_input($input, 'token');
    if (strlen($token) < 50) fail('Invalid FCM token', 422);

    $pdo = get_db();
    if (!$pdo) fail('Database unavailable', 503);
    ensure_table($pdo);

    $hash = hash('sha256', $token);
    $driver = get_db_driver($pdo);

    // Upsert — MySQL and SQLite compatible
    if ($driver === 'mysql') {
        $pdo->prepare(
            "INSERT INTO push_subscribers (token, token_hash, subscribed_at, last_seen, is_active)
             VALUES (?, ?, NOW(), NOW(), 1)
             ON DUPLICATE KEY UPDATE is_active = 1, last_seen = NOW()"
        )->execute([$token, $hash]);
    } else {
        // SQLite
        $exists = $pdo->prepare("SELECT id FROM push_subscribers WHERE token_hash = ?")->execute([$hash]);
        $row    = $pdo->prepare("SELECT id FROM push_subscribers WHERE token_hash = ?")->execute([$hash]);
        $r      = $pdo->query("SELECT id FROM push_subscribers WHERE token_hash = ?" )->fetchColumn() ?: false;
        // Use prepare properly
        $stmt = $pdo->prepare("SELECT id FROM push_subscribers WHERE token_hash = ?");
        $stmt->execute([$hash]);
        $existing = $stmt->fetchColumn();
        if ($existing) {
            $pdo->prepare("UPDATE push_subscribers SET is_active = 1, last_seen = datetime('now') WHERE token_hash = ?")
                ->execute([$hash]);
        } else {
            $pdo->prepare(
                "INSERT INTO push_subscribers (token, token_hash, subscribed_at, last_seen, is_active)
                 VALUES (?, ?, datetime('now'), datetime('now'), 1)"
            )->execute([$token, $hash]);
        }
    }
    ok(null, 'Subscribed successfully');
}

// ── POST /unsubscribe ─────────────────────────────────────────────────────────
if ($action === 'unsubscribe') {
    $token = str_input($input, 'token');
    if (strlen($token) < 50) fail('Invalid token', 422);

    $pdo = get_db();
    if (!$pdo) ok(null, 'Unsubscribed');
    ensure_table($pdo);

    $hash = hash('sha256', $token);
    $pdo->prepare("UPDATE push_subscribers SET is_active = 0 WHERE token_hash = ?")
        ->execute([$hash]);
    ok(null, 'Unsubscribed successfully');
}

// ── POST /send — admin only ───────────────────────────────────────────────────
if ($action === 'send') {
    $user = require_role('admin');

    $title = sanitize(str_input($input, 'title'));
    $body  = sanitize(str_input($input, 'body'));
    $link  = str_input($input, 'link', '/');
    $icon  = str_input($input, 'icon', '/favicon.svg');

    if (!$title || !$body) fail('Title and body are required', 422);
    if (!FCM_SERVER_KEY)   fail('FCM_SERVER_KEY not configured in .env', 500);

    // Validate link is a relative path (security: prevent open redirect)
    if (!str_starts_with($link, '/')) {
        $link = '/' . ltrim($link, '/');
    }

    $pdo = get_db();
    if (!$pdo) fail('Database unavailable', 503);
    ensure_table($pdo);

    // Fetch all active tokens
    $stmt   = $pdo->query("SELECT token FROM push_subscribers WHERE is_active = 1");
    $tokens = $stmt->fetchAll(\PDO::FETCH_COLUMN);

    if (empty($tokens)) {
        ok(['sent' => 0], 'No active subscribers');
    }

    // FCM allows max 500 tokens per request
    $chunks  = array_chunk($tokens, 500);
    $totalSent = 0;
    $failedTokens = [];

    foreach ($chunks as $chunk) {
        $payload = json_encode([
            'registration_ids' => $chunk,
            'notification'     => [
                'title' => $title,
                'body'  => $body,
                'icon'  => $icon,
                'badge' => '/favicon.svg',
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
            ],
            'webpush' => [
                'fcm_options' => ['link' => PLATFORM_URL . $link],
                'notification' => [
                    'title' => $title,
                    'body'  => $body,
                    'icon'  => $icon,
                    'badge' => '/favicon.svg',
                    'requireInteraction' => false,
                ],
            ],
            'data' => ['link' => $link],
        ]);

        $ch = curl_init(FCM_API_URL);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: key=' . FCM_SERVER_KEY,
            ],
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $result = json_decode($response, true);
            $totalSent += (int) ($result['success'] ?? 0);

            // Collect invalid/unregistered tokens for cleanup
            if (!empty($result['results'])) {
                foreach ($result['results'] as $i => $r) {
                    if (isset($r['error']) && in_array($r['error'], ['InvalidRegistration', 'NotRegistered'])) {
                        $failedTokens[] = $chunk[$i] ?? null;
                    }
                }
            }
        }
    }

    // Clean up invalid tokens
    if (!empty($failedTokens)) {
        $failedTokens = array_filter($failedTokens);
        foreach ($failedTokens as $badToken) {
            $badHash = hash('sha256', $badToken);
            $pdo->prepare("UPDATE push_subscribers SET is_active = 0 WHERE token_hash = ?")
                ->execute([$badHash]);
        }
    }

    // Log notification to history table
    try {
        ensure_history_table($pdo);
        $pdo->prepare(
            "INSERT INTO push_notification_log (title, body, link, sent_count, sent_by, sent_at)
             VALUES (?, ?, ?, ?, ?, NOW())"
        )->execute([$title, $body, $link, $totalSent, $user['name'] ?? 'admin']);
    } catch (\Throwable $e) {
        // Log table creation failed silently — don't fail the request
    }

    ok(['sent' => $totalSent, 'total_subscribers' => count($tokens)], "Notification sent to {$totalSent} subscribers");
}

// ── GET /history — last 20 notifications (admin) ─────────────────────────────
if ($method === 'GET' && ($_GET['action'] ?? '') === 'history') {
    require_role('admin');
    $pdo = get_db();
    ensure_history_table($pdo);
    $rows = $pdo->query(
        "SELECT title, body, link, sent_count, sent_by, sent_at
         FROM push_notification_log ORDER BY sent_at DESC LIMIT 20"
    )->fetchAll();
    ok($rows, 'History loaded');
}

fail('Invalid action', 400);

// ─── Table helpers ────────────────────────────────────────────────────────────
function ensure_table(?PDO $pdo): void
{
    if (!$pdo) return;
    $driver = get_db_driver($pdo);
    if ($driver === 'mysql') {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS push_subscribers (
                id           INT AUTO_INCREMENT PRIMARY KEY,
                token        TEXT NOT NULL,
                token_hash   VARCHAR(64) UNIQUE NOT NULL,
                subscribed_at DATETIME NOT NULL,
                last_seen    DATETIME,
                is_active    TINYINT(1) DEFAULT 1,
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
    } else {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS push_subscribers (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                token         TEXT NOT NULL,
                token_hash    TEXT UNIQUE NOT NULL,
                subscribed_at TEXT NOT NULL,
                last_seen     TEXT,
                is_active     INTEGER DEFAULT 1
            )
        ");
    }
}

function ensure_history_table(?PDO $pdo): void
{
    if (!$pdo) return;
    $driver = get_db_driver($pdo);
    if ($driver === 'mysql') {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS push_notification_log (
                id         INT AUTO_INCREMENT PRIMARY KEY,
                title      VARCHAR(255) NOT NULL,
                body       TEXT NOT NULL,
                link       VARCHAR(500) DEFAULT '/',
                sent_count INT DEFAULT 0,
                sent_by    VARCHAR(100),
                sent_at    DATETIME NOT NULL,
                INDEX idx_sent_at (sent_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
    } else {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS push_notification_log (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                title      TEXT NOT NULL,
                body       TEXT NOT NULL,
                link       TEXT DEFAULT '/',
                sent_count INTEGER DEFAULT 0,
                sent_by    TEXT,
                sent_at    TEXT NOT NULL
            )
        ");
    }
}
