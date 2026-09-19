<?php
/**
 * Yaswant Code LMS — Courses API
 * Hostinger Shared Hosting Compatible
 *
 * Endpoints:
 *   GET                          — List courses (paginated, filterable)
 *   GET    ?id=course-1          — Full course detail with curriculum
 *   GET    ?action=featured      — Featured courses for landing page
 *   POST                         — Create course (instructor/admin)
 *   PUT    ?id=course-1          — Update course (owner/admin)
 *   DELETE ?id=course-1          — Soft delete course (owner/admin)
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method   = $_SERVER['REQUEST_METHOD'];
$courseId = trim($_GET['id'] ?? '');
$action   = strtolower(trim($_GET['action'] ?? ''));

// ─── GET — Course Listing / Detail ─────────────────────────────────────────
if ($method === 'GET') {
    $pdo = require_db();

    // Featured courses for landing page
    if ($action === 'featured') {
        $stmt = $pdo->prepare('
            SELECT c.*, u.name AS instructor_name, u.avatar AS instructor_avatar, u.title AS instructor_title
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
            WHERE (c.is_deleted = 0 OR c.is_deleted IS NULL)
            ORDER BY c.is_featured DESC, c.students_count DESC
            LIMIT 6
        ');
        $stmt->execute();
        $courses = array_map(fn($c) => cast_course($c), $stmt->fetchAll());
        ok($courses);
    }

    // Single course detail
    if ($courseId) {
        $stmt = $pdo->prepare('
            SELECT c.*,
                   u.id   AS instructor_id,
                   u.name AS instructor_name,
                   u.title AS instructor_title,
                   u.avatar AS instructor_avatar,
                   u.bio AS instructor_bio,
                   u.rating AS instructor_rating,
                   u.students_count AS instructor_students_count,
                   u.reviews_count  AS instructor_reviews_count,
                   u.github_url AS instructor_github,
                   u.twitter_url AS instructor_twitter,
                   u.linkedin_url AS instructor_linkedin
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            WHERE c.id = ? AND (c.is_deleted = 0 OR c.is_deleted IS NULL)
        ');
        $stmt->execute([$courseId]);
        $course = $stmt->fetch();

        if (!$course) fail('Course not found.', 404);

        // Cast numeric fields
        $course = cast_course($course);

        // Meta items (what you'll learn, requirements, skills)
        $meta = $pdo->prepare('SELECT type, content FROM course_meta_items WHERE course_id = ? ORDER BY order_index ASC');
        $meta->execute([$courseId]);
        $metaRows = $meta->fetchAll();

        $course['whatYouWillLearn'] = [];
        $course['requirements']     = [];
        $course['skills']           = [];
        foreach ($metaRows as $row) {
            if ($row['type'] === 'what_you_will_learn') $course['whatYouWillLearn'][] = $row['content'];
            if ($row['type'] === 'requirement')         $course['requirements'][]     = $row['content'];
            if ($row['type'] === 'skill')               $course['skills'][]           = $row['content'];
        }

        // Curriculum: modules → chapters → lessons
        $modStmt = $pdo->prepare('SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC');
        $modStmt->execute([$courseId]);
        $modules = $modStmt->fetchAll();

        foreach ($modules as &$mod) {
            $chapStmt = $pdo->prepare('SELECT * FROM chapters WHERE module_id = ? ORDER BY order_index ASC');
            $chapStmt->execute([$mod['id']]);
            $chapters = $chapStmt->fetchAll();

            foreach ($chapters as &$chap) {
                $lessStmt = $pdo->prepare('SELECT * FROM lessons WHERE chapter_id = ? ORDER BY order_index ASC');
                $lessStmt->execute([$chap['id']]);
                $lessons = $lessStmt->fetchAll();
                $chap['lessons'] = array_map(fn($l) => cast_lesson($l), $lessons);
            }
            unset($chap);
            $mod['chapters'] = $chapters;
        }
        unset($mod);

        $course['modules'] = $modules;
        $course['instructor'] = [
            'id'            => $course['instructor_id'],
            'name'          => $course['instructor_name'],
            'title'         => $course['instructor_title'],
            'avatar'        => $course['instructor_avatar'],
            'bio'           => $course['instructor_bio'],
            'rating'        => (float)$course['instructor_rating'],
            'studentsCount' => (int)$course['instructor_students_count'],
            'reviewsCount'  => (int)$course['instructor_reviews_count'],
            'githubUrl'     => $course['instructor_github'],
            'twitterUrl'    => $course['instructor_twitter'],
            'linkedinUrl'   => $course['instructor_linkedin'],
        ];

        // Remove flat instructor columns from course root
        foreach (['instructor_id','instructor_name','instructor_title','instructor_avatar','instructor_bio',
                  'instructor_rating','instructor_students_count','instructor_reviews_count',
                  'instructor_github','instructor_twitter','instructor_linkedin'] as $col) {
            unset($course[$col]);
        }

        ok($course);
    }

    // Featured courses shortcut
    if ($action === 'featured') {
        $stmt = $pdo->prepare('
            SELECT c.id, c.title, c.tagline, c.thumbnail, c.category, c.difficulty,
                   c.rating, c.reviews_count, c.students_count, c.price, c.original_price,
                   c.discount_percentage, c.duration_hours, c.lessons_count,
                   c.is_bestseller, c.has_certificate, c.language,
                   u.name AS instructor_name, u.avatar AS instructor_avatar
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            WHERE c.is_featured = 1 AND c.is_deleted = 0
            ORDER BY c.students_count DESC
            LIMIT 6
        ');
        $stmt->execute();
        ok(array_map(fn($c) => cast_course($c), $stmt->fetchAll()));
    }

    // Full listing with filters and pagination
    $category   = trim($_GET['category'] ?? '');
    $search     = trim($_GET['search'] ?? '');
    $difficulty = trim($_GET['difficulty'] ?? '');
    $sort       = trim($_GET['sort'] ?? 'popular');
    $page       = max(1, (int)($_GET['page'] ?? 1));
    $per_page   = max(1, min(50, (int)($_GET['per_page'] ?? 20)));

    $where  = ['(c.is_deleted = 0 OR c.is_deleted IS NULL)'];
    $params = [];

    if ($category && $category !== 'All') {
        $where[] = 'c.category = ?';
        $params[] = $category;
    }
    if ($difficulty && $difficulty !== 'All') {
        $where[] = 'c.difficulty = ?';
        $params[] = $difficulty;
    }
    if ($search) {
        $where[] = '(c.title LIKE ? OR c.description LIKE ? OR c.tagline LIKE ?)';
        $like = '%' . $search . '%';
        $params[] = $like;
        $params[] = $like;
        $params[] = $like;
    }

    $order = match($sort) {
        'newest'    => 'c.created_at DESC',
        'rating'    => 'c.rating DESC',
        'price_low' => 'c.price ASC',
        'price_high'=> 'c.price DESC',
        default     => 'c.students_count DESC',
    };

    $whereStr = implode(' AND ', $where);
    $baseSql  = "
        SELECT c.id, c.title, c.tagline, c.description, c.thumbnail, c.category, c.difficulty,
               c.rating, c.reviews_count, c.students_count, c.price, c.original_price,
               c.discount_percentage, c.duration_hours, c.lessons_count,
               c.is_bestseller, c.is_featured, c.has_certificate, c.language,
               u.name AS instructor_name, u.avatar AS instructor_avatar, u.title AS instructor_title
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE {$whereStr}
        ORDER BY {$order}
    ";

    // Count
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE {$whereStr}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $offset  = ($page - 1) * $per_page;
    $dataStmt = $pdo->prepare($baseSql . " LIMIT {$per_page} OFFSET {$offset}");
    $dataStmt->execute($params);
    $courses = array_map(fn($c) => cast_course($c), $dataStmt->fetchAll());

    ok([
        'courses'     => $courses,
        'total'       => $total,
        'page'        => $page,
        'per_page'    => $per_page,
        'total_pages' => (int)ceil($total / max(1, $per_page)),
    ]);
}

// ─── POST — Create Course ───────────────────────────────────────────────────
if ($method === 'POST') {
    $user  = require_role('instructor', 'admin');
    $input = get_json_input();

    $title = str_input($input, 'title');
    if (!$title) fail('Course title is required.', 422);

    $price = isset($input['price']) ? (float)$input['price'] : 0.00;

    $pdo      = require_db();
    $courseId = generate_id('course');

    $pdo->prepare('
        INSERT INTO courses
          (id, instructor_id, title, tagline, description, thumbnail, category,
           difficulty, price, original_price, discount_percentage, duration_hours, lessons_count, language)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ')->execute([
        $courseId,
        $user['id'],
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
    ]);

    // Insert meta items
    $save_meta = function (array $items, string $type) use ($pdo, $courseId): void {
        foreach ($items as $i => $content) {
            if ($content) {
                $pdo->prepare(
                    'INSERT INTO course_meta_items (course_id, type, content, order_index) VALUES (?, ?, ?, ?)'
                )->execute([$courseId, $type, sanitize($content), $i]);
            }
        }
    };

    if (!empty($input['whatYouWillLearn'])) $save_meta((array)$input['whatYouWillLearn'], 'what_you_will_learn');
    if (!empty($input['requirements']))     $save_meta((array)$input['requirements'],     'requirement');
    if (!empty($input['skills']))           $save_meta((array)$input['skills'],           'skill');

    ok(['id' => $courseId], 'Course created successfully!', 201);
}

// ─── PUT — Update Course ────────────────────────────────────────────────────
if ($method === 'PUT' && $courseId) {
    $user  = require_auth();
    $input = get_json_input();
    $pdo   = require_db();

    // Verify ownership
    $own = $pdo->prepare('SELECT instructor_id FROM courses WHERE id = ?');
    $own->execute([$courseId]);
    $row = $own->fetch();
    if (!$row) fail('Course not found.', 404);
    if ($row['instructor_id'] !== $user['id'] && $user['role'] !== 'admin') {
        fail('You do not have permission to edit this course.', 403);
    }

    $allowed = ['title','tagline','description','thumbnail','category','difficulty',
                'price','original_price','discount_percentage','duration_hours',
                'lessons_count','language'];
    if ($user['role'] === 'admin') {
        $allowed[] = 'is_featured';
        $allowed[] = 'is_bestseller';
    }
    $sets = []; $vals = [];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $input)) {
            $sets[] = "{$f} = ?";
            $vals[] = is_string($input[$f]) ? sanitize($input[$f]) : $input[$f];
        }
    }

    if (!empty($sets)) {
        $vals[] = $courseId;
        $pdo->prepare('UPDATE courses SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($vals);
    }

    ok(['id' => $courseId], 'Course updated');
}

// ─── DELETE — Soft Delete Course ────────────────────────────────────────────
if ($method === 'DELETE' && $courseId) {
    $user = require_auth();
    $pdo  = require_db();

    $own = $pdo->prepare('SELECT instructor_id FROM courses WHERE id = ?');
    $own->execute([$courseId]);
    $row = $own->fetch();
    if (!$row) fail('Course not found.', 404);
    if ($row['instructor_id'] !== $user['id'] && $user['role'] !== 'admin') {
        fail('You do not have permission to delete this course.', 403);
    }

    $pdo->prepare('UPDATE courses SET is_deleted = 1 WHERE id = ?')->execute([$courseId]);
    ok(null, 'Course deleted');
}

fail('Invalid request.', 405);

// ─── Helpers ───────────────────────────────────────────────────────────────
function cast_course(array $c): array {
    $c['rating']              = (float)($c['rating'] ?? 0);
    $c['reviews_count']       = (int)($c['reviews_count'] ?? 0);
    $c['students_count']      = (int)($c['students_count'] ?? 0);
    $c['price']               = (float)($c['price'] ?? 0);
    $c['original_price']      = isset($c['original_price']) ? (float)$c['original_price'] : null;
    $c['discount_percentage'] = (int)($c['discount_percentage'] ?? 0);
    $c['duration_hours']      = (int)($c['duration_hours'] ?? 0);
    $c['lessons_count']       = (int)($c['lessons_count'] ?? 0);
    $c['projects_count']      = (int)($c['projects_count'] ?? 0);
    $c['is_bestseller']       = (bool)($c['is_bestseller'] ?? false);
    $c['is_featured']         = (bool)($c['is_featured'] ?? false);
    $c['has_certificate']     = (bool)($c['has_certificate'] ?? true);
    return $c;
}

function cast_lesson(array $l): array {
    $l['preview_available'] = (bool)($l['preview_available'] ?? false);
    return $l;
}

