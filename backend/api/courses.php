<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/cors.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $courseId = $_GET['id'] ?? null;
    $category = $_GET['category'] ?? null;
    $search   = $_GET['search'] ?? null;

    if ($courseId) {
        $stmt = $pdo->prepare("
            SELECT c.*, 
                   u.id AS instructor_id, u.name AS instructor_name, u.title AS instructor_role, 
                   u.avatar AS instructor_avatar, u.bio AS instructor_bio, u.rating AS instructor_rating,
                   u.students_count AS instructor_students_count, u.reviews_count AS instructor_reviews_count
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            WHERE c.id = ?
        ");
        $stmt->execute([$courseId]);
        $course = $stmt->fetch();

        if (!$course) {
            jsonResponse(false, null, 'Course not found', 404);
        }

        // Fetch meta items (what you will learn, requirements, skills)
        $metaStmt = $pdo->prepare("SELECT type, content FROM course_meta_items WHERE course_id = ? ORDER BY order_index ASC");
        $metaStmt->execute([$courseId]);
        $metaRows = $metaStmt->fetchAll();

        $whatYouWillLearn = [];
        $requirements = [];
        $skills = [];
        foreach ($metaRows as $row) {
            if ($row['type'] === 'what_you_will_learn') $whatYouWillLearn[] = $row['content'];
            if ($row['type'] === 'requirement') $requirements[] = $row['content'];
            if ($row['type'] === 'skill') $skills[] = $row['content'];
        }

        // Fetch modules and lessons
        $modStmt = $pdo->prepare("SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC");
        $modStmt->execute([$courseId]);
        $modules = $modStmt->fetchAll();

        foreach ($modules as &$module) {
            $chapStmt = $pdo->prepare("SELECT * FROM chapters WHERE module_id = ? ORDER BY order_index ASC");
            $chapStmt->execute([$module['id']]);
            $chapters = $chapStmt->fetchAll();

            foreach ($chapters as &$chapter) {
                $lessStmt = $pdo->prepare("SELECT * FROM lessons WHERE chapter_id = ? ORDER BY order_index ASC");
                $lessStmt->execute([$chapter['id']]);
                $chapter['lessons'] = $lessStmt->fetchAll();
            }
            $module['chapters'] = $chapters;
        }

        $course['whatYouWillLearn'] = $whatYouWillLearn;
        $course['requirements'] = $requirements;
        $course['skills'] = $skills;
        $course['modules'] = $modules;
        $course['instructor'] = [
            'id' => $course['instructor_id'],
            'name' => $course['instructor_name'],
            'role' => $course['instructor_role'],
            'avatar' => $course['instructor_avatar'],
            'bio' => $course['instructor_bio'],
            'rating' => (float)$course['instructor_rating'],
            'reviewsCount' => (int)$course['instructor_reviews_count'],
            'studentsCount' => (int)$course['instructor_students_count'],
        ];

        jsonResponse(true, $course);
    }

    // List courses with optional filters
    $sql = "
        SELECT c.*, 
               u.name AS instructor_name, u.avatar AS instructor_avatar, u.title AS instructor_role
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        WHERE 1=1
    ";
    $params = [];

    if ($category && $category !== 'All') {
        $sql .= " AND c.category = ?";
        $params[] = $category;
    }
    if ($search) {
        $sql .= " AND (c.title LIKE ? OR c.description LIKE ?)";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }

    $sql .= " ORDER BY c.students_count DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $courses = $stmt->fetchAll();

    jsonResponse(true, $courses);
}

if ($method === 'POST') {
    // Instructor / Admin course creation
    $input = getJsonInput();
    if (empty($input['title']) || empty($input['instructor_id']) || empty($input['price'])) {
        jsonResponse(false, null, 'Missing required fields: title, instructor_id, price', 422);
    }

    $courseId = 'course-' . uniqid();
    $stmt = $pdo->prepare("
        INSERT INTO courses (id, instructor_id, title, tagline, description, thumbnail, category, difficulty, price, duration_hours, lessons_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $courseId,
        $input['instructor_id'],
        $input['title'],
        $input['tagline'] ?? '',
        $input['description'] ?? '',
        $input['thumbnail'] ?? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        $input['category'] ?? 'General',
        $input['difficulty'] ?? 'Beginner',
        $input['price'] ?? 0.00,
        $input['duration_hours'] ?? 10,
        $input['lessons_count'] ?? 15,
    ]);

    jsonResponse(true, ['id' => $courseId], 'Course created successfully', 201);
}
