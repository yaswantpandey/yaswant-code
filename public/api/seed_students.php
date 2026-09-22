<?php
/**
 * Yaswant Code LMS — Seed Student Accounts & Subscribers from CSV Data
 * Inserts 32,655 real student emails into `users` and `subscribers` tables.
 *
 * Usage:
 *   GET /api/seed_students.php?secret=yaswant_student_seed_2026
 *   GET /api/seed_students.php?secret=YOUR_INSTALL_SECRET
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

@set_time_limit(360);
@ini_set('memory_limit', '1024M');

$startTime = microtime(true);

// ─── Auth Guard ──────────────────────────────────────────────────────────────
// Only accepts the INSTALL_SECRET (set in .env) — static hardcoded secrets removed
$secret = trim($_GET['secret'] ?? $_POST['secret'] ?? '');
$installSecret = INSTALL_SECRET;
$authorized = ($installSecret !== '' && $secret === $installSecret);

if (!$authorized) {
    // Check if admin is logged in with Bearer token
    $token = get_bearer_token();
    if ($token) {
        $pdo = get_db();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare('SELECT u.role FROM user_sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()');
                $stmt->execute([$token]);
                if ($stmt->fetchColumn() === 'admin') {
                    $authorized = true;
                }
            } catch (\Throwable $e) {}
        }
    }
}

if (!$authorized) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Provide a valid INSTALL_SECRET or admin bearer token.'], JSON_PRETTY_PRINT);
    exit;
}

$pdo = get_db();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed.'], JSON_PRETTY_PRINT);
    exit;
}

$driver = get_db_driver($pdo);

// ─── Ensure Tables Exist ─────────────────────────────────────────────────────
try {
    if ($driver === 'mysql') {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `users` (
                `id`              VARCHAR(64)   PRIMARY KEY,
                `name`            VARCHAR(150)  NOT NULL,
                `email`           VARCHAR(191)  NOT NULL UNIQUE,
                `password_hash`   VARCHAR(255)  NOT NULL,
                `role`            ENUM('student','instructor','admin') NOT NULL DEFAULT 'student',
                `avatar`          VARCHAR(500)  NULL,
                `bio`             TEXT          NULL,
                `title`           VARCHAR(255)  NULL,
                `github_url`      VARCHAR(255)  NULL,
                `twitter_url`     VARCHAR(255)  NULL,
                `linkedin_url`    VARCHAR(255)  NULL,
                `rating`          DECIMAL(3,2)  DEFAULT 5.00,
                `reviews_count`   INT UNSIGNED  DEFAULT 0,
                `students_count`  INT UNSIGNED  DEFAULT 0,
                `is_active`       TINYINT(1)    DEFAULT 1,
                `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_role  (role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `subscribers` (
                `id`               INT AUTO_INCREMENT PRIMARY KEY,
                `email`            VARCHAR(255) NOT NULL UNIQUE,
                `name`             VARCHAR(150) DEFAULT NULL,
                `is_active`        TINYINT(1)   DEFAULT 1,
                `subscribed_at`    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
                `unsubscribed_at`  TIMESTAMP    NULL DEFAULT NULL,
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } else {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                email VARCHAR(191) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'student',
                avatar VARCHAR(500) NULL,
                bio TEXT NULL,
                title VARCHAR(255) NULL,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS subscribers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR(255) NOT NULL UNIQUE,
                name VARCHAR(150) NULL,
                is_active INTEGER DEFAULT 1,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ");
    }
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Table creation error: ' . $e->getMessage()], JSON_PRETTY_PRINT);
    exit;
}

// ─── Ensure Admin Account Privilege ──────────────────────────────────────────
try {
    $pdo->exec("UPDATE users SET role = 'admin', title = 'Chief Administrator' WHERE email = 'admin@yaswantcode.edu' OR email = 'ecotech.internship@gmail.com'");
} catch (\Throwable $e) {}

// ─── Locate Email Source File ────────────────────────────────────────────────
$sourceFile = __DIR__ . '/student_emails.txt';
if (!file_exists($sourceFile)) {
    $parentSource = dirname(__DIR__, 2) . '/student email - Sheet1.csv';
    if (file_exists($parentSource)) {
        $sourceFile = $parentSource;
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'student_emails.txt not found in ' . __DIR__], JSON_PRETTY_PRINT);
        exit;
    }
}

// ─── Helper to Generate Clean Name from Email ────────────────────────────────
function generate_clean_student_name(string $email): string {
    $parts = explode('@', $email, 2);
    $userPart = $parts[0] ?? 'student';

    // Check if it's a student roll/registration number (e.g. 21131a05p9)
    if (preg_match('/^\d+[a-zA-Z0-9]+$/', $userPart)) {
        return 'Student ' . strtoupper($userPart);
    }

    // Replace punctuation with spaces and remove trailing numbers
    $cleaned = preg_replace('/[._\-+]+/', ' ', $userPart);
    $cleaned = preg_replace('/\d+$/', '', (string)$cleaned);
    $cleaned = trim((string)$cleaned);

    if (strlen($cleaned) < 2) {
        $cleaned = $userPart;
    }

    $words = array_filter(explode(' ', (string)$cleaned));
    $nameParts = array_map(function($w) {
        return ucfirst(strtolower($w));
    }, $words);

    $finalName = implode(' ', $nameParts);
    return !empty($finalName) ? $finalName : 'Student ' . substr(md5($email), 0, 6);
}

// ─── Read & Deduplicate Emails ───────────────────────────────────────────────
$fileHandle = fopen($sourceFile, 'r');
if (!$fileHandle) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Cannot open ' . $sourceFile], JSON_PRETTY_PRINT);
    exit;
}

$emailRegex = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';
$uniqueEmails = [];

while (($line = fgets($fileHandle)) !== false) {
    // Strip zero-width and invisible unicode chars (LRM \u200E, BOM, zero-width spaces)
    $cleaned = preg_replace('/[\x{200B}-\x{200F}\x{FEFF}\x{00A0}]/u', '', $line);
    $cleaned = strtolower(trim((string)$cleaned));
    if ($cleaned === '') continue;

    if (preg_match($emailRegex, $cleaned)) {
        $uniqueEmails[$cleaned] = true;
    }
}
fclose($fileHandle);

$totalUnique = count($uniqueEmails);
if ($totalUnique === 0) {
    echo json_encode(['success' => false, 'error' => 'No valid email addresses found in source file.'], JSON_PRETTY_PRINT);
    exit;
}

// ─── Precompute Standard Default Password Hash ───────────────────────────────
// "Student@2026" hashed once so 32k users take 0.001s to prepare
$passwordHash = password_hash('Student@2026', PASSWORD_BCRYPT);
$defaultTitle = 'Engineering Student';

// ─── Seed into Database in Batches of 500 ─────────────────────────────────────
$batchSize = 500;
$userBatch = [];
$subscriberBatch = [];

$usersSeeded = 0;
$subscribersSeeded = 0;

$pdo->beginTransaction();

foreach ($uniqueEmails as $email => $_) {
    $id = 'usr_' . md5($email);
    $name = generate_clean_student_name($email);
    $avatar = 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=6366f1&color=fff';

    $userBatch[] = [
        'id' => $id,
        'name' => $name,
        'email' => $email,
        'password_hash' => $passwordHash,
        'role' => 'student',
        'title' => $defaultTitle,
        'avatar' => $avatar
    ];

    $subscriberBatch[] = [
        'email' => $email,
        'name' => $name
    ];

    // Flush users batch
    if (count($userBatch) >= $batchSize) {
        $placeholders = [];
        $values = [];
        foreach ($userBatch as $u) {
            $placeholders[] = '(?, ?, ?, ?, ?, ?, ?, 1, NOW())';
            $values[] = $u['id'];
            $values[] = $u['name'];
            $values[] = $u['email'];
            $values[] = $u['password_hash'];
            $values[] = $u['role'];
            $values[] = $u['title'];
            $values[] = $u['avatar'];
        }

        $sql = "INSERT IGNORE INTO users (id, name, email, password_hash, role, title, avatar, is_active, created_at) VALUES " . implode(',', $placeholders);
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        $usersSeeded += $stmt->rowCount();
        $userBatch = [];
    }

    // Flush subscribers batch
    if (count($subscriberBatch) >= $batchSize) {
        $placeholders = [];
        $values = [];
        foreach ($subscriberBatch as $s) {
            $placeholders[] = '(?, ?, 1, NOW())';
            $values[] = $s['email'];
            $values[] = $s['name'];
        }

        $sql = "INSERT IGNORE INTO subscribers (email, name, is_active, subscribed_at) VALUES " . implode(',', $placeholders);
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        $subscribersSeeded += $stmt->rowCount();
        $subscriberBatch = [];
    }
}

// Flush remaining users
if (!empty($userBatch)) {
    $placeholders = [];
    $values = [];
    foreach ($userBatch as $u) {
        $placeholders[] = '(?, ?, ?, ?, ?, ?, ?, 1, NOW())';
        $values[] = $u['id'];
        $values[] = $u['name'];
        $values[] = $u['email'];
        $values[] = $u['password_hash'];
        $values[] = $u['role'];
        $values[] = $u['title'];
        $values[] = $u['avatar'];
    }
    $sql = "INSERT IGNORE INTO users (id, name, email, password_hash, role, title, avatar, is_active, created_at) VALUES " . implode(',', $placeholders);
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    $usersSeeded += $stmt->rowCount();
}

// Flush remaining subscribers
if (!empty($subscriberBatch)) {
    $placeholders = [];
    $values = [];
    foreach ($subscriberBatch as $s) {
        $placeholders[] = '(?, ?, 1, NOW())';
        $values[] = $s['email'];
        $values[] = $s['name'];
    }
    $sql = "INSERT IGNORE INTO subscribers (email, name, is_active, subscribed_at) VALUES " . implode(',', $placeholders);
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    $subscribersSeeded += $stmt->rowCount();
}

$pdo->commit();

// ─── Query Final Totals ───────────────────────────────────────────────────────
$finalUsersCount = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
$finalSubscribersCount = (int)$pdo->query("SELECT COUNT(*) FROM subscribers")->fetchColumn();

$elapsed = round(microtime(true) - $startTime, 2);

echo json_encode([
    'success'                    => true,
    'message'                    => "Successfully processed {$totalUnique} unique student email records.",
    'source_unique_emails'       => $totalUnique,
    'new_users_inserted'         => $usersSeeded,
    'new_subscribers_inserted'   => $subscribersSeeded,
    'total_database_users'       => $finalUsersCount,
    'total_database_subscribers' => $finalSubscribersCount,
    // default_student_password intentionally omitted from response for security
    'database'                   => DB_NAME,
    'elapsed_seconds'            => $elapsed
], JSON_PRETTY_PRINT);
