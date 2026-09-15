-- ============================================================================
-- Yaswant Code (LMS Platform) Database Schema
-- Compatible with MySQL 8.0+ / MariaDB 10.5+ / PostgreSQL
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `yaswant_code_lms` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `yaswant_code_lms`;

-- ----------------------------------------------------------------------------
-- 1. USERS & INSTRUCTORS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(64) PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('student', 'instructor', 'admin') NOT NULL DEFAULT 'student',
    `avatar` VARCHAR(500) NULL,
    `bio` TEXT NULL,
    `title` VARCHAR(255) NULL,
    `github_url` VARCHAR(255) NULL,
    `twitter_url` VARCHAR(255) NULL,
    `linkedin_url` VARCHAR(255) NULL,
    `rating` DECIMAL(3,2) DEFAULT 5.00,
    `reviews_count` INT UNSIGNED DEFAULT 0,
    `students_count` INT UNSIGNED DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email ON `users` (`email`);
CREATE INDEX idx_users_role ON `users` (`role`);

-- ----------------------------------------------------------------------------
-- 2. COURSES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `courses` (
    `id` VARCHAR(64) PRIMARY KEY,
    `instructor_id` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `tagline` VARCHAR(255) NULL,
    `description` LONGTEXT NOT NULL,
    `thumbnail` VARCHAR(500) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `difficulty` ENUM('Beginner', 'Intermediate', 'Advanced', 'All Levels') NOT NULL DEFAULT 'Beginner',
    `rating` DECIMAL(3,2) DEFAULT 4.90,
    `reviews_count` INT UNSIGNED DEFAULT 0,
    `students_count` INT UNSIGNED DEFAULT 0,
    `duration_hours` INT UNSIGNED NOT NULL DEFAULT 1,
    `lessons_count` INT UNSIGNED NOT NULL DEFAULT 1,
    `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `original_price` DECIMAL(10,2) NULL,
    `discount_percentage` INT UNSIGNED DEFAULT 0,
    `is_bestseller` TINYINT(1) DEFAULT 0,
    `is_featured` TINYINT(1) DEFAULT 0,
    `language` VARCHAR(50) DEFAULT 'English',
    `has_certificate` TINYINT(1) DEFAULT 1,
    `projects_count` INT UNSIGNED DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_course_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_courses_category ON `courses` (`category`);
CREATE INDEX idx_courses_difficulty ON `courses` (`difficulty`);
CREATE INDEX idx_courses_price ON `courses` (`price`);

-- Course bullet points (What you will learn, Requirements, Skills)
CREATE TABLE IF NOT EXISTS `course_meta_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_id` VARCHAR(64) NOT NULL,
    `type` ENUM('what_you_will_learn', 'requirement', 'skill') NOT NULL,
    `content` TEXT NOT NULL,
    `order_index` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_meta_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. MODULES, CHAPTERS & LESSONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `modules` (
    `id` VARCHAR(64) PRIMARY KEY,
    `course_id` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `duration` VARCHAR(50) NOT NULL,
    `order_index` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_module_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chapters` (
    `id` VARCHAR(64) PRIMARY KEY,
    `module_id` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `duration` VARCHAR(50) NOT NULL,
    `order_index` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_chapter_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lessons` (
    `id` VARCHAR(64) PRIMARY KEY,
    `chapter_id` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `duration` VARCHAR(50) NOT NULL,
    `type` ENUM('video', 'quiz', 'assignment', 'reading') NOT NULL DEFAULT 'video',
    `video_url` VARCHAR(500) NULL,
    `preview_available` TINYINT(1) DEFAULT 0,
    `description` LONGTEXT NULL,
    `code_snippet` LONGTEXT NULL,
    `code_language` VARCHAR(50) NULL,
    `order_index` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_lesson_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. ENROLLMENTS & STUDENT PROGRESS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `enrollments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(64) NOT NULL,
    `course_id` VARCHAR(64) NOT NULL,
    `progress_percent` INT UNSIGNED DEFAULT 0,
    `current_lesson_id` VARCHAR(64) NULL,
    `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `completed_at` TIMESTAMP NULL,
    UNIQUE KEY `unique_user_course` (`user_id`, `course_id`),
    CONSTRAINT `fk_enroll_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_enroll_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lesson_completions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(64) NOT NULL,
    `lesson_id` VARCHAR(64) NOT NULL,
    `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_user_lesson` (`user_id`, `lesson_id`),
    CONSTRAINT `fk_comp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_comp_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. QUIZZES & ASSIGNMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quizzes` (
    `id` VARCHAR(64) PRIMARY KEY,
    `course_id` VARCHAR(64) NOT NULL,
    `lesson_id` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 20,
    `passing_score` INT UNSIGNED NOT NULL DEFAULT 80,
    CONSTRAINT `fk_quiz_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `quiz_questions` (
    `id` VARCHAR(64) PRIMARY KEY,
    `quiz_id` VARCHAR(64) NOT NULL,
    `question` TEXT NOT NULL,
    `options_json` JSON NOT NULL, -- Array of 4 string options
    `correct_option_index` INT NOT NULL,
    `explanation` TEXT NOT NULL,
    `order_index` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_question_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `quiz_attempts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(64) NOT NULL,
    `quiz_id` VARCHAR(64) NOT NULL,
    `score` INT NOT NULL,
    `passed` TINYINT(1) NOT NULL,
    `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_attempt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_attempt_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `assignments` (
    `id` VARCHAR(64) PRIMARY KEY,
    `course_id` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `deadline` VARCHAR(100) NOT NULL,
    `difficulty` ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
    CONSTRAINT `fk_assignment_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `assignment_submissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `assignment_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `status` ENUM('Not Started', 'In Progress', 'Submitted', 'Under Review', 'Completed', 'Needs Revision') DEFAULT 'Submitted',
    `github_url` VARCHAR(500) NULL,
    `submitted_file` VARCHAR(500) NULL,
    `grade` VARCHAR(10) NULL,
    `feedback` TEXT NULL,
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `reviewed_at` TIMESTAMP NULL,
    CONSTRAINT `fk_sub_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_sub_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. CERTIFICATES & CREDENTIALS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `certificates` (
    `id` VARCHAR(64) PRIMARY KEY,
    `course_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `credential_id` VARCHAR(100) NOT NULL UNIQUE,
    `grade` VARCHAR(10) NOT NULL DEFAULT 'A+',
    `issue_date` DATE NOT NULL,
    `thumbnail_url` VARCHAR(500) NULL,
    `verification_code` VARCHAR(128) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_cert_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cert_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. COMMUNITY DISCUSSIONS & ANSWERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `discussions` (
    `id` VARCHAR(64) PRIMARY KEY,
    `user_id` VARCHAR(64) NOT NULL,
    `course_id` VARCHAR(64) NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `category` ENUM('General', 'Frontend', 'Backend', 'AI & ML', 'Architecture', 'Career') NOT NULL DEFAULT 'General',
    `tags_json` JSON NOT NULL, -- JSON array of tags: ["React", "TypeScript"]
    `upvotes` INT UNSIGNED DEFAULT 0,
    `has_accepted_answer` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_disc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_disc_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `discussion_replies` (
    `id` VARCHAR(64) PRIMARY KEY,
    `discussion_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `is_accepted` TINYINT(1) DEFAULT 0,
    `upvotes` INT UNSIGNED DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reply_disc` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reply_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` VARCHAR(64) PRIMARY KEY,
    `user_id` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('course', 'assignment', 'quiz', 'certificate', 'announcement', 'community') NOT NULL,
    `link` VARCHAR(500) NULL,
    `is_read` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. SEED SAMPLE DATA
-- ----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `avatar`, `title`, `rating`, `reviews_count`, `students_count`) VALUES
('inst-1', 'Dr. Elena Vance', 'elena.vance@yaswantcode.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', 'Staff AI Engineer', 4.96, 3420, 48900),
('inst-2', 'Marcus Thorne', 'marcus.thorne@yaswantcode.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', 'Principal Infrastructure Architect', 4.92, 2890, 36500),
('inst-3', 'Sarah Chen', 'sarah.chen@yaswantcode.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', 'Lead Frontend Engineer', 4.98, 4120, 52000),
('user-demo', 'Alex Mercer', 'alex.mercer@yaswantcode.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80', 'Full-Stack Student', 5.00, 0, 0);

INSERT INTO `courses` (`id`, `instructor_id`, `title`, `tagline`, `description`, `thumbnail`, `category`, `difficulty`, `rating`, `reviews_count`, `students_count`, `duration_hours`, `lessons_count`, `price`, `original_price`, `discount_percentage`, `is_bestseller`, `is_featured`, `language`, `has_certificate`, `projects_count`) VALUES
('course-1', 'inst-1', 'Distributed Deep Learning & Transformer Architectures', 'Master large-scale neural network training from scratch using PyTorch & Ray.', 'A comprehensive deep-dive into distributed training, tensor parallelism, pipeline parallelism, and low-latency inference optimizations.', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80', 'AI & Machine Learning', 'Advanced', 4.96, 3420, 18450, 42, 68, 149.99, 249.99, 40, 1, 1, 'English', 1, 4),
('course-2', 'inst-2', 'Cloud-Native Kubernetes & Distributed Microservices in Go', 'Architect, deploy, and scale resilient microservices across multi-region clusters.', 'Engineered for senior backend professionals. Build production-grade Raft consensus systems, gRPC streams, and Istio service meshes.', 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80', 'DevOps & Cloud', 'Advanced', 4.92, 2890, 14200, 38, 54, 129.99, 199.99, 35, 1, 1, 'English', 1, 3),
('course-3', 'inst-3', 'React 19, Next.js & Modern Frontend Architecture', 'Next-generation React server components, optimistic mutations, and high-performance WebGL.', 'Go beyond basic React. Master concurrent rendering, streaming server actions, fine-grained state management, and design engineering.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80', 'Web Development', 'Intermediate', 4.98, 4120, 24800, 48, 82, 119.99, 189.99, 37, 1, 1, 'English', 1, 5);
