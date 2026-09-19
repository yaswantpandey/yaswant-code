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
        $hash = password_hash('Password123!', PASSWORD_BCRYPT, ['cost' => 12]);
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
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
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
        $uStmt = $pdo->query("SELECT id, name, email, role, avatar, title, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 5");
        $stats['recent_users'] = $uStmt->fetchAll();
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
    $sql = "
        SELECT u.id, u.name, u.email, u.role, u.avatar, u.title, u.bio,
               u.rating, u.reviews_count, u.students_count, u.is_active, u.created_at,
               (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id) AS enrolled_count
        FROM users u
        WHERE {$whereSql}
        ORDER BY u.created_at DESC
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
    $stmt = $pdo->query('
        SELECT id, email, name, is_active, subscribed_at
        FROM subscribers
        ORDER BY subscribed_at DESC
    ');
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

    $stmt = $pdo->prepare('
        INSERT INTO site_settings (setting_key, setting_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ');

    foreach ($input as $key => $val) {
        $stmt->execute([trim((string)$key), is_bool($val) ? ($val ? '1' : '0') : (string)$val]);
    }

    ok(true, 'Platform settings saved successfully');
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
function ensure_roadmaps_table(PDO $pdo): void {
    $driver = get_db_driver($pdo);
    if ($driver === 'mysql') {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `roadmaps` (
                `id` VARCHAR(64) PRIMARY KEY,
                `title` VARCHAR(255) NOT NULL,
                `category` VARCHAR(50) DEFAULT 'web',
                `category_label` VARCHAR(100) DEFAULT 'Web Development',
                `tagline` VARCHAR(500) DEFAULT '',
                `description` TEXT DEFAULT NULL,
                `difficulty` VARCHAR(50) DEFAULT 'Intermediate',
                `duration` VARCHAR(100) DEFAULT '6 months',
                `weekly_commitment` VARCHAR(100) DEFAULT '10-15 hrs/week',
                `total_topics` INT DEFAULT 50,
                `salary_benchmark` VARCHAR(100) DEFAULT '',
                `career_roles` TEXT DEFAULT NULL,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } else {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS roadmaps (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                category TEXT DEFAULT 'web',
                category_label TEXT DEFAULT 'Web Development',
                tagline TEXT DEFAULT '',
                description TEXT,
                difficulty TEXT DEFAULT 'Intermediate',
                duration TEXT DEFAULT '6 months',
                weekly_commitment TEXT DEFAULT '10-15 hrs/week',
                total_topics INTEGER DEFAULT 50,
                salary_benchmark TEXT DEFAULT '',
                career_roles TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        ");
    }
}

if ($action === 'roadmaps') {
    ensure_roadmaps_table($pdo);
    $rows = $pdo->query("SELECT * FROM roadmaps ORDER BY created_at DESC")->fetchAll();
    $roadmaps = array_map(function($r) {
        return [
            'id' => $r['id'],
            'title' => $r['title'],
            'category' => $r['category'] ?? 'web',
            'categoryLabel' => $r['category_label'] ?? 'Web Development',
            'tagline' => $r['tagline'] ?? '',
            'description' => $r['description'] ?? '',
            'difficulty' => $r['difficulty'] ?? 'Intermediate',
            'duration' => $r['duration'] ?? '6 months',
            'weeklyCommitment' => $r['weekly_commitment'] ?? '10-15 hrs/week',
            'totalTopics' => (int)($r['total_topics'] ?? 50),
            'salaryBenchmark' => $r['salary_benchmark'] ?? '',
            'careerRoles' => array_filter(array_map('trim', explode(',', $r['career_roles'] ?? ''))),
        ];
    }, $rows);
    ok($roadmaps, 'Roadmaps loaded');
}

if ($method === 'POST' && $action === 'create_roadmap') {
    ensure_roadmaps_table($pdo);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['title'])) fail('Roadmap title is required.', 400);
    $id = 'rm-' . uniqid();
    $careerRoles = is_array($b['careerRoles'] ?? null) ? implode(', ', $b['careerRoles']) : ($b['careerRoles'] ?? '');
    $pdo->prepare("INSERT INTO roadmaps (id, title, category, category_label, tagline, description, difficulty, duration, weekly_commitment, total_topics, salary_benchmark, career_roles) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
        ->execute([$id, $b['title'], $b['category'] ?? 'web', $b['categoryLabel'] ?? 'Web Development', $b['tagline'] ?? '', $b['description'] ?? '', $b['difficulty'] ?? 'Intermediate', $b['duration'] ?? '6 months', $b['weeklyCommitment'] ?? '10-15 hrs/week', (int)($b['totalTopics'] ?? 50), $b['salaryBenchmark'] ?? '', $careerRoles]);
    ok(['id' => $id], 'Roadmap created');
}

if ($method === 'POST' && $action === 'update_roadmap') {
    ensure_roadmaps_table($pdo);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Roadmap ID required.', 400);
    $careerRoles = is_array($b['careerRoles'] ?? null) ? implode(', ', $b['careerRoles']) : ($b['careerRoles'] ?? '');
    $pdo->prepare("UPDATE roadmaps SET title=?, category=?, category_label=?, tagline=?, description=?, difficulty=?, duration=?, weekly_commitment=?, total_topics=?, salary_benchmark=?, career_roles=? WHERE id=?")
        ->execute([$b['title'], $b['category'] ?? 'web', $b['categoryLabel'] ?? 'Web Development', $b['tagline'] ?? '', $b['description'] ?? '', $b['difficulty'] ?? 'Intermediate', $b['duration'] ?? '6 months', $b['weeklyCommitment'] ?? '10-15 hrs/week', (int)($b['totalTopics'] ?? 50), $b['salaryBenchmark'] ?? '', $careerRoles, $b['id']]);
    ok(['id' => $b['id']], 'Roadmap updated');
}

if ($method === 'POST' && $action === 'delete_roadmap') {
    ensure_roadmaps_table($pdo);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['id'])) fail('Roadmap ID required.', 400);
    $pdo->prepare("DELETE FROM roadmaps WHERE id=?")->execute([$b['id']]);
    ok([], 'Roadmap deleted');
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

fail('Invalid admin action requested.', 404);
