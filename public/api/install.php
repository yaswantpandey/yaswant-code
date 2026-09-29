<?php
/**
 * Yaswant Code LMS — One-Click Database Installer
 * Hostinger Shared Hosting Compatible
 *
 * USAGE: GET /api/install.php?secret=YOUR_INSTALL_SECRET
 *
 * SECURITY:
 *   - Protected by INSTALL_SECRET (set in config.php or Hostinger env vars)
 *   - Blocked after first successful run (creates a lock marker)
 *   - Only creates/alters tables — never drops existing data
 *
 * WHAT IT DOES:
 *   1. Creates all LMS tables (if not exists)
 *   2. Adds new tables (user_sessions, rate_limits, subscribers, inquiries)
 *   3. Seeds sample instructors, courses, and a demo student
 *   4. Returns a full install report
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

// ─── Auth Guard ──────────────────────────────────────────────────────────────
$secret = trim($_GET['secret'] ?? $_POST['secret'] ?? '');
if (!$secret || $secret !== INSTALL_SECRET || INSTALL_SECRET === 'change_this_install_secret') {
    json_response([
        'success' => false,
        'error'   => 'Access denied. Provide ?secret=YOUR_INSTALL_SECRET (set in config.php or Hostinger env vars).',
        'hint'    => 'Edit public/api/config.php → INSTALL_SECRET or set INSTALL_SECRET env var in Hostinger hPanel.',
    ], 403);
}

$pdo = get_db();
if (!$pdo) {
    json_response([
        'success' => false,
        'error'   => 'Cannot connect to the database. Edit DB_HOST, DB_NAME, DB_USER, DB_PASS in public/api/config.php first.',
        'hint'    => 'Hostinger MySQL credentials are found in hPanel → Databases → MySQL Databases.',
    ], 503);
}

// ─── Check if already installed ─────────────────────────────────────────────
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
$alreadyInstalled = in_array('install_lock', $tables, true);
if ($alreadyInstalled) {
    $lock = $pdo->query("SELECT * FROM install_lock LIMIT 1")->fetch();
    json_response([
        'success'     => false,
        'error'       => 'Database already installed. Installer is locked.',
        'installed_at'=> $lock['installed_at'] ?? 'unknown',
        'hint'        => 'To reinstall, manually drop the install_lock table in your DB manager, then re-run.',
    ], 409);
}

// ─── Run Schema ──────────────────────────────────────────────────────────────
$report   = [];
$errors   = [];
$warnings = [];

function exec_sql(PDO $pdo, string $sql, string $label): bool {
    global $report, $errors;
    try {
        $pdo->exec($sql);
        $report[] = "✅ {$label}";
        return true;
    } catch (PDOException $e) {
        $errors[] = "❌ {$label}: " . $e->getMessage();
        return false;
    }
}

function ensure_column(PDO $pdo, string $table, string $column, string $colDef): void {
    global $report;
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM `{$table}` LIKE '{$column}'");
        if ($stmt && $stmt->rowCount() === 0) {
            $pdo->exec("ALTER TABLE `{$table}` ADD COLUMN `{$column}` {$colDef}");
            $report[] = "✅ Migrated column {$column} to {$table}";
        }
    } catch (Throwable $e) {
        // Table may not exist yet, will be created below
    }
}

// Ensure columns on existing tables
ensure_column($pdo, 'courses', 'is_deleted', 'TINYINT(1) DEFAULT 0');
ensure_column($pdo, 'courses', 'is_featured', 'TINYINT(1) DEFAULT 0');
ensure_column($pdo, 'courses', 'is_bestseller', 'TINYINT(1) DEFAULT 0');
ensure_column($pdo, 'courses', 'projects_count', 'INT UNSIGNED DEFAULT 1');
ensure_column($pdo, 'courses', 'has_certificate', 'TINYINT(1) DEFAULT 1');
ensure_column($pdo, 'courses', 'drive_url', 'VARCHAR(500) NULL');
ensure_column($pdo, 'lessons', 'drive_url', 'VARCHAR(500) NULL');
ensure_column($pdo, 'users', 'is_active', 'TINYINT(1) DEFAULT 1');

// ── 1. Users ─────────────────────────────────────────────────────────────────
exec_sql($pdo, "
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
", "Table: users");

// ── 2. User Sessions (token auth) ────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `user_sessions` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `token`      VARCHAR(64) NOT NULL UNIQUE,
    `user_id`    VARCHAR(64) NOT NULL,
    `expires_at` TIMESTAMP   NOT NULL,
    `created_at` TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token   (token),
    INDEX idx_user_id (user_id),
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: user_sessions");

// ── 3. Rate Limits ────────────────────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `rate_limits` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `ip`         VARCHAR(45)  NOT NULL,
    `action`     VARCHAR(64)  NOT NULL,
    `count`      INT UNSIGNED DEFAULT 1,
    `expires_at` TIMESTAMP    NOT NULL,
    UNIQUE KEY unique_ip_action (ip, action),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: rate_limits");

// ── 4. Courses ────────────────────────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `courses` (
    `id`                  VARCHAR(64)  PRIMARY KEY,
    `instructor_id`       VARCHAR(64)  NOT NULL,
    `title`               VARCHAR(255) NOT NULL,
    `tagline`             VARCHAR(255) NULL,
    `description`         LONGTEXT     NOT NULL,
    `thumbnail`           VARCHAR(500) NOT NULL,
    `category`            VARCHAR(100) NOT NULL,
    `difficulty`          ENUM('Beginner','Intermediate','Advanced','All Levels') NOT NULL DEFAULT 'Beginner',
    `rating`              DECIMAL(3,2) DEFAULT 4.90,
    `reviews_count`       INT UNSIGNED DEFAULT 0,
    `students_count`      INT UNSIGNED DEFAULT 0,
    `duration_hours`      INT UNSIGNED NOT NULL DEFAULT 1,
    `lessons_count`       INT UNSIGNED NOT NULL DEFAULT 1,
    `price`               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `original_price`      DECIMAL(10,2) NULL,
    `discount_percentage` INT UNSIGNED  DEFAULT 0,
    `is_bestseller`       TINYINT(1)    DEFAULT 0,
    `is_featured`         TINYINT(1)    DEFAULT 0,
    `is_deleted`          TINYINT(1)    DEFAULT 0,
    `language`            VARCHAR(50)   DEFAULT 'English',
    `has_certificate`     TINYINT(1)    DEFAULT 1,
    `projects_count`      INT UNSIGNED  DEFAULT 1,
    `drive_url`           VARCHAR(500)  NULL,
    `created_at`          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at`          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category   (category),
    INDEX idx_difficulty (difficulty),
    INDEX idx_price      (price),
    INDEX idx_deleted    (is_deleted),
    CONSTRAINT fk_course_instructor FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: courses");

// ── 5. Course Meta Items ──────────────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `course_meta_items` (
    `id`          INT AUTO_INCREMENT PRIMARY KEY,
    `course_id`   VARCHAR(64) NOT NULL,
    `type`        ENUM('what_you_will_learn','requirement','skill') NOT NULL,
    `content`     TEXT NOT NULL,
    `order_index` INT  NOT NULL DEFAULT 0,
    CONSTRAINT fk_meta_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: course_meta_items");

// ── 6. Modules, Chapters, Lessons ────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `modules` (
    `id`          VARCHAR(64)  PRIMARY KEY,
    `course_id`   VARCHAR(64)  NOT NULL,
    `title`       VARCHAR(255) NOT NULL,
    `duration`    VARCHAR(50)  NOT NULL,
    `order_index` INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_module_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: modules");

exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `chapters` (
    `id`          VARCHAR(64)  PRIMARY KEY,
    `module_id`   VARCHAR(64)  NOT NULL,
    `title`       VARCHAR(255) NOT NULL,
    `duration`    VARCHAR(50)  NOT NULL,
    `order_index` INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_chapter_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: chapters");

exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `lessons` (
    `id`                VARCHAR(64)  PRIMARY KEY,
    `chapter_id`        VARCHAR(64)  NOT NULL,
    `title`             VARCHAR(255) NOT NULL,
    `duration`          VARCHAR(50)  NOT NULL,
    `type`              ENUM('video','quiz','assignment','reading') NOT NULL DEFAULT 'video',
    `video_url`         VARCHAR(500) NULL,
    `drive_url`         VARCHAR(500) NULL,
    `preview_available` TINYINT(1)   DEFAULT 0,
    `description`       LONGTEXT     NULL,
    `code_snippet`      LONGTEXT     NULL,
    `code_language`     VARCHAR(50)  NULL,
    `order_index`       INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_lesson_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: lessons");

// ── 7. Enrollments & Progress ─────────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `enrollments` (
    `id`                INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`           VARCHAR(64)  NOT NULL,
    `course_id`         VARCHAR(64)  NOT NULL,
    `progress_percent`  INT UNSIGNED DEFAULT 0,
    `current_lesson_id` VARCHAR(64)  NULL,
    `enrolled_at`       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    `completed_at`      TIMESTAMP    NULL,
    UNIQUE KEY unique_user_course (user_id, course_id),
    CONSTRAINT fk_enroll_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    CONSTRAINT fk_enroll_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: enrollments");

exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `lesson_completions` (
    `id`           INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`      VARCHAR(64) NOT NULL,
    `lesson_id`    VARCHAR(64) NOT NULL,
    `completed_at` TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
    CONSTRAINT fk_comp_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    CONSTRAINT fk_comp_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: lesson_completions");

// ── 8. Quizzes ────────────────────────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `quizzes` (
    `id`               VARCHAR(64)  PRIMARY KEY,
    `course_id`        VARCHAR(64)  NOT NULL,
    `lesson_id`        VARCHAR(64)  NOT NULL,
    `title`            VARCHAR(255) NOT NULL,
    `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 20,
    `passing_score`    INT UNSIGNED NOT NULL DEFAULT 80,
    CONSTRAINT fk_quiz_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: quizzes");

exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `quiz_questions` (
    `id`                   VARCHAR(64) PRIMARY KEY,
    `quiz_id`              VARCHAR(64) NOT NULL,
    `question`             TEXT        NOT NULL,
    `options_json`         JSON        NOT NULL,
    `correct_option_index` INT         NOT NULL,
    `explanation`          TEXT        NOT NULL,
    `order_index`          INT         NOT NULL DEFAULT 0,
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: quiz_questions");

exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `quiz_attempts` (
    `id`           INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`      VARCHAR(64) NOT NULL,
    `quiz_id`      VARCHAR(64) NOT NULL,
    `score`        INT         NOT NULL,
    `passed`       TINYINT(1)  NOT NULL,
    `attempted_at` TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempt_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: quiz_attempts");

// ── 9. Assignments ────────────────────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `assignments` (
    `id`          VARCHAR(64)  PRIMARY KEY,
    `course_id`   VARCHAR(64)  NOT NULL,
    `title`       VARCHAR(255) NOT NULL,
    `description` LONGTEXT     NOT NULL,
    `deadline`    VARCHAR(100) NOT NULL,
    `difficulty`  ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Intermediate',
    CONSTRAINT fk_assignment_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: assignments");

exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `assignment_submissions` (
    `id`             INT AUTO_INCREMENT PRIMARY KEY,
    `assignment_id`  VARCHAR(64) NOT NULL,
    `user_id`        VARCHAR(64) NOT NULL,
    `status`         ENUM('Not Started','In Progress','Submitted','Under Review','Completed','Needs Revision') DEFAULT 'Submitted',
    `github_url`     VARCHAR(500) NULL,
    `submitted_file` VARCHAR(500) NULL,
    `grade`          VARCHAR(10)  NULL,
    `feedback`       TEXT         NULL,
    `submitted_at`   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    `reviewed_at`    TIMESTAMP    NULL,
    CONSTRAINT fk_sub_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_user       FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: assignment_submissions");

// ── 10. Certificates ──────────────────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `certificates` (
    `id`                VARCHAR(64)  PRIMARY KEY,
    `course_id`         VARCHAR(64)  NOT NULL,
    `user_id`           VARCHAR(64)  NOT NULL,
    `credential_id`     VARCHAR(100) NOT NULL UNIQUE,
    `grade`             VARCHAR(10)  NOT NULL DEFAULT 'A+',
    `issue_date`        DATE         NOT NULL,
    `thumbnail_url`     VARCHAR(500) NULL,
    `verification_code` VARCHAR(128) NOT NULL UNIQUE,
    `created_at`        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cert_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_cert_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: certificates");

// ── 11. Discussions ────────────────────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `discussions` (
    `id`                  VARCHAR(64)  PRIMARY KEY,
    `user_id`             VARCHAR(64)  NOT NULL,
    `course_id`           VARCHAR(64)  NULL,
    `title`               VARCHAR(255) NOT NULL,
    `content`             LONGTEXT     NOT NULL,
    `category`            ENUM('General','Frontend','Backend','AI & ML','Architecture','Career') NOT NULL DEFAULT 'General',
    `tags_json`           JSON         NOT NULL,
    `upvotes`             INT UNSIGNED DEFAULT 0,
    `has_accepted_answer` TINYINT(1)   DEFAULT 0,
    `created_at`          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_created  (created_at),
    CONSTRAINT fk_disc_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    CONSTRAINT fk_disc_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: discussions");

exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `discussion_replies` (
    `id`            VARCHAR(64) PRIMARY KEY,
    `discussion_id` VARCHAR(64) NOT NULL,
    `user_id`       VARCHAR(64) NOT NULL,
    `content`       LONGTEXT    NOT NULL,
    `is_accepted`   TINYINT(1)  DEFAULT 0,
    `upvotes`       INT UNSIGNED DEFAULT 0,
    `created_at`    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reply_disc FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
    CONSTRAINT fk_reply_user FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: discussion_replies");

// ── 12. Notifications ──────────────────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `notifications` (
    `id`         VARCHAR(64)  PRIMARY KEY,
    `user_id`    VARCHAR(64)  NOT NULL,
    `title`      VARCHAR(255) NOT NULL,
    `message`    TEXT         NOT NULL,
    `type`       ENUM('course','assignment','quiz','certificate','announcement','community') NOT NULL,
    `link`       VARCHAR(500) NULL,
    `is_read`    TINYINT(1)   DEFAULT 0,
    `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_read (user_id, is_read),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: notifications");

// ── 13. Subscribers ────────────────────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `subscribers` (
    `id`               INT AUTO_INCREMENT PRIMARY KEY,
    `email`            VARCHAR(255) NOT NULL UNIQUE,
    `name`             VARCHAR(150) DEFAULT NULL,
    `is_active`        TINYINT(1)   DEFAULT 1,
    `subscribed_at`    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    `unsubscribed_at`  TIMESTAMP    NULL DEFAULT NULL,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: subscribers");

// ── 14. Inquiries ──────────────────────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `inquiries` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `name`       VARCHAR(150) NOT NULL,
    `email`      VARCHAR(255) NOT NULL,
    `subject`    VARCHAR(255) NOT NULL,
    `message`    TEXT         NOT NULL,
    `course`     VARCHAR(255) DEFAULT NULL,
    `phone`      VARCHAR(50)  DEFAULT NULL,
    `ip_address` VARCHAR(45)  DEFAULT NULL,
    `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email   (email),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
", "Table: inquiries");

// ─── Seed Sample Data ────────────────────────────────────────────────────────
// Seed users (only if empty)
$userCount = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
if ($userCount === 0) {
    // password for all seed users: "Password123!"
    $hash = '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

    $seedUsers = [
        ['inst-1','Dr. Elena Vance','elena.vance@yaswantcode.edu','instructor',
         'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
         'Staff AI Engineer',4.96,3420,48900],
        ['inst-2','Marcus Thorne','marcus.thorne@yaswantcode.edu','instructor',
         'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
         'Principal Infrastructure Architect',4.92,2890,36500],
        ['inst-3','Sarah Chen','sarah.chen@yaswantcode.edu','instructor',
         'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
         'Lead Frontend Engineer',4.98,4120,52000],
        ['user-demo','Alex Mercer','alex.mercer@yaswantcode.edu','student',
         'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
         'Full-Stack Developer',5.00,0,0],
    ];

    $uStmt = $pdo->prepare(
        'INSERT INTO users (id,name,email,password_hash,role,avatar,title,rating,reviews_count,students_count) VALUES (?,?,?,?,?,?,?,?,?,?)'
    );
    foreach ($seedUsers as $u) {
        $uStmt->execute([$u[0],$u[1],$u[2],$hash,$u[3],$u[4],$u[5],$u[6],$u[7],$u[8]]);
    }
    $report[] = "✅ Seeded 4 users (3 instructors + 1 demo student)";

    // Seed courses
    $cStmt = $pdo->prepare('
        INSERT INTO courses
          (id,instructor_id,title,tagline,description,thumbnail,category,difficulty,
           rating,reviews_count,students_count,duration_hours,lessons_count,
           price,original_price,discount_percentage,is_bestseller,is_featured,
           language,has_certificate,projects_count)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ');

    $courses = [
        ['course-1','inst-1','Distributed Deep Learning & Transformer Architectures',
         'Master large-scale neural network training from scratch using PyTorch & Ray.',
         'A comprehensive deep-dive into distributed training, tensor parallelism, pipeline parallelism, and low-latency inference optimizations.',
         'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
         'AI & Machine Learning','Advanced',4.96,3420,18450,42,68,149.99,249.99,40,1,1,'English',1,4],
        ['course-2','inst-2','Cloud-Native Kubernetes & Distributed Microservices in Go',
         'Architect, deploy, and scale resilient microservices across multi-region clusters.',
         'Engineered for senior backend professionals. Build production-grade Raft consensus systems, gRPC streams, and Istio service meshes.',
         'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
         'DevOps & Cloud','Advanced',4.92,2890,14200,38,54,129.99,199.99,35,1,1,'English',1,3],
        ['course-3','inst-3','React 19, Next.js & Modern Frontend Architecture',
         'Next-generation React server components, optimistic mutations, and high-performance WebGL.',
         'Go beyond basic React. Master concurrent rendering, streaming server actions, fine-grained state management, and design engineering.',
         'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
         'Web Development','Intermediate',4.98,4120,24800,48,82,119.99,189.99,37,1,1,'English',1,5],
    ];

    foreach ($courses as $c) { $cStmt->execute($c); }
    $report[] = "✅ Seeded 3 sample courses";

    // Seed course meta
    $metaData = [
        ['course-1','what_you_will_learn','Implement data parallelism & model parallelism with PyTorch DDP',0],
        ['course-1','what_you_will_learn','Build distributed training pipelines with Ray Train',1],
        ['course-1','requirement','Python 3.10+ proficiency',0],
        ['course-1','requirement','Basic linear algebra knowledge',1],
        ['course-1','skill','PyTorch','0'],['course-1','skill','Ray','1'],
        ['course-2','what_you_will_learn','Deploy multi-region Kubernetes clusters on AWS/GCP',0],
        ['course-2','requirement','Go programming basics',0],
        ['course-2','skill','Kubernetes',0],['course-2','skill','Go',1],
        ['course-3','what_you_will_learn','Master React 19 concurrent rendering & Suspense',0],
        ['course-3','what_you_will_learn','Build full-stack apps with Next.js App Router',1],
        ['course-3','requirement','JavaScript ES2022+ fundamentals',0],
        ['course-3','skill','React',0],['course-3','skill','Next.js',1],['course-3','skill','TypeScript',2],
    ];
    $metaStmt = $pdo->prepare('INSERT INTO course_meta_items (course_id,type,content,order_index) VALUES (?,?,?,?)');
    foreach ($metaData as $m) { $metaStmt->execute($m); }
    $report[] = "✅ Seeded course meta items";

    // Seed demo enrollment
    $pdo->prepare('INSERT INTO enrollments (user_id,course_id,progress_percent) VALUES (?,?,?)')
        ->execute(['user-demo','course-1',35]);
    $report[] = "✅ Seeded demo enrollment (Alex Mercer → course-1, 35% progress)";

    // Seed sample discussion
    $pdo->prepare('INSERT INTO discussions (id,user_id,title,content,category,tags_json) VALUES (?,?,?,?,?,?)')
        ->execute([
            'disc-1','user-demo',
            'How does tensor parallelism differ from pipeline parallelism?',
            'I\'ve been reading through the course materials and want to understand the core tradeoffs...',
            'AI & ML',
            '["PyTorch","Distributed Training","Transformers"]'
        ]);
    $report[] = "✅ Seeded sample community discussion";

} else {
    $report[] = "⏭ Skipped seeding — users table already has {$userCount} rows";
}

// ── 15. Install Lock ─────────────────────────────────────────────────────────
exec_sql($pdo, "
CREATE TABLE IF NOT EXISTS `install_lock` (
    `id`           INT AUTO_INCREMENT PRIMARY KEY,
    `installed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `php_version`  VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
", "Table: install_lock");

$pdo->prepare('INSERT INTO install_lock (php_version) VALUES (?)')->execute([PHP_VERSION]);
$report[] = "🔒 Installation locked — installer is now disabled";

// ─── Final Report ─────────────────────────────────────────────────────────────
json_response([
    'success'    => empty($errors),
    'message'    => empty($errors)
        ? '🎉 Database installed successfully! Your Yaswant Code LMS is ready.'
        : 'Installation completed with errors. Check the errors array.',
    'report'     => $report,
    'errors'     => $errors,
    'next_steps' => [
        '1. Visit /api/health.php to confirm all tables are created',
        '2. Update DB credentials in public/api/config.php (or Hostinger env vars)',
        '3. Deploy your Vite build output to public_html/',
        '4. Test auth at POST /api/auth.php?action=login with: {"email":"alex.mercer@yaswantcode.edu","password":"Password123!"}',
        '5. Browse courses at GET /api/courses.php',
    ],
    'demo_credentials' => [
        'student'    => ['email' => 'alex.mercer@yaswantcode.edu',   'password' => 'Password123!', 'role' => 'student'],
        'instructor' => ['email' => 'elena.vance@yaswantcode.edu',   'password' => 'Password123!', 'role' => 'instructor'],
        'instructor2'=> ['email' => 'marcus.thorne@yaswantcode.edu', 'password' => 'Password123!', 'role' => 'instructor'],
    ],
    'installed_at' => date('c'),
    'php_version'  => PHP_VERSION,
]);
