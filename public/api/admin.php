<?php
/**
 * Yaswant Code LMS — Administration API
 * Hostinger Shared Hosting Compatible (MySQL & SQLite fallback)
 *
 * Endpoints:
 *   GET  ?action=overview          — System KPI counts, health & recent items
 *   GET  ?action=users             — List all users with filtering & pagination
 *   POST ?action=create_user       — Create a new user (student/admin)
 *   POST ?action=update_user       — Update user role, status, details or password
 *   POST ?action=delete_user       — Delete user
 *   GET  ?action=courses           — List all courses with metrics & status
 *   POST ?action=create_course     — Create a new course
 *   POST ?action=update_course     — Update course details
 *   POST ?action=toggle_course     — Toggle is_featured, is_bestseller, is_deleted
 *   POST ?action=delete_course     — Permanently delete or archive course
 *   GET  ?action=notes             — List all study notes
 *   POST ?action=create_note       — Create a study note
 *   POST ?action=update_note       — Update a study note
 *   POST ?action=delete_note       — Delete a study note
 *   POST ?action=toggle_note       — Toggle pinned / starred on note
 *   GET  ?action=tools             — List all developer tools
 *   POST ?action=create_tool       — Create a developer tool download
 *   POST ?action=update_tool       — Update a developer tool
 *   POST ?action=delete_tool       — Delete a developer tool
 *   POST ?action=toggle_tool       — Toggle featured on tool
 *   GET  ?action=inquiries         — List contact form submissions
 *   POST ?action=delete_inquiry    — Delete inquiry
 *   GET  ?action=subscribers       — List newsletter subscribers
 *   POST ?action=toggle_subscriber — Toggle active status or delete subscriber
 *   GET  ?action=settings          — Get site settings & global announcement
 *   POST ?action=update_settings   — Update site settings & branding
 *   GET  ?action=db_stats          — Database tables, sizes, and row counts
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = strtolower(trim($_GET['action'] ?? 'overview'));

// Verify admin authorization:
// Strictly requires a valid, unexpired Bearer token corresponding to an active administrator account
function verify_admin_access(): array
{
    $token = get_bearer_token();
    if (!$token) {
        fail('Administrator authentication required. Please provide a valid Bearer token.', 401);
    }

    $pdo = get_db();
    if (!$pdo) {
        fail('Database unavailable. Please verify connection.', 503);
    }

    try {
        $stmt = $pdo->prepare('SELECT user_id FROM user_sessions WHERE token = ? AND expires_at > NOW()');
        $stmt->execute([$token]);
        $userId = $stmt->fetchColumn();

        if (!$userId) {
            fail('Invalid or expired administrator session. Please log in again.', 401);
        }

        $stmt2 = $pdo->prepare('SELECT id, name, email, role, is_active FROM users WHERE id = ?');
        $stmt2->execute([$userId]);
        $user = $stmt2->fetch();

        if (!$user) {
            fail('Administrator account not found.', 401);
        }

        if (!(bool)($user['is_active'] ?? 1)) {
            fail('Administrator account is deactivated. Access denied.', 403);
        }

        if ($user['role'] !== 'admin') {
            fail('Access denied. Administrator privileges required.', 403);
        }

        return $user;
    } catch (Throwable $e) {
        fail('Authentication check failed: ' . $e->getMessage(), 500);
    }
}

$currentAdmin = verify_admin_access();
$pdo = require_db();

// ─────────────────────────────────────────────────────────────────────────────
// Ensure schemas exist for complete website governance:
// study_notes, developer_tools, site_settings
// ─────────────────────────────────────────────────────────────────────────────
function ensure_extended_tables(PDO $pdo): void
{
    $driver = get_db_driver($pdo);

    if ($driver === 'mysql') {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `study_notes` (
                `id` VARCHAR(64) PRIMARY KEY,
                `title` VARCHAR(255) NOT NULL,
                `topic` VARCHAR(255) DEFAULT '',
                `category` VARCHAR(100) DEFAULT 'General',
                `resource_type` VARCHAR(50) DEFAULT 'pdf',
                `url` TEXT NOT NULL,
                `file_size` VARCHAR(100) DEFAULT '',
                `thumbnail` TEXT DEFAULT NULL,
                `description` TEXT DEFAULT NULL,
                `author` VARCHAR(100) DEFAULT 'Yaswant Pandey',
                `pinned` TINYINT(1) DEFAULT 0,
                `starred` TINYINT(1) DEFAULT 0,
                `tags` TEXT DEFAULT NULL,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `developer_tools` (
                `id` VARCHAR(64) PRIMARY KEY,
                `name` VARCHAR(255) NOT NULL,
                `tagline` VARCHAR(255) DEFAULT '',
                `description` TEXT DEFAULT NULL,
                `category` VARCHAR(100) DEFAULT 'Utilities',
                `download_type` VARCHAR(50) DEFAULT 'zip',
                `download_url` TEXT NOT NULL,
                `file_size` VARCHAR(100) DEFAULT '',
                `version` VARCHAR(50) DEFAULT 'v1.0.0',
                `os_support` VARCHAR(255) DEFAULT 'Windows, macOS, Linux',
                `thumbnail` TEXT DEFAULT NULL,
                `downloads_count` INT DEFAULT 0,
                `featured` TINYINT(1) DEFAULT 0,
                `author` VARCHAR(100) DEFAULT 'Yaswant Team',
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `site_settings` (
                `setting_key` VARCHAR(100) PRIMARY KEY,
                `setting_value` LONGTEXT,
                `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } else {
        // SQLite fallback
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS study_notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                topic TEXT DEFAULT '',
                category TEXT DEFAULT 'General',
                resource_type TEXT DEFAULT 'pdf',
                url TEXT NOT NULL,
                file_size TEXT DEFAULT '',
                thumbnail TEXT,
                description TEXT,
                author TEXT DEFAULT 'Yaswant Pandey',
                pinned INTEGER DEFAULT 0,
                starred INTEGER DEFAULT 0,
                tags TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS developer_tools (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                tagline TEXT DEFAULT '',
                description TEXT,
                category TEXT DEFAULT 'Utilities',
                download_type TEXT DEFAULT 'zip',
                download_url TEXT NOT NULL,
                file_size TEXT DEFAULT '',
                version TEXT DEFAULT 'v1.0.0',
                os_support TEXT DEFAULT 'Windows, macOS, Linux',
                thumbnail TEXT,
                downloads_count INTEGER DEFAULT 0,
                featured INTEGER DEFAULT 0,
                author TEXT DEFAULT 'Yaswant Team',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS site_settings (
                setting_key TEXT PRIMARY KEY,
                setting_value TEXT,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        ");
    }

    // Seed default settings if empty
    try {
        $settingsCount = (int)$pdo->query("SELECT COUNT(*) FROM site_settings")->fetchColumn();
        if ($settingsCount === 0) {
            $defaultSettings = [
                'announcement_enabled'   => '1',
                'announcement_badge'     => 'NEW RELEASE',
                'announcement_text'      => '🚀 Welcome to Yaswant Code — Direct ZIP developer downloads & university study notes now available!',
                'announcement_link'      => '#paths',
                'announcement_btn_text'  => 'Explore Roadmaps →',
                'platform_title'         => 'Yaswant Code',
                'platform_tagline'       => 'Full-Stack Engineering & Cloud Architecture Learning Ecosystem',
                'contact_email'          => 'ecotech.internship@gmail.com',
                'support_phone'          => '+91 98765 43210',
                'office_location'        => 'Tech Hub, Cyber City, Bangalore, India',
                'github_url'             => 'https://github.com/Yaswant-pandey',
                'youtube_url'            => 'https://youtube.com/@yaswantcode',
                'linkedin_url'           => 'https://linkedin.com/in/yaswant-pandey',
                'telegram_url'           => 'https://t.me/yaswantcode',
                'maintenance_mode'       => '0',
                'allow_registration'     => '1',
            ];
            $stmt = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)");
            foreach ($defaultSettings as $k => $v) {
                $stmt->execute([$k, $v]);
            }
        }
    } catch (Throwable $e) {}

    // Table creation complete. No aggressive re-seeding to ensure user deletions persist permanently.
}

ensure_extended_tables($pdo);

// Ensure at least one admin account exists in `users`
try {
    $adminCount = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();
    if ($adminCount === 0) {
        // Use ADMIN_BOOTSTRAP_PASSWORD env var, or generate a random one and log it
        $bootstrapPass = getenv('ADMIN_BOOTSTRAP_PASSWORD') ?: null;
        if (!$bootstrapPass) {
            // Generate a secure random password — admin MUST check server error logs
            $bootstrapPass = bin2hex(random_bytes(12)); // 24-char hex
            error_log('[LMS] *** ADMIN BOOTSTRAP: No ADMIN_BOOTSTRAP_PASSWORD env var set. Auto-generated admin password: ' . $bootstrapPass . ' for admin@yaswantcode.edu — CHANGE THIS IMMEDIATELY ***');
        }
        $hash = password_hash($bootstrapPass, PASSWORD_BCRYPT, ['cost' => 12]);
        $pdo->prepare('
            INSERT INTO users (id, name, email, password_hash, role, title, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ')->execute([
            'usr-admin-1',
            'Yaswant Admin',
            'admin@yaswantcode.edu',
            $hash,
            'admin',
            'Chief Systems Administrator',
            'https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff&size=200'
        ]);
    }
} catch (Throwable $e) {}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET ?action=overview — Global Metrics & Stats
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'overview') {
    $stats = [
        'users' => [
            'total'       => 0,
            'students'    => 0,
            'admins'      => 0,
            'active'      => 0,
        ],
        'courses' => [
            'total'      => 0,
            'published'  => 0,
            'featured'   => 0,
            'bestseller' => 0,
        ],
        'notes' => [
            'total'      => 0,
            'pdf'        => 0,
            'drive'      => 0,
        ],
        'tools' => [
            'total'      => 0,
            'zip'        => 0,
            'drive'      => 0,
        ],
        'enrollments' => [
            'total'     => 0,
            'completed' => 0,
        ],
        'inquiries' => [
            'total'  => 0,
            'recent' => [],
        ],
        'subscribers' => [
            'total'  => 0,
            'active' => 0,
        ],
        'quizzes' => [
            'total'    => 0,
            'attempts' => 0,
        ],
        'assignments' => [
            'total'       => 0,
            'submissions' => 0,
        ],
        'certificates' => [
            'total' => 0,
        ],
        'discussions' => [
            'total'      => 0,
            'unresolved' => 0,
        ],
        'database' => [
            'status'     => 'connected',
            'driver'     => get_db_driver($pdo),
            'database'   => DB_NAME,
            'host'       => DB_HOST,
            'server'     => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
            'php_version'=> PHP_VERSION,
        ]
    ];

    try {
        $stats['users']['total']    = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $stats['users']['students'] = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'student'")->fetchColumn();
        $stats['users']['admins']   = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();
        $stats['users']['active']   = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE is_active = 1")->fetchColumn();
    } catch (Throwable $e) {}

    try {
        $stats['courses']['total']      = (int)$pdo->query("SELECT COUNT(*) FROM courses")->fetchColumn();
        $stats['courses']['published']  = (int)$pdo->query("SELECT COUNT(*) FROM courses WHERE (is_deleted = 0 OR is_deleted IS NULL)")->fetchColumn();
        $stats['courses']['featured']   = (int)$pdo->query("SELECT COUNT(*) FROM courses WHERE is_featured = 1 AND (is_deleted = 0 OR is_deleted IS NULL)")->fetchColumn();
        $stats['courses']['bestseller'] = (int)$pdo->query("SELECT COUNT(*) FROM courses WHERE is_bestseller = 1 AND (is_deleted = 0 OR is_deleted IS NULL)")->fetchColumn();
    } catch (Throwable $e) {}

    try {
        $stats['notes']['total'] = (int)$pdo->query("SELECT COUNT(*) FROM study_notes")->fetchColumn();
        $stats['notes']['pdf']   = (int)$pdo->query("SELECT COUNT(*) FROM study_notes WHERE resource_type = 'pdf'")->fetchColumn();
        $stats['notes']['drive'] = (int)$pdo->query("SELECT COUNT(*) FROM study_notes WHERE resource_type != 'pdf'")->fetchColumn();
    } catch (Throwable $e) {}

    try {
        $stats['tools']['total'] = (int)$pdo->query("SELECT COUNT(*) FROM developer_tools")->fetchColumn();
        $stats['tools']['zip']   = (int)$pdo->query("SELECT COUNT(*) FROM developer_tools WHERE download_type = 'zip'")->fetchColumn();
        $stats['tools']['drive'] = (int)$pdo->query("SELECT COUNT(*) FROM developer_tools WHERE download_type != 'zip'")->fetchColumn();
    } catch (Throwable $e) {}

    try {
        $stats['enrollments']['total']     = (int)$pdo->query("SELECT COUNT(*) FROM enrollments")->fetchColumn();
        $stats['enrollments']['completed'] = (int)$pdo->query("SELECT COUNT(*) FROM enrollments WHERE progress_percent >= 100 OR completed_at IS NOT NULL")->fetchColumn();
    } catch (Throwable $e) {}

    try {
        $stats['inquiries']['total'] = (int)$pdo->query("SELECT COUNT(*) FROM inquiries")->fetchColumn();
        $inqStmt = $pdo->query("SELECT id, name, email, subject, message, course, created_at FROM inquiries ORDER BY created_at DESC LIMIT 5");
        $stats['inquiries']['recent'] = $inqStmt->fetchAll();
    } catch (Throwable $e) {}

    try {
        $stats['subscribers']['total']  = (int)$pdo->query("SELECT COUNT(*) FROM subscribers")->fetchColumn();
        $stats['subscribers']['active'] = (int)$pdo->query("SELECT COUNT(*) FROM subscribers WHERE is_active = 1")->fetchColumn();
    } catch (Throwable $e) {}

    try {
        $stats['quizzes']['total']    = (int)$pdo->query("SELECT COUNT(*) FROM quizzes")->fetchColumn();
        $stats['quizzes']['attempts'] = (int)$pdo->query("SELECT COUNT(*) FROM quiz_attempts")->fetchColumn();
    } catch (Throwable $e) {}

    try {
        $stats['assignments']['total']       = (int)$pdo->query("SELECT COUNT(*) FROM assignments")->fetchColumn();
        $stats['assignments']['submissions'] = (int)$pdo->query("SELECT COUNT(*) FROM assignment_submissions")->fetchColumn();
    } catch (Throwable $e) {}

    try {
        $stats['certificates']['total'] = (int)$pdo->query("SELECT COUNT(*) FROM certificates")->fetchColumn();
    } catch (Throwable $e) {}

    try {
        $stats['discussions']['total']      = (int)$pdo->query("SELECT COUNT(*) FROM discussions")->fetchColumn();
        $stats['discussions']['unresolved'] = (int)$pdo->query("SELECT COUNT(*) FROM discussions WHERE has_accepted_answer = 0")->fetchColumn();
    } catch (Throwable $e) {}

    try {
        $uStmt = $pdo->query("SELECT id, name, email, role, avatar, title, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 5");
        $stats['recent_users'] = $uStmt->fetchAll();
    } catch (Throwable $e) {
        $stats['recent_users'] = [];
    } catch (Throwable $e) {
        $stats['recent_users'] = [];
    }

    ok($stats, 'Admin overview metrics loaded');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET ?action=users — Full User Directory
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'users') {
    $search = trim($_GET['search'] ?? '');
    $role   = trim($_GET['role'] ?? 'All');
    $status = trim($_GET['status'] ?? 'All');

    $where  = ['1=1'];
    $params = [];

    if ($role !== 'All' && in_array(strtolower($role), ['student', 'admin'], true)) {
        $where[]  = 'u.role = ?';
        $params[] = strtolower($role);
    }

    if ($status === 'active') {
        $where[] = 'u.is_active = 1';
    } elseif ($status === 'inactive') {
        $where[] = 'u.is_active = 0';
    }

    if ($search !== '') {
        $where[]  = '(u.name LIKE ? OR u.email LIKE ? OR u.title LIKE ?)';
        $like     = '%' . $search . '%';
        $params[] = $like;
        $params[] = $like;
        $params[] = $like;
    }

    $whereSql = implode(' AND ', $where);
    $limit = isset($_GET['limit']) ? max(1, min(1000, (int)$_GET['limit'])) : 300;
    $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;
    $sql = "
        SELECT u.id, u.name, u.email, u.role, u.avatar, u.title, u.bio,
               u.rating, u.reviews_count, u.students_count, u.is_active, u.created_at,
               (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id) AS enrolled_count
        FROM users u
        WHERE {$whereSql}
        ORDER BY u.created_at DESC
        LIMIT {$limit} OFFSET {$offset}
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $users = $stmt->fetchAll();

    $users = array_map(function($u) {
        return [
            'id'             => $u['id'],
            'name'           => $u['name'],
            'email'          => $u['email'],
            'role'           => $u['role'],
            'avatar'         => $u['avatar'] ?: 'https://ui-avatars.com/api/?name=' . urlencode($u['name']) . '&background=6366f1&color=fff',
            'title'          => $u['title'] ?: ($u['role'] === 'admin' ? 'Administrator' : 'Engineering Student'),
            'rating'         => (float)($u['rating'] ?? 5.00),
            'reviewsCount'   => (int)($u['reviews_count'] ?? 0),
            'studentsCount'  => (int)($u['students_count'] ?? 0),
            'isActive'       => (bool)($u['is_active'] ?? 1),
            'createdAt'      => $u['created_at'],
            'enrolledCount'  => (int)($u['enrolled_count'] ?? 0),
        ];
    }, $users);

    ok($users, 'Users loaded');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST ?action=create_user — Provision New User Account
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'create_user') {
    $input = get_json_input();

    $name     = str_input($input, 'name');
    $email    = strtolower(str_input($input, 'email'));
    $password = str_input($input, 'password');
    $role     = in_array($input['role'] ?? '', ['student', 'admin'], true) ? $input['role'] : 'student';
    $title    = str_input($input, 'title');

    if (!$name) fail('User name is required.', 422);
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Valid email address is required.', 422);
    if (strlen($password) < 6) fail('Password must be at least 6 characters.', 422);

    $checkStmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $checkStmt->execute([$email]);
    if ($checkStmt->fetch()) {
        fail('A user with this email address already exists.', 409);
    }

    $id = generate_id('usr');
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $avatar = 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=' . ($role === 'admin' ? 'ef4444' : '3b82f6') . '&color=fff';

    $stmt = $pdo->prepare('
        INSERT INTO users (id, name, email, password_hash, role, avatar, title, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    ');
    $stmt->execute([$id, $name, $email, $hash, $role, $avatar, $title ?: null]);

    ok([
        'id'       => $id,
        'name'     => $name,
        'email'    => $email,
        'role'     => $role,
        'avatar'   => $avatar,
        'title'    => $title,
        'isActive' => true,
    ], 'User provisioned successfully', 201);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. POST ?action=update_user — Edit User Role, Status, Password or Details
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'update_user') {
    $input = get_json_input();
    $userId = str_input($input, 'id');
    if (!$userId) fail('User ID is required.', 422);

    $checkStmt = $pdo->prepare('SELECT id, role, is_active FROM users WHERE id = ?');
    $checkStmt->execute([$userId]);
    $user = $checkStmt->fetch();
    if (!$user) fail('User not found.', 404);

    $updates = [];
    $params  = [];

    if (isset($input['role']) && in_array($input['role'], ['student', 'admin'], true)) {
        $updates[] = 'role = ?';
        $params[]  = $input['role'];
    }

    if (isset($input['isActive'])) {
        $updates[] = 'is_active = ?';
        $params[]  = $input['isActive'] ? 1 : 0;
    }

    if (!empty($input['name'])) {
        $updates[] = 'name = ?';
        $params[]  = trim((string)$input['name']);
    }

    if (!empty($input['title'])) {
        $updates[] = 'title = ?';
        $params[]  = trim((string)$input['title']);
    }

    if (!empty($input['password'])) {
        if (strlen((string)$input['password']) < 6) fail('Password must be at least 6 characters.', 422);
        $updates[] = 'password_hash = ?';
        $params[]  = password_hash((string)$input['password'], PASSWORD_BCRYPT, ['cost' => 12]);
    }

    if (empty($updates)) {
        fail('No update parameters provided.', 422);
    }

    $params[] = $userId;
    $sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $pdo->prepare($sql)->execute($params);

    ok(['id' => $userId], 'User record updated successfully');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. POST ?action=delete_user — Delete User
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'delete_user') {
    $input  = get_json_input();
    $userId = str_input($input, 'id');
    if (!$userId) fail('User ID is required.', 422);

    $userStmt = $pdo->prepare('SELECT role FROM users WHERE id = ?');
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch();
    if (!$user) fail('User not found.', 404);

    if ($user['role'] === 'admin') {
        $adminCount = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();
        if ($adminCount <= 1) {
            fail('Cannot delete the primary administrator account.', 400);
        }
    }

    $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$userId]);
    ok(['id' => $userId], 'User deleted successfully');
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. GET ?action=courses — Course Catalog
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'courses') {
    $sql = "
        SELECT c.id, c.title, c.tagline, c.description, c.thumbnail, c.category, c.difficulty,
               c.rating, c.reviews_count, c.students_count, c.duration_hours, c.lessons_count,
               c.price, c.original_price, c.discount_percentage,
               c.is_bestseller, c.is_featured, c.is_deleted, c.language, c.created_at,
               u.id AS instructor_id, u.name AS instructor_name, u.email AS instructor_email
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        ORDER BY c.created_at DESC
    ";
    $stmt = $pdo->query($sql);
    $courses = $stmt->fetchAll();

    $courses = array_map(function($c) {
        return [
            'id'             => $c['id'],
            'title'          => $c['title'],
            'tagline'        => $c['tagline'] ?? '',
            'description'    => $c['description'] ?? '',
            'thumbnail'      => $c['thumbnail'],
            'category'       => $c['category'],
            'difficulty'     => $c['difficulty'],
            'rating'         => (float)$c['rating'],
            'reviewsCount'   => (int)$c['reviews_count'],
            'studentsCount'  => (int)$c['students_count'],
            'durationHours'  => (int)$c['duration_hours'],
            'lessonsCount'   => (int)$c['lessons_count'],
            'price'          => (float)$c['price'],
            'originalPrice'  => $c['original_price'] ? (float)$c['original_price'] : null,
            'isBestseller'   => (bool)$c['is_bestseller'],
            'isFeatured'     => (bool)$c['is_featured'],
            'isDeleted'      => (bool)$c['is_deleted'],
            'createdAt'      => $c['created_at'],
            'instructor'     => [
                'id'    => $c['instructor_id'] ?? '',
                'name'  => $c['instructor_name'] ?? 'Staff Mentor',
                'email' => $c['instructor_email'] ?? '',
            ]
        ];
    }, $courses);

    ok($courses, 'Courses loaded');
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. POST ?action=create_course — Admin Create Course
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'create_course') {
    $input = get_json_input();

    $title = str_input($input, 'title');
    if (!$title) fail('Course title is required.', 422);

    $id = generate_id('course');
    $instructorId = $currentAdmin['id'];
    $price = isset($input['price']) ? (float)$input['price'] : 0.00;

    $stmt = $pdo->prepare('
        INSERT INTO courses
          (id, instructor_id, title, tagline, description, thumbnail, category,
           difficulty, price, original_price, discount_percentage, duration_hours, lessons_count, language, is_featured, is_bestseller)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $id,
        $instructorId,
        $title,
        str_input($input, 'tagline'),
        str_input($input, 'description'),
        str_input($input, 'thumbnail') ?: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
        str_input($input, 'category') ?: 'General',
        in_array($input['difficulty'] ?? '', ['Beginner','Intermediate','Advanced','All Levels']) ? $input['difficulty'] : 'Beginner',
        $price,
        isset($input['original_price']) ? (float)$input['original_price'] : null,
        isset($input['discount_percentage']) ? (int)$input['discount_percentage'] : 0,
        int_input($input, 'duration_hours', 10),
        int_input($input, 'lessons_count', 15),
        str_input($input, 'language') ?: 'English',
        !empty($input['is_featured']) ? 1 : 0,
        !empty($input['is_bestseller']) ? 1 : 0,
    ]);

    ok(['id' => $id], 'Course created successfully', 201);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. POST ?action=update_course — Admin Update Course
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'update_course') {
    $input = get_json_input();
    $id = str_input($input, 'id');
    if (!$id) fail('Course ID is required.', 422);

    $allowed = ['title', 'tagline', 'description', 'thumbnail', 'category', 'difficulty',
                'price', 'original_price', 'discount_percentage', 'duration_hours',
                'lessons_count', 'language', 'is_featured', 'is_bestseller', 'is_deleted'];
    $sets = [];
    $vals = [];

    foreach ($allowed as $f) {
        if (array_key_exists($f, $input)) {
            $sets[] = "{$f} = ?";
            if (in_array($f, ['is_featured', 'is_bestseller', 'is_deleted'], true)) {
                $vals[] = $input[$f] ? 1 : 0;
            } elseif (in_array($f, ['price', 'original_price'], true)) {
                $vals[] = $input[$f] !== null ? (float)$input[$f] : null;
            } elseif (in_array($f, ['duration_hours', 'lessons_count', 'discount_percentage'], true)) {
                $vals[] = (int)$input[$f];
            } else {
                $vals[] = trim((string)$input[$f]);
            }
        }
    }

    if (empty($sets)) fail('No course fields to update.', 422);

    $vals[] = $id;
    $sql = "UPDATE courses SET " . implode(', ', $sets) . " WHERE id = ?";
    $pdo->prepare($sql)->execute($vals);

    ok(['id' => $id], 'Course updated successfully');
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. POST ?action=toggle_course — Toggle Course Status
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'toggle_course') {
    $input    = get_json_input();
    $courseId = str_input($input, 'id');
    $field    = str_input($input, 'field');
    $value    = (bool)($input['value'] ?? false);

    if (!$courseId) fail('Course ID is required.', 422);

    $columnMap = [
        'featured'   => 'is_featured',
        'bestseller' => 'is_bestseller',
        'deleted'    => 'is_deleted',
    ];

    if (!isset($columnMap[$field])) fail('Invalid toggle field.', 422);
    $column = $columnMap[$field];

    $stmt = $pdo->prepare("UPDATE courses SET {$column} = ? WHERE id = ?");
    $stmt->execute([$value ? 1 : 0, $courseId]);

    ok(['id' => $courseId, 'field' => $field, 'value' => $value], 'Course status updated');
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. POST ?action=delete_course — Delete or Archive Course
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'delete_course') {
    $input    = get_json_input();
    $courseId = str_input($input, 'id');
    $hard     = !empty($input['hard']);

    if (!$courseId) fail('Course ID is required.', 422);

    if ($hard) {
        $pdo->prepare('DELETE FROM courses WHERE id = ?')->execute([$courseId]);
        ok(['id' => $courseId], 'Course permanently deleted');
    } else {
        $pdo->prepare('UPDATE courses SET is_deleted = 1 WHERE id = ?')->execute([$courseId]);
        ok(['id' => $courseId], 'Course archived');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. GET ?action=notes — Study Notes Catalog
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'notes') {
    $stmt = $pdo->query('
        SELECT id, title, topic, category, resource_type, url, file_size, thumbnail,
               description, author, pinned, starred, tags, created_at, updated_at
        FROM study_notes
        ORDER BY pinned DESC, created_at DESC
    ');
    $notes = $stmt->fetchAll();

    $notes = array_map(function($n) {
        return [
            'id'           => $n['id'],
            'title'        => $n['title'],
            'topic'        => $n['topic'] ?? '',
            'courseOrTopic'=> $n['topic'] ?? '',
            'category'     => $n['category'] ?? 'General',
            'resourceType' => $n['resource_type'] ?? 'pdf',
            'url'          => $n['url'],
            'fileSize'     => $n['file_size'] ?? '',
            'thumbnail'    => $n['thumbnail'] ?: 'https://images.unsplash.com/photo-1516116211227-bbc13c6b2452?w=800&auto=format&fit=crop&q=80',
            'description'  => $n['description'] ?? '',
            'author'       => $n['author'] ?? 'Yaswant Pandey',
            'pinned'       => (bool)($n['pinned'] ?? false),
            'starred'      => (bool)($n['starred'] ?? false),
            'tags'         => $n['tags'] ? array_map('trim', explode(',', $n['tags'])) : [],
            'createdAt'    => $n['created_at'],
            'updatedAt'    => $n['updated_at'] ?? $n['created_at'],
        ];
    }, $notes);

    ok($notes, 'Study notes loaded');
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. POST ?action=create_note — Create Study Note
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'create_note') {
    $input = get_json_input();

    $title = str_input($input, 'title');
    $url   = str_input($input, 'url');
    if (!$title) fail('Note title is required.', 422);
    if (!$url) fail('PDF or Google Drive URL is required.', 422);

    $id = 'note-' . bin2hex(random_bytes(4));
    $tagsStr = is_array($input['tags'] ?? null) ? implode(', ', $input['tags']) : str_input($input, 'tags');

    $stmt = $pdo->prepare('
        INSERT INTO study_notes (id, title, topic, category, resource_type, url, file_size, thumbnail, description, author, pinned, starred, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $id,
        $title,
        str_input($input, 'topic') ?: str_input($input, 'courseOrTopic'),
        str_input($input, 'category') ?: 'General',
        str_input($input, 'resourceType') ?: 'pdf',
        $url,
        str_input($input, 'fileSize') ?: 'PDF Document',
        str_input($input, 'thumbnail'),
        str_input($input, 'description'),
        str_input($input, 'author') ?: 'Yaswant Pandey',
        !empty($input['pinned']) ? 1 : 0,
        !empty($input['starred']) ? 1 : 0,
        $tagsStr,
    ]);

    ok(['id' => $id], 'Study note created successfully', 201);
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. POST ?action=update_note — Update Study Note
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'update_note') {
    $input = get_json_input();
    $id = str_input($input, 'id');
    if (!$id) fail('Note ID is required.', 422);

    $fields = ['title', 'topic', 'category', 'resource_type', 'url', 'file_size', 'thumbnail', 'description', 'author', 'pinned', 'starred', 'tags'];
    $sets = [];
    $vals = [];

    if (isset($input['title'])) { $sets[] = 'title = ?'; $vals[] = trim((string)$input['title']); }
    if (isset($input['topic']) || isset($input['courseOrTopic'])) {
        $sets[] = 'topic = ?'; $vals[] = trim((string)($input['topic'] ?? $input['courseOrTopic']));
    }
    if (isset($input['category'])) { $sets[] = 'category = ?'; $vals[] = trim((string)$input['category']); }
    if (isset($input['resourceType'])) { $sets[] = 'resource_type = ?'; $vals[] = trim((string)$input['resourceType']); }
    if (isset($input['url'])) { $sets[] = 'url = ?'; $vals[] = trim((string)$input['url']); }
    if (isset($input['fileSize'])) { $sets[] = 'file_size = ?'; $vals[] = trim((string)$input['fileSize']); }
    if (isset($input['thumbnail'])) { $sets[] = 'thumbnail = ?'; $vals[] = trim((string)$input['thumbnail']); }
    if (isset($input['description'])) { $sets[] = 'description = ?'; $vals[] = trim((string)$input['description']); }
    if (isset($input['author'])) { $sets[] = 'author = ?'; $vals[] = trim((string)$input['author']); }
    if (isset($input['pinned'])) { $sets[] = 'pinned = ?'; $vals[] = $input['pinned'] ? 1 : 0; }
    if (isset($input['starred'])) { $sets[] = 'starred = ?'; $vals[] = $input['starred'] ? 1 : 0; }
    if (isset($input['tags'])) {
        $sets[] = 'tags = ?';
        $vals[] = is_array($input['tags']) ? implode(', ', $input['tags']) : (string)$input['tags'];
    }

    if (empty($sets)) fail('No note fields provided.', 422);

    $vals[] = $id;
    $sql = "UPDATE study_notes SET " . implode(', ', $sets) . " WHERE id = ?";
    $pdo->prepare($sql)->execute($vals);

    ok(['id' => $id], 'Study note updated successfully');
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. POST ?action=delete_note — Delete Study Note
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'delete_note') {
    $input = get_json_input();
    $id = str_input($input, 'id');
    if (!$id) fail('Note ID is required.', 422);

    $pdo->prepare('DELETE FROM study_notes WHERE id = ?')->execute([$id]);
    ok(['id' => $id], 'Study note removed');
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. GET ?action=tools — Developer Tools Catalog
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'tools') {
    $stmt = $pdo->query('
        SELECT id, name, tagline, description, category, download_type, download_url,
               file_size, version, os_support, thumbnail, downloads_count, featured,
               author, created_at, updated_at
        FROM developer_tools
        ORDER BY featured DESC, created_at DESC
    ');
    $tools = $stmt->fetchAll();

    $tools = array_map(function($t) {
        return [
            'id'            => $t['id'],
            'name'          => $t['name'],
            'tagline'       => $t['tagline'] ?? '',
            'description'   => $t['description'] ?? '',
            'category'      => $t['category'] ?? 'Utilities',
            'downloadType'  => $t['download_type'] ?? 'zip',
            'downloadUrl'   => $t['download_url'],
            'fileSize'      => $t['file_size'] ?? '',
            'version'       => $t['version'] ?? 'v1.0.0',
            'osSupport'     => $t['os_support'] ? array_map('trim', explode(',', $t['os_support'])) : ['Windows', 'macOS', 'Linux'],
            'thumbnail'     => $t['thumbnail'] ?: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
            'downloadsCount'=> (int)($t['downloads_count'] ?? 0),
            'featured'      => (bool)($t['featured'] ?? false),
            'author'        => $t['author'] ?? 'Yaswant Team',
            'createdAt'     => $t['created_at'],
            'updatedAt'     => $t['updated_at'] ?? $t['created_at'],
        ];
    }, $tools);

    ok($tools, 'Developer tools loaded');
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. POST ?action=create_tool — Create Developer Tool Download
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'create_tool') {
    $input = get_json_input();

    $name = str_input($input, 'name');
    $url  = str_input($input, 'downloadUrl');
    if (!$name) fail('Tool name is required.', 422);
    if (!$url) fail('Download URL (ZIP or Drive) is required.', 422);

    $id = 'tool-' . bin2hex(random_bytes(4));
    $osStr = is_array($input['osSupport'] ?? null) ? implode(', ', $input['osSupport']) : str_input($input, 'osSupport', 'Windows, macOS, Linux');

    $stmt = $pdo->prepare('
        INSERT INTO developer_tools (id, name, tagline, description, category, download_type, download_url, file_size, version, os_support, thumbnail, downloads_count, featured, author)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $id,
        $name,
        str_input($input, 'tagline'),
        str_input($input, 'description'),
        str_input($input, 'category') ?: 'Utilities',
        str_input($input, 'downloadType') ?: 'zip',
        $url,
        str_input($input, 'fileSize') ?: 'ZIP Archive',
        str_input($input, 'version') ?: 'v1.0.0',
        $osStr,
        str_input($input, 'thumbnail'),
        int_input($input, 'downloadsCount', 100),
        !empty($input['featured']) ? 1 : 0,
        str_input($input, 'author') ?: 'Yaswant Team',
    ]);

    ok(['id' => $id], 'Developer tool created successfully', 201);
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. POST ?action=update_tool — Update Developer Tool
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'update_tool') {
    $input = get_json_input();
    $id = str_input($input, 'id');
    if (!$id) fail('Tool ID is required.', 422);

    $sets = [];
    $vals = [];

    if (isset($input['name'])) { $sets[] = 'name = ?'; $vals[] = trim((string)$input['name']); }
    if (isset($input['tagline'])) { $sets[] = 'tagline = ?'; $vals[] = trim((string)$input['tagline']); }
    if (isset($input['description'])) { $sets[] = 'description = ?'; $vals[] = trim((string)$input['description']); }
    if (isset($input['category'])) { $sets[] = 'category = ?'; $vals[] = trim((string)$input['category']); }
    if (isset($input['downloadType'])) { $sets[] = 'download_type = ?'; $vals[] = trim((string)$input['downloadType']); }
    if (isset($input['downloadUrl'])) { $sets[] = 'download_url = ?'; $vals[] = trim((string)$input['downloadUrl']); }
    if (isset($input['fileSize'])) { $sets[] = 'file_size = ?'; $vals[] = trim((string)$input['fileSize']); }
    if (isset($input['version'])) { $sets[] = 'version = ?'; $vals[] = trim((string)$input['version']); }
    if (isset($input['thumbnail'])) { $sets[] = 'thumbnail = ?'; $vals[] = trim((string)$input['thumbnail']); }
    if (isset($input['author'])) { $sets[] = 'author = ?'; $vals[] = trim((string)$input['author']); }
    if (isset($input['featured'])) { $sets[] = 'featured = ?'; $vals[] = $input['featured'] ? 1 : 0; }
    if (isset($input['downloadsCount'])) { $sets[] = 'downloads_count = ?'; $vals[] = (int)$input['downloadsCount']; }
    if (isset($input['osSupport'])) {
        $sets[] = 'os_support = ?';
        $vals[] = is_array($input['osSupport']) ? implode(', ', $input['osSupport']) : (string)$input['osSupport'];
    }

    if (empty($sets)) fail('No tool fields provided.', 422);

    $vals[] = $id;
    $sql = "UPDATE developer_tools SET " . implode(', ', $sets) . " WHERE id = ?";
    $pdo->prepare($sql)->execute($vals);

    ok(['id' => $id], 'Developer tool updated successfully');
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. POST ?action=delete_tool — Delete Developer Tool
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'delete_tool') {
    $input = get_json_input();
    $id = str_input($input, 'id');
    if (!$id) fail('Tool ID is required.', 422);

    $pdo->prepare('DELETE FROM developer_tools WHERE id = ?')->execute([$id]);
    ok(['id' => $id], 'Developer tool removed');
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. GET ?action=inquiries — Contact Form Messages
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'inquiries') {
    $stmt = $pdo->query('
        SELECT id, name, email, subject, message, course, phone, ip_address, created_at
        FROM inquiries
        ORDER BY created_at DESC
    ');
    $inquiries = $stmt->fetchAll();
    ok($inquiries, 'Inquiries loaded');
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. POST ?action=delete_inquiry — Remove Message
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'delete_inquiry') {
    $input = get_json_input();
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) fail('Inquiry ID is required.', 422);

    $pdo->prepare('DELETE FROM inquiries WHERE id = ?')->execute([$id]);
    ok(['id' => $id], 'Inquiry removed');
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. GET ?action=subscribers — Newsletter Audience
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'subscribers') {
    $limit = isset($_GET['limit']) ? max(1, min(2000, (int)$_GET['limit'])) : 500;
    $stmt = $pdo->query("
        SELECT id, email, name, is_active, subscribed_at
        FROM subscribers
        ORDER BY subscribed_at DESC
        LIMIT {$limit}
    ");
    $subscribers = $stmt->fetchAll();
    ok($subscribers, 'Subscribers loaded');
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. POST ?action=toggle_subscriber — Toggle Subscriber Status or Delete
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'toggle_subscriber') {
    $input = get_json_input();
    $id = (int)($input['id'] ?? 0);
    $actionType = str_input($input, 'type', 'toggle');

    if ($id <= 0) fail('Subscriber ID is required.', 422);

    if ($actionType === 'delete') {
        $pdo->prepare('DELETE FROM subscribers WHERE id = ?')->execute([$id]);
        ok(['id' => $id], 'Subscriber deleted');
    } else {
        $pdo->prepare('UPDATE subscribers SET is_active = IF(is_active=1, 0, 1) WHERE id = ?')->execute([$id]);
        ok(['id' => $id], 'Subscriber status updated');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 23. GET ?action=settings — Site Settings & Announcements
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'settings') {
    $stmt = $pdo->query('SELECT setting_key, setting_value FROM site_settings');
    $rows = $stmt->fetchAll();
    $settings = [];
    foreach ($rows as $r) {
        $settings[$r['setting_key']] = $r['setting_value'];
    }
    ok($settings, 'Site settings loaded');
}

// ─────────────────────────────────────────────────────────────────────────────
// 24. POST ?action=update_settings — Batch Update Site Settings
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'update_settings') {
    $input = get_json_input();
    if (!is_array($input) || empty($input)) fail('Invalid settings payload.', 422);

    // Allowlist of permitted setting keys — prevents arbitrary key injection
    $allowedKeys = [
        'announcement_enabled', 'announcement_badge', 'announcement_text',
        'announcement_link', 'announcement_btn_text',
        'platform_title', 'platform_tagline',
        'contact_email', 'support_phone', 'office_location',
        'github_url', 'youtube_url', 'linkedin_url', 'telegram_url',
        'maintenance_mode', 'allow_registration',
    ];

    $stmt = $pdo->prepare('
        INSERT INTO site_settings (setting_key, setting_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ');

    $saved = 0;
    foreach ($input as $key => $val) {
        if (!in_array((string)$key, $allowedKeys, true)) {
            continue; // silently skip unknown keys
        }
        $stmt->execute([trim((string)$key), is_bool($val) ? ($val ? '1' : '0') : (string)$val]);
        $saved++;
    }

    ok(true, "Platform settings saved successfully ({$saved} keys updated)");
}

// ─────────────────────────────────────────────────────────────────────────────
// 25. GET ?action=db_stats — Database Tables & Row Counts
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'db_stats') {
    $driver = get_db_driver($pdo);
    $tables = [];

    if ($driver === 'mysql') {
        $stmt = $pdo->prepare('
            SELECT TABLE_NAME as name, TABLE_ROWS as rows_count,
                   ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS size_mb
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = ?
            ORDER BY TABLE_ROWS DESC
        ');
        $stmt->execute([DB_NAME]);
        $tables = $stmt->fetchAll();
    } else {
        $q = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        while ($t = $q->fetch()) {
            $tableName = $t['name'];
            $count = (int)$pdo->query("SELECT COUNT(*) FROM \"{$tableName}\"")->fetchColumn();
            $tables[] = ['name' => $tableName, 'rows_count' => $count, 'size_mb' => 0.01];
        }
    }

    ok([
        'driver'       => $driver,
        'database'     => DB_NAME,
        'host'         => DB_HOST,
        'serverVersion'=> $pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
        'tables'       => $tables,
    ], 'Database statistics loaded');
}


// ─────────────────────────────────────────────────────────────────────────────

// PROJECTS — Capstone Engineering Projects CRUD
// ─────────────────────────────────────────────────────────────────────────────
function ensure_projects_table(PDO $pdo): void {
    $driver = get_db_driver($pdo);
    if ($driver === 'mysql') {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `projects` (
                `id` VARCHAR(64) PRIMARY KEY,
                `title` VARCHAR(255) NOT NULL,
                `tagline` VARCHAR(500) DEFAULT '',
                `description` TEXT DEFAULT NULL,
                `category` VARCHAR(100) DEFAULT 'Full-Stack',
                `difficulty` VARCHAR(50) DEFAULT 'Intermediate',
                `estimated_hours` INT DEFAULT 24,
                `tech_stack` TEXT DEFAULT NULL,
                `thumbnail` TEXT DEFAULT NULL,
                `course_relation` VARCHAR(255) DEFAULT '',
                `starter_repo_command` TEXT DEFAULT NULL,
                `live_demo_url` TEXT DEFAULT NULL,
                `status` VARCHAR(50) DEFAULT 'Available',
                `submissions_count` INT DEFAULT 0,
                `featured` TINYINT(1) DEFAULT 0,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } else {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                tagline TEXT DEFAULT '',
                description TEXT,
                category TEXT DEFAULT 'Full-Stack',
                difficulty TEXT DEFAULT 'Intermediate',
                estimated_hours INTEGER DEFAULT 24,
                tech_stack TEXT,
                thumbnail TEXT,
                course_relation TEXT DEFAULT '',
                starter_repo_command TEXT,
                live_demo_url TEXT,
                status TEXT DEFAULT 'Available',
                submissions_count INTEGER DEFAULT 0,
                featured INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        ");
    }
}

if ($action === 'projects') {
    ensure_projects_table($pdo);
    $rows = $pdo->query("SELECT * FROM projects ORDER BY created_at DESC")->fetchAll();
    $projects = array_map(function($r) {
        return [
            'id' => $r['id'],
            'title' => $r['title'],
            'tagline' => $r['tagline'] ?? '',
            'description' => $r['description'] ?? '',
            'category' => $r['category'] ?? 'Full-Stack',
            'difficulty' => $r['difficulty'] ?? 'Intermediate',
            'estimatedHours' => (int)($r['estimated_hours'] ?? 24),
            'techStack' => array_filter(array_map('trim', explode(',', $r['tech_stack'] ?? ''))),
            'thumbnail' => $r['thumbnail'] ?? '',
            'courseRelation' => $r['course_relation'] ?? '',
            'starterRepoCommand' => $r['starter_repo_command'] ?? '',
            'liveDemoUrl' => $r['live_demo_url'] ?? '',
            'status' => $r['status'] ?? 'Available',
            'submissionsCount' => (int)($r['submissions_count'] ?? 0),
            'featured' => (bool)($r['featured'] ?? false),
        ];
    }, $rows);
    ok($projects, 'Projects loaded');
}

if ($method === 'POST' && $action === 'create_project') {
    ensure_projects_table($pdo);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['title'])) fail('Project title is required.', 400);
    $id = 'proj-' . uniqid();
    $techStack = is_array($b['techStack'] ?? null) ? implode(', ', $b['techStack']) : ($b['techStack'] ?? '');
    $pdo->prepare("INSERT INTO projects (id, title, tagline, description, category, difficulty, estimated_hours, tech_stack, thumbnail, course_relation, starter_repo_command, live_demo_url, status, featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
        ->execute([$id, $b['title'], $b['tagline'] ?? '', $b['description'] ?? '', $b['category'] ?? 'Full-Stack', $b['difficulty'] ?? 'Intermediate', (int)($b['estimatedHours'] ?? 24), $techStack, $b['thumbnail'] ?? '', $b['courseRelation'] ?? '', $b['starterRepoCommand'] ?? '', $b['liveDemoUrl'] ?? '', $b['status'] ?? 'Available', (int)($b['featured'] ?? 1)]);
    ok(['id' => $id], 'Project created');
}

if ($method === 'POST' && $action === 'update_project') {
    ensure_projects_table($pdo);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Project ID required.', 400);
    $techStack = is_array($b['techStack'] ?? null) ? implode(', ', $b['techStack']) : ($b['techStack'] ?? '');
    $pdo->prepare("UPDATE projects SET title=?, tagline=?, description=?, category=?, difficulty=?, estimated_hours=?, tech_stack=?, thumbnail=?, course_relation=?, starter_repo_command=?, live_demo_url=?, status=?, featured=? WHERE id=?")
        ->execute([$b['title'], $b['tagline'] ?? '', $b['description'] ?? '', $b['category'] ?? 'Full-Stack', $b['difficulty'] ?? 'Intermediate', (int)($b['estimatedHours'] ?? 24), $techStack, $b['thumbnail'] ?? '', $b['courseRelation'] ?? '', $b['starterRepoCommand'] ?? '', $b['liveDemoUrl'] ?? '', $b['status'] ?? 'Available', (int)($b['featured'] ?? 1), $b['id']]);
    ok(['id' => $b['id']], 'Project updated');
}

if ($method === 'POST' && $action === 'delete_project') {
    ensure_projects_table($pdo);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Project ID required.', 400);
    $pdo->prepare("DELETE FROM projects WHERE id=?")->execute([$b['id']]);
    ok([], 'Project deleted');
}

// ─────────────────────────────────────────────────────────────────────────────
// ROADMAPS — Tech Learning Paths CRUD
// ─────────────────────────────────────────────────────────────────────────────
function seed_canonical_roadmaps(PDO $pdo): int {
    $seedFile = __DIR__ . '/seed_roadmaps.json';
    if (!file_exists($seedFile)) {
        return 0;
    }
    $raw = file_get_contents($seedFile);
    $tracks = json_decode($raw, true);
    if (!is_array($tracks) || empty($tracks)) {
        return 0;
    }

    $driver = get_db_driver($pdo);
    $inserted = 0;
    $idx = 0;

    foreach ($tracks as $t) {
        $id = !empty($t['id']) ? $t['id'] : ('rm-' . ($t['slug'] ?? uniqid()));
        $slug = !empty($t['slug']) ? $t['slug'] : $id;
        $title = $t['title'] ?? 'Full Stack Track';
        $subtitle = $t['subtitle'] ?? '';
        $desc = $t['description'] ?? '';
        $badge = $t['badge'] ?? 'Official Career Track';
        $category = $t['category'] ?? ($t['id'] ?? 'web');
        $categoryLabel = $t['categoryLabel'] ?? ($t['title'] ?? 'Web Development');
        $tagline = $t['subtitle'] ?? '';
        $difficulty = $t['difficulty'] ?? 'Intermediate';
        $duration = $t['duration'] ?? '6 months';
        $weekly = $t['weeklyCommitment'] ?? '10-15 hrs/week';

        $stages = $t['stages'] ?? [];
        $totalTopics = 0;
        if (is_array($stages)) {
            foreach ($stages as $stg) {
                if (!empty($stg['topics']) && is_array($stg['topics'])) {
                    $totalTopics += count($stg['topics']);
                }
            }
        }
        $stagesJson = json_encode($stages, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $salary = $t['salaryBenchmark'] ?? '₹8–25 LPA';
        $careerRoles = 'Software Engineer, Full Stack Developer, Solutions Architect';
        $status = 'published';

        try {
            if ($driver === 'mysql') {
                $stmt = $pdo->prepare("
                    INSERT INTO roadmaps (id, slug, title, subtitle, description, badge, category, category_label, tagline, difficulty, duration, weekly_commitment, total_topics, salary_benchmark, career_roles, stages, status, order_index)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        title = VALUES(title),
                        subtitle = VALUES(subtitle),
                        description = VALUES(description),
                        badge = VALUES(badge),
                        category = VALUES(category),
                        category_label = VALUES(category_label),
                        tagline = VALUES(tagline),
                        difficulty = VALUES(difficulty),
                        duration = VALUES(duration),
                        weekly_commitment = VALUES(weekly_commitment),
                        total_topics = VALUES(total_topics),
                        salary_benchmark = VALUES(salary_benchmark),
                        career_roles = VALUES(career_roles),
                        stages = VALUES(stages),
                        status = VALUES(status),
                        order_index = VALUES(order_index),
                        updated_at = CURRENT_TIMESTAMP
                ");
            } else {
                $stmt = $pdo->prepare("
                    INSERT OR REPLACE INTO roadmaps (id, slug, title, subtitle, description, badge, category, category_label, tagline, difficulty, duration, weekly_commitment, total_topics, salary_benchmark, career_roles, stages, status, order_index)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
            }

            $stmt->execute([
                $id, $slug, $title, $subtitle, $desc, $badge, $category, $categoryLabel,
                $tagline, $difficulty, $duration, $weekly, $totalTopics, $salary, $careerRoles,
                $stagesJson, $status, $idx
            ]);
            $inserted++;
            $idx++;
        } catch (\Throwable $e) {
            // continue silently on duplicate or minor schema difference
        }
    }
    return $inserted;
}

function ensure_roadmaps_table(PDO $pdo): void {
    $driver = get_db_driver($pdo);
    if ($driver === 'mysql') {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `roadmaps` (
                `id` VARCHAR(64) PRIMARY KEY,
                `slug` VARCHAR(100) NOT NULL,
                `title` VARCHAR(255) NOT NULL,
                `subtitle` TEXT DEFAULT NULL,
                `description` LONGTEXT DEFAULT NULL,
                `badge` VARCHAR(100) DEFAULT 'Official Career Track',
                `category` VARCHAR(100) DEFAULT 'web',
                `category_label` VARCHAR(100) DEFAULT 'Web Development',
                `tagline` VARCHAR(500) DEFAULT '',
                `difficulty` VARCHAR(50) DEFAULT 'Intermediate',
                `duration` VARCHAR(100) DEFAULT '6 months',
                `weekly_commitment` VARCHAR(100) DEFAULT '10-15 hrs/week',
                `total_topics` INT DEFAULT 0,
                `salary_benchmark` VARCHAR(100) DEFAULT '₹8–25 LPA',
                `career_roles` TEXT DEFAULT NULL,
                `stages` LONGTEXT DEFAULT NULL,
                `status` VARCHAR(20) DEFAULT 'published',
                `order_index` INT DEFAULT 0,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Seamless migration: add any missing columns if table pre-existed with old schema
        try {
            $colsStmt = $pdo->query("SHOW COLUMNS FROM `roadmaps`");
            $existingCols = $colsStmt ? array_map('strtolower', $colsStmt->fetchAll(PDO::FETCH_COLUMN)) : [];
            if (!in_array('slug', $existingCols, true)) {
                $pdo->exec("ALTER TABLE `roadmaps` ADD COLUMN `slug` VARCHAR(100) NOT NULL DEFAULT 'full-stack'");
            }
            if (!in_array('subtitle', $existingCols, true)) {
                $pdo->exec("ALTER TABLE `roadmaps` ADD COLUMN `subtitle` TEXT DEFAULT NULL");
            }
            if (!in_array('badge', $existingCols, true)) {
                $pdo->exec("ALTER TABLE `roadmaps` ADD COLUMN `badge` VARCHAR(100) DEFAULT 'Official Career Track'");
            }
            if (!in_array('stages', $existingCols, true)) {
                $pdo->exec("ALTER TABLE `roadmaps` ADD COLUMN `stages` LONGTEXT DEFAULT NULL");
            }
            if (!in_array('status', $existingCols, true)) {
                $pdo->exec("ALTER TABLE `roadmaps` ADD COLUMN `status` VARCHAR(20) DEFAULT 'published'");
            }
            if (!in_array('order_index', $existingCols, true)) {
                $pdo->exec("ALTER TABLE `roadmaps` ADD COLUMN `order_index` INT DEFAULT 0");
            }
        } catch (\Throwable $e) {}
    } else {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS roadmaps (
                id TEXT PRIMARY KEY,
                slug TEXT NOT NULL,
                title TEXT NOT NULL,
                subtitle TEXT,
                description TEXT,
                badge TEXT DEFAULT 'Official Career Track',
                category TEXT DEFAULT 'web',
                category_label TEXT DEFAULT 'Web Development',
                tagline TEXT DEFAULT '',
                difficulty TEXT DEFAULT 'Intermediate',
                duration TEXT DEFAULT '6 months',
                weekly_commitment TEXT DEFAULT '10-15 hrs/week',
                total_topics INTEGER DEFAULT 0,
                salary_benchmark TEXT DEFAULT '',
                career_roles TEXT,
                stages TEXT,
                status TEXT DEFAULT 'published',
                order_index INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        ");
    }

    // Auto seed if table is empty
    try {
        $cnt = (int)$pdo->query("SELECT COUNT(*) FROM roadmaps")->fetchColumn();
        if ($cnt === 0) {
            seed_canonical_roadmaps($pdo);
        }
    } catch (\Throwable $e) {}
}

if ($action === 'roadmaps') {
    ensure_roadmaps_table($pdo);
    $rows = $pdo->query("SELECT * FROM roadmaps ORDER BY order_index ASC, created_at ASC")->fetchAll();
    $roadmaps = array_map(function($r) {
        $stages = !empty($r['stages']) ? json_decode($r['stages'], true) : [];
        $totalTopics = (int)($r['total_topics'] ?? 0);
        if ($totalTopics === 0 && is_array($stages)) {
            foreach ($stages as $stg) {
                if (!empty($stg['topics']) && is_array($stg['topics'])) {
                    $totalTopics += count($stg['topics']);
                }
            }
        }
        return [
            'id' => $r['id'],
            'slug' => $r['slug'] ?? $r['id'],
            'title' => $r['title'],
            'subtitle' => $r['subtitle'] ?? $r['tagline'] ?? '',
            'description' => $r['description'] ?? '',
            'badge' => $r['badge'] ?? 'Official Career Track',
            'category' => $r['category'] ?? 'web',
            'categoryLabel' => $r['category_label'] ?? 'Web Development',
            'tagline' => $r['tagline'] ?? $r['subtitle'] ?? '',
            'difficulty' => $r['difficulty'] ?? 'Intermediate',
            'duration' => $r['duration'] ?? '6 months',
            'weeklyCommitment' => $r['weekly_commitment'] ?? '10-15 hrs/week',
            'totalTopics' => $totalTopics,
            'salaryBenchmark' => $r['salary_benchmark'] ?? '₹8–25 LPA',
            'careerRoles' => array_values(array_filter(array_map('trim', explode(',', $r['career_roles'] ?? '')))),
            'stages' => $stages,
            'status' => $r['status'] ?? 'published',
            'orderIndex' => (int)($r['order_index'] ?? 0),
            'createdAt' => $r['created_at'] ?? '',
            'updatedAt' => $r['updated_at'] ?? '',
        ];
    }, $rows);
    ok($roadmaps, 'Roadmaps loaded');
}

if ($method === 'POST' && $action === 'seed_roadmaps') {
    ensure_roadmaps_table($pdo);
    $seeded = seed_canonical_roadmaps($pdo);
    ok(['count' => $seeded], "Successfully synced {$seeded} canonical 2026 roadmaps.");
}

if ($method === 'POST' && $action === 'create_roadmap') {
    ensure_roadmaps_table($pdo);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['title'])) fail('Roadmap title is required.', 400);

    $rawSlug = !empty($b['slug']) ? trim($b['slug']) : trim($b['title']);
    $slug = strtolower(preg_replace('/[^a-zA-Z0-9_-]+/', '-', $rawSlug));
    $slug = trim($slug, '-');
    if (empty($slug)) $slug = 'roadmap-' . uniqid();

    $id = !empty($b['id']) ? trim($b['id']) : $slug;

    $stages = $b['stages'] ?? [];
    if (is_string($stages)) {
        $stages = json_decode($stages, true) ?? [];
    }

    $totalTopics = 0;
    if (is_array($stages)) {
        foreach ($stages as $stg) {
            if (!empty($stg['topics']) && is_array($stg['topics'])) {
                $totalTopics += count($stg['topics']);
            }
        }
    }
    if (!empty($b['totalTopics']) && $totalTopics === 0) {
        $totalTopics = (int)$b['totalTopics'];
    }

    $careerRoles = is_array($b['careerRoles'] ?? null) ? implode(', ', $b['careerRoles']) : ($b['careerRoles'] ?? '');
    $stagesJson = json_encode($stages, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $orderIndex = isset($b['orderIndex']) ? (int)$b['orderIndex'] : 0;
    $status = !empty($b['status']) ? $b['status'] : 'published';

    $stmt = $pdo->prepare("
        INSERT INTO roadmaps (id, slug, title, subtitle, description, badge, category, category_label, tagline, difficulty, duration, weekly_commitment, total_topics, salary_benchmark, career_roles, stages, status, order_index)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ");
    $stmt->execute([
        $id,
        $slug,
        $b['title'],
        $b['subtitle'] ?? $b['tagline'] ?? '',
        $b['description'] ?? '',
        $b['badge'] ?? 'Official Career Track',
        $b['category'] ?? 'web',
        $b['categoryLabel'] ?? 'Web Development',
        $b['tagline'] ?? $b['subtitle'] ?? '',
        $b['difficulty'] ?? 'Intermediate',
        $b['duration'] ?? '6 months',
        $b['weeklyCommitment'] ?? '10-15 hrs/week',
        $totalTopics,
        $b['salaryBenchmark'] ?? '₹8–25 LPA',
        $careerRoles,
        $stagesJson,
        $status,
        $orderIndex
    ]);
    ok(['id' => $id, 'slug' => $slug], 'Roadmap created successfully');
}

if ($method === 'POST' && $action === 'update_roadmap') {
    ensure_roadmaps_table($pdo);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Roadmap ID is required.', 400);

    $rawSlug = !empty($b['slug']) ? trim($b['slug']) : trim($b['title'] ?? '');
    $slug = strtolower(preg_replace('/[^a-zA-Z0-9_-]+/', '-', $rawSlug));
    $slug = trim($slug, '-');
    if (empty($slug)) $slug = $b['id'];

    $stages = $b['stages'] ?? [];
    if (is_string($stages)) {
        $stages = json_decode($stages, true) ?? [];
    }

    $totalTopics = 0;
    if (is_array($stages)) {
        foreach ($stages as $stg) {
            if (!empty($stg['topics']) && is_array($stg['topics'])) {
                $totalTopics += count($stg['topics']);
            }
        }
    }
    if (!empty($b['totalTopics']) && $totalTopics === 0) {
        $totalTopics = (int)$b['totalTopics'];
    }

    $careerRoles = is_array($b['careerRoles'] ?? null) ? implode(', ', $b['careerRoles']) : ($b['careerRoles'] ?? '');
    $stagesJson = json_encode($stages, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $orderIndex = isset($b['orderIndex']) ? (int)$b['orderIndex'] : 0;
    $status = !empty($b['status']) ? $b['status'] : 'published';

    $stmt = $pdo->prepare("
        UPDATE roadmaps SET
            slug = ?,
            title = ?,
            subtitle = ?,
            description = ?,
            badge = ?,
            category = ?,
            category_label = ?,
            tagline = ?,
            difficulty = ?,
            duration = ?,
            weekly_commitment = ?,
            total_topics = ?,
            salary_benchmark = ?,
            career_roles = ?,
            stages = ?,
            status = ?,
            order_index = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $slug,
        $b['title'] ?? '',
        $b['subtitle'] ?? $b['tagline'] ?? '',
        $b['description'] ?? '',
        $b['badge'] ?? 'Official Career Track',
        $b['category'] ?? 'web',
        $b['categoryLabel'] ?? 'Web Development',
        $b['tagline'] ?? $b['subtitle'] ?? '',
        $b['difficulty'] ?? 'Intermediate',
        $b['duration'] ?? '6 months',
        $b['weeklyCommitment'] ?? '10-15 hrs/week',
        $totalTopics,
        $b['salaryBenchmark'] ?? '₹8–25 LPA',
        $careerRoles,
        $stagesJson,
        $status,
        $orderIndex,
        $b['id']
    ]);
    ok(['id' => $b['id'], 'slug' => $slug], 'Roadmap updated successfully');
}

if ($method === 'POST' && $action === 'delete_roadmap') {
    ensure_roadmaps_table($pdo);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Roadmap ID is required.', 400);
    $pdo->prepare("DELETE FROM roadmaps WHERE id = ? OR slug = ?")->execute([$b['id'], $b['id']]);
    ok([], 'Roadmap deleted successfully');
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE LINKS — Google Hub Links CRUD
// ─────────────────────────────────────────────────────────────────────────────
function ensure_workspace_links_table(PDO $pdo): void {
    $driver = get_db_driver($pdo);
    if ($driver === 'mysql') {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `workspace_links` (
                `id` VARCHAR(64) PRIMARY KEY,
                `title` VARCHAR(255) NOT NULL,
                `description` TEXT DEFAULT NULL,
                `category` VARCHAR(100) DEFAULT 'Google Workspace',
                `url` TEXT NOT NULL,
                `icon` VARCHAR(20) DEFAULT '🔗',
                `featured` TINYINT(1) DEFAULT 0,
                `display_order` INT DEFAULT 0,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } else {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS workspace_links (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT DEFAULT 'Google Workspace',
                url TEXT NOT NULL,
                icon TEXT DEFAULT '🔗',
                featured INTEGER DEFAULT 0,
                display_order INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        ");
    }
}

if ($action === 'workspace_links') {
    ensure_workspace_links_table($pdo);
    $rows = $pdo->query("SELECT * FROM workspace_links ORDER BY display_order ASC, created_at DESC")->fetchAll();
    $links = array_map(function($r) {
        return [
            'id' => $r['id'],
            'title' => $r['title'],
            'description' => $r['description'] ?? '',
            'category' => $r['category'] ?? 'Google Workspace',
            'url' => $r['url'],
            'icon' => $r['icon'] ?? '🔗',
            'featured' => (bool)($r['featured'] ?? false),
            'order' => (int)($r['display_order'] ?? 0),
        ];
    }, $rows);
    ok($links, 'Workspace links loaded');
}

if ($method === 'POST' && $action === 'create_workspace_link') {
    ensure_workspace_links_table($pdo);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['title']) || empty($b['url'])) fail('Title and URL are required.', 400);
    $id = 'wl-' . uniqid();
    $pdo->prepare("INSERT INTO workspace_links (id, title, description, category, url, icon, featured, display_order) VALUES (?,?,?,?,?,?,?,?)")
        ->execute([$id, $b['title'], $b['description'] ?? '', $b['category'] ?? 'Google Workspace', $b['url'], $b['icon'] ?? '🔗', (int)($b['featured'] ?? 0), (int)($b['order'] ?? 0)]);
    ok(['id' => $id], 'Workspace link created');
}

if ($method === 'POST' && $action === 'update_workspace_link') {
    ensure_workspace_links_table($pdo);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Link ID required.', 400);
    $pdo->prepare("UPDATE workspace_links SET title=?, description=?, category=?, url=?, icon=?, featured=?, display_order=? WHERE id=?")
        ->execute([$b['title'], $b['description'] ?? '', $b['category'] ?? 'Google Workspace', $b['url'], $b['icon'] ?? '🔗', (int)($b['featured'] ?? 0), (int)($b['order'] ?? 0), $b['id']]);
    ok(['id' => $b['id']], 'Workspace link updated');
}

if ($method === 'POST' && $action === 'delete_workspace_link') {
    ensure_workspace_links_table($pdo);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Link ID required.', 400);
    $pdo->prepare("DELETE FROM workspace_links WHERE id=?")->execute([$b['id']]);
    ok([], 'Workspace link deleted');
}

// ─────────────────────────────────────────────────────────────────────────────
// QUIZZES & QUESTIONS — Quiz Engine Admin CRUD
// ─────────────────────────────────────────────────────────────────────────────
if ($action === 'quizzes') {
    $stmt = $pdo->query("
        SELECT q.*, c.title AS course_title,
               (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS questions_count,
               (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.quiz_id = q.id) AS attempts_count,
               (SELECT ROUND(AVG(score), 1) FROM quiz_attempts qa WHERE qa.quiz_id = q.id) AS avg_score
        FROM quizzes q
        LEFT JOIN courses c ON q.course_id = c.id
        ORDER BY q.title ASC
    ");
    $quizzes = array_map(function($q) {
        return [
            'id'              => $q['id'],
            'courseId'        => $q['course_id'],
            'courseTitle'     => $q['course_title'] ?? 'General',
            'lessonId'        => $q['lesson_id'] ?? '',
            'title'           => $q['title'],
            'durationMinutes' => (int)($q['duration_minutes'] ?? 20),
            'passingScore'    => (int)($q['passing_score'] ?? 80),
            'questionsCount'  => (int)($q['questions_count'] ?? 0),
            'attemptsCount'   => (int)($q['attempts_count'] ?? 0),
            'avgScore'        => $q['avg_score'] !== null ? (float)$q['avg_score'] : null,
        ];
    }, $stmt->fetchAll());
    ok($quizzes, 'Quizzes loaded');
}

if ($method === 'POST' && $action === 'create_quiz') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['title'])) fail('Quiz title is required.', 400);
    if (empty($b['courseId'])) fail('Course ID is required.', 400);

    $id = 'quiz-' . uniqid();
    $lessonId = !empty($b['lessonId']) ? $b['lessonId'] : ('lesson-' . uniqid());
    $duration = (int)($b['durationMinutes'] ?? 20);
    $passingScore = (int)($b['passingScore'] ?? 80);

    $stmt = $pdo->prepare("INSERT INTO quizzes (id, course_id, lesson_id, title, duration_minutes, passing_score) VALUES (?,?,?,?,?,?)");
    $stmt->execute([$id, $b['courseId'], $lessonId, $b['title'], $duration, $passingScore]);

    ok(['id' => $id], 'Quiz created successfully');
}

if ($method === 'POST' && $action === 'update_quiz') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Quiz ID is required.', 400);

    $stmt = $pdo->prepare("UPDATE quizzes SET course_id=?, title=?, duration_minutes=?, passing_score=? WHERE id=?");
    $stmt->execute([
        $b['courseId'],
        $b['title'],
        (int)($b['durationMinutes'] ?? 20),
        (int)($b['passingScore'] ?? 80),
        $b['id']
    ]);

    ok(['id' => $b['id']], 'Quiz updated successfully');
}

if ($method === 'POST' && $action === 'delete_quiz') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Quiz ID is required.', 400);

    $pdo->prepare("DELETE FROM quizzes WHERE id=?")->execute([$b['id']]);
    ok([], 'Quiz deleted successfully');
}

if ($action === 'quiz_questions') {
    $quizId = trim($_GET['quiz_id'] ?? '');
    if (!$quizId) fail('Quiz ID is required.', 400);

    $stmt = $pdo->prepare("SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC");
    $stmt->execute([$quizId]);
    $questions = array_map(function($qq) {
        $options = json_decode($qq['options_json'] ?? '[]', true) ?: [];
        return [
            'id'                 => $qq['id'],
            'quizId'             => $qq['quiz_id'],
            'question'           => $qq['question'],
            'options'            => $options,
            'correctOptionIndex' => (int)$qq['correct_option_index'],
            'explanation'        => $qq['explanation'] ?? '',
            'orderIndex'         => (int)($qq['order_index'] ?? 0),
        ];
    }, $stmt->fetchAll());

    ok($questions, 'Questions loaded');
}

if ($method === 'POST' && $action === 'create_quiz_question') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['quizId'])) fail('Quiz ID is required.', 400);
    if (empty($b['question'])) fail('Question text is required.', 400);

    $id = 'qq-' . uniqid();
    $optionsJson = json_encode($b['options'] ?? [], JSON_UNESCAPED_UNICODE);
    $correctIndex = (int)($b['correctOptionIndex'] ?? 0);
    $explanation = $b['explanation'] ?? '';
    $orderIndex = (int)($b['orderIndex'] ?? 0);

    $stmt = $pdo->prepare("INSERT INTO quiz_questions (id, quiz_id, question, options_json, correct_option_index, explanation, order_index) VALUES (?,?,?,?,?,?,?)");
    $stmt->execute([$id, $b['quizId'], $b['question'], $optionsJson, $correctIndex, $explanation, $orderIndex]);

    ok(['id' => $id], 'Question created successfully');
}

if ($method === 'POST' && $action === 'update_quiz_question') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Question ID is required.', 400);

    $optionsJson = json_encode($b['options'] ?? [], JSON_UNESCAPED_UNICODE);
    $stmt = $pdo->prepare("UPDATE quiz_questions SET question=?, options_json=?, correct_option_index=?, explanation=?, order_index=? WHERE id=?");
    $stmt->execute([
        $b['question'] ?? '',
        $optionsJson,
        (int)($b['correctOptionIndex'] ?? 0),
        $b['explanation'] ?? '',
        (int)($b['orderIndex'] ?? 0),
        $b['id']
    ]);

    ok(['id' => $b['id']], 'Question updated successfully');
}

if ($method === 'POST' && $action === 'delete_quiz_question') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Question ID is required.', 400);

    $pdo->prepare("DELETE FROM quiz_questions WHERE id=?")->execute([$b['id']]);
    ok([], 'Question deleted successfully');
}

if ($action === 'quiz_attempts') {
    $quizId = trim($_GET['quiz_id'] ?? '');
    $sql = "
        SELECT qa.*, u.name AS user_name, u.email AS user_email, u.avatar AS user_avatar, q.title AS quiz_title
        FROM quiz_attempts qa
        LEFT JOIN users u ON qa.user_id = u.id
        LEFT JOIN quizzes q ON qa.quiz_id = q.id
    ";
    $params = [];
    if ($quizId) {
        $sql .= " WHERE qa.quiz_id = ?";
        $params[] = $quizId;
    }
    $sql .= " ORDER BY qa.attempted_at DESC LIMIT 100";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $attempts = array_map(function($a) {
        return [
            'id'          => $a['id'],
            'userName'    => $a['user_name'] ?? 'Student',
            'userEmail'   => $a['user_email'] ?? '',
            'userAvatar'  => $a['user_avatar'] ?? '',
            'quizTitle'   => $a['quiz_title'] ?? '',
            'score'       => (int)$a['score'],
            'passed'      => (bool)$a['passed'],
            'attemptedAt' => $a['attempted_at']
        ];
    }, $stmt->fetchAll());

    ok($attempts, 'Quiz attempts loaded');
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGNMENTS & SUBMISSIONS — Project Evaluator CRUD
// ─────────────────────────────────────────────────────────────────────────────
if ($action === 'assignments') {
    $stmt = $pdo->query("
        SELECT a.*, c.title AS course_title,
               (SELECT COUNT(*) FROM assignment_submissions s WHERE s.assignment_id = a.id) AS submissions_count,
               (SELECT COUNT(*) FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.grade IS NOT NULL) AS graded_count
        FROM assignments a
        LEFT JOIN courses c ON a.course_id = c.id
        ORDER BY a.title ASC
    ");
    $assignments = array_map(function($a) {
        return [
            'id'               => $a['id'],
            'courseId'         => $a['course_id'],
            'courseTitle'      => $a['course_title'] ?? 'General',
            'title'            => $a['title'],
            'description'      => $a['description'] ?? '',
            'deadline'         => $a['deadline'] ?? '',
            'difficulty'       => $a['difficulty'] ?? 'Intermediate',
            'submissionsCount' => (int)($a['submissions_count'] ?? 0),
            'gradedCount'      => (int)($a['graded_count'] ?? 0),
        ];
    }, $stmt->fetchAll());
    ok($assignments, 'Assignments loaded');
}

if ($method === 'POST' && $action === 'create_assignment') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['title'])) fail('Assignment title is required.', 400);
    if (empty($b['courseId'])) fail('Course ID is required.', 400);

    $id = 'asg-' . uniqid();
    $stmt = $pdo->prepare("INSERT INTO assignments (id, course_id, title, description, deadline, difficulty) VALUES (?,?,?,?,?,?)");
    $stmt->execute([
        $id,
        $b['courseId'],
        $b['title'],
        $b['description'] ?? '',
        $b['deadline'] ?? '14 Days from Enrollment',
        $b['difficulty'] ?? 'Intermediate'
    ]);

    ok(['id' => $id], 'Assignment created successfully');
}

if ($method === 'POST' && $action === 'update_assignment') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Assignment ID is required.', 400);

    $stmt = $pdo->prepare("UPDATE assignments SET course_id=?, title=?, description=?, deadline=?, difficulty=? WHERE id=?");
    $stmt->execute([
        $b['courseId'],
        $b['title'],
        $b['description'] ?? '',
        $b['deadline'] ?? '14 Days from Enrollment',
        $b['difficulty'] ?? 'Intermediate',
        $b['id']
    ]);

    ok(['id' => $b['id']], 'Assignment updated successfully');
}

if ($method === 'POST' && $action === 'delete_assignment') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Assignment ID is required.', 400);

    $pdo->prepare("DELETE FROM assignments WHERE id=?")->execute([$b['id']]);
    ok([], 'Assignment deleted successfully');
}

if ($action === 'assignment_submissions') {
    $assignmentId = trim($_GET['assignment_id'] ?? '');
    $sql = "
        SELECT sub.*, u.name AS user_name, u.email AS user_email, u.avatar AS user_avatar, a.title AS assignment_title, c.title AS course_title
        FROM assignment_submissions sub
        LEFT JOIN users u ON sub.user_id = u.id
        LEFT JOIN assignments a ON sub.assignment_id = a.id
        LEFT JOIN courses c ON a.course_id = c.id
    ";
    $params = [];
    if ($assignmentId) {
        $sql .= " WHERE sub.assignment_id = ?";
        $params[] = $assignmentId;
    }
    $sql .= " ORDER BY sub.submitted_at DESC LIMIT 100";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $subs = array_map(function($s) {
        return [
            'id'              => (int)$s['id'],
            'assignmentId'    => $s['assignment_id'],
            'assignmentTitle' => $s['assignment_title'] ?? '',
            'courseTitle'     => $s['course_title'] ?? '',
            'userName'        => $s['user_name'] ?? 'Student',
            'userEmail'       => $s['user_email'] ?? '',
            'userAvatar'      => $s['user_avatar'] ?? '',
            'status'          => $s['status'] ?? 'Submitted',
            'githubUrl'       => $s['github_url'] ?? '',
            'submittedFile'   => $s['submitted_file'] ?? '',
            'grade'           => $s['grade'] ?? '',
            'feedback'        => $s['feedback'] ?? '',
            'submittedAt'     => $s['submitted_at'],
            'reviewedAt'      => $s['reviewed_at'],
        ];
    }, $stmt->fetchAll());

    ok($subs, 'Submissions loaded');
}

if ($method === 'POST' && $action === 'grade_submission') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Submission ID is required.', 400);

    $grade = $b['grade'] ?? 'A';
    $status = !empty($b['status']) ? $b['status'] : 'Completed';
    $feedback = $b['feedback'] ?? 'Great implementation!';

    $stmt = $pdo->prepare("UPDATE assignment_submissions SET grade=?, status=?, feedback=?, reviewed_at=NOW() WHERE id=?");
    $stmt->execute([$grade, $status, $feedback, (int)$b['id']]);

    ok(['id' => $b['id']], 'Submission graded successfully');
}

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATES & CREDENTIALS — Registry & Verification Issuance
// ─────────────────────────────────────────────────────────────────────────────
if ($action === 'certificates') {
    $stmt = $pdo->query("
        SELECT cert.*, u.name AS user_name, u.email AS user_email, u.avatar AS user_avatar, c.title AS course_title
        FROM certificates cert
        LEFT JOIN users u ON cert.user_id = u.id
        LEFT JOIN courses c ON cert.course_id = c.id
        ORDER BY cert.created_at DESC
    ");
    $certs = array_map(function($c) {
        return [
            'id'               => $c['id'],
            'courseId'         => $c['course_id'],
            'courseTitle'      => $c['course_title'] ?? 'Course Credential',
            'userId'           => $c['user_id'],
            'userName'         => $c['user_name'] ?? 'Student',
            'userEmail'        => $c['user_email'] ?? '',
            'userAvatar'       => $c['user_avatar'] ?? '',
            'credentialId'     => $c['credential_id'],
            'verificationCode' => $c['verification_code'],
            'grade'            => $c['grade'] ?? 'A+',
            'issueDate'        => $c['issue_date'],
            'thumbnailUrl'     => $c['thumbnail_url'] ?? '',
            'createdAt'        => $c['created_at'],
        ];
    }, $stmt->fetchAll());

    ok($certs, 'Certificates loaded');
}

if ($method === 'POST' && $action === 'issue_certificate') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['userId'])) fail('Student User ID is required.', 400);
    if (empty($b['courseId'])) fail('Course ID is required.', 400);

    $id = 'cert-' . uniqid();
    $year = date('Y');
    $credentialId = 'CRED-' . strtoupper(substr(uniqid(), -8));
    $verificationCode = !empty($b['verificationCode']) 
        ? trim($b['verificationCode']) 
        : ('CERT-YASWANT-' . $year . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6)));
    $grade = $b['grade'] ?? 'Distinction';
    $issueDate = !empty($b['issueDate']) ? $b['issueDate'] : date('Y-m-d');
    $thumbnail = !empty($b['thumbnailUrl']) 
        ? $b['thumbnailUrl'] 
        : 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=80';

    $stmt = $pdo->prepare("INSERT INTO certificates (id, course_id, user_id, credential_id, grade, issue_date, thumbnail_url, verification_code) VALUES (?,?,?,?,?,?,?,?)");
    $stmt->execute([$id, $b['courseId'], $b['userId'], $credentialId, $grade, $issueDate, $thumbnail, $verificationCode]);

    ok([
        'id'               => $id,
        'credentialId'     => $credentialId,
        'verificationCode' => $verificationCode
    ], 'Certificate issued successfully');
}

if ($method === 'POST' && $action === 'revoke_certificate') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Certificate ID is required.', 400);

    $pdo->prepare("DELETE FROM certificates WHERE id=?")->execute([$b['id']]);
    ok([], 'Certificate revoked successfully');
}

// ─────────────────────────────────────────────────────────────────────────────
// DISCUSSIONS & COMMUNITY FORUM MODERATION
// ─────────────────────────────────────────────────────────────────────────────
if ($action === 'discussions') {
    $stmt = $pdo->query("
        SELECT d.*, u.name AS author_name, u.email AS author_email, u.avatar AS author_avatar, c.title AS course_title,
               (SELECT COUNT(*) FROM discussion_replies dr WHERE dr.discussion_id = d.id) AS replies_count
        FROM discussions d
        LEFT JOIN users u ON d.user_id = u.id
        LEFT JOIN courses c ON d.course_id = c.id
        ORDER BY d.created_at DESC
    ");
    $discussions = array_map(function($d) {
        $tags = json_decode($d['tags_json'] ?? '[]', true) ?: [];
        return [
            'id'                => $d['id'],
            'courseId'          => $d['course_id'],
            'courseTitle'       => $d['course_title'] ?? 'Global Community',
            'userId'            => $d['user_id'],
            'authorName'        => $d['author_name'] ?? 'Community Member',
            'authorEmail'       => $d['author_email'] ?? '',
            'authorAvatar'      => $d['author_avatar'] ?? '',
            'title'             => $d['title'],
            'content'           => $d['content'] ?? '',
            'category'          => $d['category'] ?? 'General',
            'tags'              => $tags,
            'upvotes'           => (int)($d['upvotes'] ?? 0),
            'hasAcceptedAnswer' => (bool)($d['has_accepted_answer'] ?? 0),
            'repliesCount'      => (int)($d['replies_count'] ?? 0),
            'createdAt'         => $d['created_at'],
        ];
    }, $stmt->fetchAll());

    ok($discussions, 'Discussions loaded');
}

if ($method === 'POST' && $action === 'toggle_discussion_solution') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Discussion ID required.', 400);

    $pdo->prepare("UPDATE discussions SET has_accepted_answer = IF(has_accepted_answer=1, 0, 1) WHERE id=?")->execute([$b['id']]);
    ok([], 'Discussion status toggled');
}

if ($method === 'POST' && $action === 'delete_discussion') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Discussion ID required.', 400);

    $pdo->prepare("DELETE FROM discussions WHERE id=?")->execute([$b['id']]);
    ok([], 'Discussion deleted');
}

if ($action === 'discussion_replies') {
    $discId = trim($_GET['discussion_id'] ?? '');
    if (!$discId) fail('Discussion ID is required.', 400);

    $stmt = $pdo->prepare("
        SELECT dr.*, u.name AS author_name, u.email AS author_email, u.avatar AS author_avatar
        FROM discussion_replies dr
        LEFT JOIN users u ON dr.user_id = u.id
        WHERE dr.discussion_id = ?
        ORDER BY dr.created_at ASC
    ");
    $stmt->execute([$discId]);
    $replies = array_map(function($r) {
        return [
            'id'           => $r['id'],
            'discussionId' => $r['discussion_id'],
            'userId'       => $r['user_id'],
            'authorName'   => $r['author_name'] ?? 'Member',
            'authorEmail'  => $r['author_email'] ?? '',
            'authorAvatar' => $r['author_avatar'] ?? '',
            'content'      => $r['content'],
            'isAccepted'   => (bool)($r['is_accepted'] ?? 0),
            'upvotes'      => (int)($r['upvotes'] ?? 0),
            'createdAt'    => $r['created_at'],
        ];
    }, $stmt->fetchAll());

    ok($replies, 'Replies loaded');
}

if ($method === 'POST' && $action === 'delete_discussion_reply') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Reply ID required.', 400);

    $pdo->prepare("DELETE FROM discussion_replies WHERE id=?")->execute([$b['id']]);
    ok([], 'Reply deleted');
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSE CURRICULUM BUILDER — Modules & Lessons Management
// ─────────────────────────────────────────────────────────────────────────────
if ($action === 'course_curriculum') {
    $courseId = trim($_GET['course_id'] ?? '');
    if (!$courseId) fail('Course ID is required.', 400);

    // Fetch modules
    $mStmt = $pdo->prepare("SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC");
    $mStmt->execute([$courseId]);
    $modules = $mStmt->fetchAll();

    $curriculum = [];
    foreach ($modules as $m) {
        $cStmt = $pdo->prepare("SELECT * FROM chapters WHERE module_id = ? ORDER BY order_index ASC");
        $cStmt->execute([$m['id']]);
        $chapters = $cStmt->fetchAll();

        $chaptersWithLessons = [];
        foreach ($chapters as $ch) {
            $lStmt = $pdo->prepare("SELECT * FROM lessons WHERE chapter_id = ? ORDER BY order_index ASC");
            $lStmt->execute([$ch['id']]);
            $lessons = $lStmt->fetchAll();

            $chaptersWithLessons[] = [
                'id'         => $ch['id'],
                'moduleId'   => $ch['module_id'],
                'title'      => $ch['title'],
                'duration'   => $ch['duration'],
                'orderIndex' => (int)$ch['order_index'],
                'lessons'    => array_map(function($l) {
                    return [
                        'id'               => $l['id'],
                        'chapterId'        => $l['chapter_id'],
                        'title'            => $l['title'],
                        'duration'         => $l['duration'],
                        'type'             => $l['type'] ?? 'video',
                        'videoUrl'         => $l['video_url'] ?? '',
                        'previewAvailable' => (bool)($l['preview_available'] ?? 0),
                        'description'      => $l['description'] ?? '',
                        'codeSnippet'      => $l['code_snippet'] ?? '',
                        'codeLanguage'     => $l['code_language'] ?? 'typescript',
                        'orderIndex'       => (int)$l['order_index'],
                    ];
                }, $lessons)
            ];
        }

        $curriculum[] = [
            'id'         => $m['id'],
            'courseId'   => $m['course_id'],
            'title'      => $m['title'],
            'duration'   => $m['duration'],
            'orderIndex' => (int)$m['order_index'],
            'chapters'   => $chaptersWithLessons,
        ];
    }

    ok($curriculum, 'Curriculum loaded');
}

if ($method === 'POST' && $action === 'create_module') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['courseId']) || empty($b['title'])) fail('Course ID and Module title required.', 400);

    $id = 'mod-' . uniqid();
    $duration = $b['duration'] ?? '2h 30m';
    $orderIndex = (int)($b['orderIndex'] ?? 0);

    $stmt = $pdo->prepare("INSERT INTO modules (id, course_id, title, duration, order_index) VALUES (?,?,?,?,?)");
    $stmt->execute([$id, $b['courseId'], $b['title'], $duration, $orderIndex]);

    // Also auto-create a default chapter inside the module
    $chId = 'ch-' . uniqid();
    $pdo->prepare("INSERT INTO chapters (id, module_id, title, duration, order_index) VALUES (?,?,?,?,0)")
        ->execute([$chId, $id, 'Core Concepts', $duration]);

    ok(['id' => $id, 'chapterId' => $chId], 'Module created successfully');
}

if ($method === 'POST' && $action === 'delete_module') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Module ID is required.', 400);

    $pdo->prepare("DELETE FROM modules WHERE id=?")->execute([$b['id']]);
    ok([], 'Module deleted successfully');
}

if ($method === 'POST' && $action === 'create_lesson') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['chapterId']) || empty($b['title'])) fail('Chapter ID and Lesson title required.', 400);

    $id = 'les-' . uniqid();
    $duration = $b['duration'] ?? '15:00';
    $type = in_array($b['type'] ?? '', ['video','quiz','assignment','reading']) ? $b['type'] : 'video';
    $videoUrl = $b['videoUrl'] ?? '';
    $previewAvailable = !empty($b['previewAvailable']) ? 1 : 0;
    $description = $b['description'] ?? '';
    $codeSnippet = $b['codeSnippet'] ?? '';
    $codeLanguage = $b['codeLanguage'] ?? 'typescript';
    $orderIndex = (int)($b['orderIndex'] ?? 0);

    $stmt = $pdo->prepare("INSERT INTO lessons (id, chapter_id, title, duration, type, video_url, preview_available, description, code_snippet, code_language, order_index) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
    $stmt->execute([$id, $b['chapterId'], $b['title'], $duration, $type, $videoUrl, $previewAvailable, $description, $codeSnippet, $codeLanguage, $orderIndex]);

    ok(['id' => $id], 'Lesson created successfully');
}

if ($method === 'POST' && $action === 'update_lesson') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Lesson ID is required.', 400);

    $type = in_array($b['type'] ?? '', ['video','quiz','assignment','reading']) ? $b['type'] : 'video';
    $stmt = $pdo->prepare("UPDATE lessons SET title=?, duration=?, type=?, video_url=?, preview_available=?, description=?, code_snippet=?, code_language=?, order_index=? WHERE id=?");
    $stmt->execute([
        $b['title'] ?? '',
        $b['duration'] ?? '15:00',
        $type,
        $b['videoUrl'] ?? '',
        !empty($b['previewAvailable']) ? 1 : 0,
        $b['description'] ?? '',
        $b['codeSnippet'] ?? '',
        $b['codeLanguage'] ?? 'typescript',
        (int)($b['orderIndex'] ?? 0),
        $b['id']
    ]);

    ok(['id' => $b['id']], 'Lesson updated successfully');
}

if ($method === 'POST' && $action === 'delete_lesson') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Lesson ID is required.', 400);

    $pdo->prepare("DELETE FROM lessons WHERE id=?")->execute([$b['id']]);
    ok([], 'Lesson deleted successfully');
}

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE MAINTENANCE TOOLS
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'optimize_tables') {
    $driver = get_db_driver($pdo);
    $results = [];
    if ($driver === 'mysql') {
        $tables = [
            'users', 'user_sessions', 'courses', 'modules', 'chapters', 'lessons',
            'quizzes', 'quiz_questions', 'quiz_attempts',
            'assignments', 'assignment_submissions',
            'certificates', 'discussions', 'discussion_replies',
            'study_notes', 'developer_tools', 'projects', 'roadmaps',
            'inquiries', 'subscribers', 'site_settings'
        ];
        foreach ($tables as $t) {
            try {
                $check = $pdo->query("CHECK TABLE `{$t}`")->fetch();
                $results[$t] = $check['Msg_text'] ?? 'OK';
            } catch (Throwable $e) {
                $results[$t] = 'Skipped or Table Missing';
            }
        }
    } else {
        $pdo->query("VACUUM");
        $results['sqlite'] = 'VACUUM complete';
    }

    ok(['results' => $results], 'Tables checked and optimized successfully');
}

fail('Invalid admin action requested.', 404);
