<?php
/**
 * Yaswant Code LMS — Seed Desktop Engineering Notes into Database
 * Safely inserts or updates the 9 comprehensive engineering notes in study_notes table.
 */

declare(strict_types=1);
require_once __DIR__ . '/config.php';

$pdo = get_db();
if (!$pdo) {
    fail('Database connection failed.', 500);
}

// Check authorization via secret key query parameter or admin token
$secret = trim($_GET['secret'] ?? '');
$authorizedBySecret = (INSTALL_SECRET !== '' && INSTALL_SECRET !== 'change_this_install_secret' && $secret === INSTALL_SECRET);
if (!$authorizedBySecret) {
    // If not matching secret, check if admin is logged in
    $token = get_bearer_token();
    $isAdmin = false;
    if ($token) {
        try {
            $stmt = $pdo->prepare('SELECT u.role FROM user_sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()');
            $stmt->execute([$token]);
            $role = $stmt->fetchColumn();
            if ($role === 'admin') {
                $isAdmin = true;
            }
        } catch (Throwable $e) {
        }
    }
    if (!$isAdmin) {
        fail('Unauthorized access to notes seeder.', 403);
    }
}

$notesToSeed = [
    [
        'id' => 'note-android-complete',
        'title' => 'Complete Android Development Master Note',
        'topic' => 'Android & Kotlin Engineering',
        'category' => 'Languages & Programming',
        'resource_type' => 'pdf',
        'url' => 'https://yaswant.co.in/notes/Android_CompleteNotes.pdf',
        'file_size' => '23.0 MB • 350+ Pages',
        'thumbnail' => 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&auto=format&fit=crop&q=80',
        'description' => 'Comprehensive engineering handbook covering Android OS architecture, Kotlin fundamentals, Activities, Fragments, Jetpack Compose, Room DB, Retrofit, Coroutines, and Play Store publishing.',
        'author' => 'Yaswant Pandey',
        'pinned' => 1,
        'starred' => 1,
        'tags' => 'Android, Kotlin, Mobile, Jetpack, App Dev',
    ],
    [
        'id' => 'note-btech-dsuc',
        'title' => 'B.Tech Data Structures Using C (DSUC) Notes',
        'topic' => 'B.Tech Computer Science Core',
        'category' => 'Data Structures & Algorithms',
        'resource_type' => 'pdf',
        'url' => 'https://yaswant.co.in/notes/btech_DSUC_Notes_1.pdf',
        'file_size' => '47.5 MB • Complete Syllabus',
        'thumbnail' => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
        'description' => 'Detailed B.Tech university curriculum engineering notes on Data Structures Using C (DSUC). Includes arrays, linked lists, stacks, queues, trees, graphs, sorting, searching, and university exam solutions.',
        'author' => 'Yaswant Pandey',
        'pinned' => 1,
        'starred' => 1,
        'tags' => 'BTech, DSUC, Data Structures, C, University',
    ],
    [
        'id' => 'note-cloud-computing',
        'title' => 'Cloud Computing & Infrastructure Engineering Notes',
        'topic' => 'Cloud Architecture & Virtualization',
        'category' => 'DevOps & Cloud',
        'resource_type' => 'pdf',
        'url' => 'https://yaswant.co.in/notes/Cloud_Computing_Notes.pdf',
        'file_size' => '8.6 MB • 120+ Pages',
        'thumbnail' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        'description' => 'Comprehensive study notes covering Cloud Service Models (IaaS, PaaS, SaaS), hypervisors, virtualization, AWS/Azure/GCP fundamentals, cloud security, disaster recovery, and serverless compute.',
        'author' => 'Yaswant Pandey',
        'pinned' => 0,
        'starred' => 1,
        'tags' => 'Cloud, AWS, Virtualization, DevOps, Infrastructure',
    ],
    [
        'id' => 'note-c-complete',
        'title' => 'Complete C Programming & Memory Architecture Notes',
        'topic' => 'Systems Programming & C',
        'category' => 'Languages & Programming',
        'resource_type' => 'pdf',
        'url' => 'https://yaswant.co.in/notes/C_Complete_Notes.pdf',
        'file_size' => '31.6 MB • 240+ Pages',
        'thumbnail' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        'description' => 'Exhaustive notes on C language internals, compilation pipeline, memory segmentation (Stack/Heap/BSS/Data), double pointers, dynamic memory allocation (malloc/free), structs, bit manipulation, and file I/O.',
        'author' => 'Yaswant Pandey',
        'pinned' => 0,
        'starred' => 1,
        'tags' => 'C, Systems, Pointers, Memory, Low-Level',
    ],
    [
        'id' => 'note-data-science-handbook',
        'title' => 'Data Science & Machine Learning Practical Handbook',
        'topic' => 'Data Science & Scientific Python',
        'category' => 'Machine Learning',
        'resource_type' => 'pdf',
        'url' => 'https://yaswant.co.in/notes/data_science_handbook.pdf',
        'file_size' => '3.0 MB • Handbook',
        'thumbnail' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        'description' => 'Practical engineering handbook for Data Science: NumPy array operations, Pandas dataframe transformations, data visualization with Matplotlib & Seaborn, feature engineering, and Scikit-Learn pipelines.',
        'author' => 'Yaswant Pandey',
        'pinned' => 0,
        'starred' => 1,
        'tags' => 'Data Science, Python, NumPy, Pandas, Machine Learning',
    ],
    [
        'id' => 'note-dsa-complete',
        'title' => 'Complete Data Structures & Algorithms (DSA) Hand Notes',
        'topic' => 'DSA & LeetCode Patterns',
        'category' => 'Data Structures & Algorithms',
        'resource_type' => 'pdf',
        'url' => 'https://yaswant.co.in/notes/DSA_CompleteNotes.pdf',
        'file_size' => '10.9 MB • Full Course',
        'thumbnail' => 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
        'description' => 'Complete DSA notes with visual diagrams and problem patterns: Asymptotic analysis, Arrays, Strings, Hashmaps, Two Pointers, Sliding Window, Linked Lists, Binary Trees, BST, Graphs (BFS/DFS), Dijkstra, and Dynamic Programming.',
        'author' => 'Yaswant Pandey',
        'pinned' => 1,
        'starred' => 1,
        'tags' => 'DSA, Algorithms, Data Structures, LeetCode, FAANG',
    ],
    [
        'id' => 'note-java-complete',
        'title' => 'Complete Java & Enterprise Architecture Notes',
        'topic' => 'Core Java, JVM & OOPs',
        'category' => 'Languages & Programming',
        'resource_type' => 'pdf',
        'url' => 'https://yaswant.co.in/notes/Java_Complete_Notes.pdf',
        'file_size' => '39.1 MB • 300+ Pages',
        'thumbnail' => 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
        'description' => 'Full-stack Java engineering guide: Object-Oriented Programming (Polymorphism, Inheritance, Encapsulation, Abstraction), JVM memory architecture, Garbage Collection, Multithreading & Concurrency, Collections framework, Exception Handling, and Streams.',
        'author' => 'Yaswant Pandey',
        'pinned' => 0,
        'starred' => 1,
        'tags' => 'Java, OOP, JVM, Concurrency, Collections, Spring',
    ],
    [
        'id' => 'note-js-chapterwise',
        'title' => 'Modern JavaScript Chapterwise Engineering Notes',
        'topic' => 'JavaScript Internals & ES6+',
        'category' => 'React & Web',
        'resource_type' => 'pdf',
        'url' => 'https://yaswant.co.in/notes/JS_Chapterwise_Notes.pdf',
        'file_size' => '32.8 MB • Chapterwise',
        'thumbnail' => 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop&q=80',
        'description' => 'Chapter-by-chapter modern JavaScript master notes: Execution contexts, Call Stack, Scopes & Lexical Environment, Closures, Prototypal Inheritance, Event Loop & Microtask Queue, Promises, Async/Await, and DOM manipulation.',
        'author' => 'Yaswant Pandey',
        'pinned' => 1,
        'starred' => 1,
        'tags' => 'JavaScript, ES6, Web Dev, Frontend, Event Loop',
    ],
    [
        'id' => 'note-python-complete',
        'title' => 'Complete Python Programming & Scripting Notes',
        'topic' => 'Python Core & Automation',
        'category' => 'Languages & Programming',
        'resource_type' => 'pdf',
        'url' => 'https://yaswant.co.in/notes/Python_Complete_Notes.pdf',
        'file_size' => '26.1 MB • Complete Guide',
        'thumbnail' => 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=80',
        'description' => 'Complete Python programming notes from fundamentals to advanced concepts: Data types, List comprehensions, Functions & Lambdas, Decorators & Generators, OOP in Python, File handling, Exception handling, and popular standard libraries.',
        'author' => 'Yaswant Pandey',
        'pinned' => 0,
        'starred' => 1,
        'tags' => 'Python, Scripting, Automation, OOP, Backend',
    ]
];

$upsertCount = 0;
$inserted = [];

foreach ($notesToSeed as $n) {
    // Check if exists by id
    $check = $pdo->prepare('SELECT id FROM study_notes WHERE id = ? OR title = ?');
    $check->execute([$n['id'], $n['title']]);
    $existingId = $check->fetchColumn();

    if ($existingId) {
        // Update existing record
        $update = $pdo->prepare('
            UPDATE study_notes SET
                title = ?, topic = ?, category = ?, resource_type = ?, url = ?,
                file_size = ?, thumbnail = ?, description = ?, author = ?,
                pinned = ?, starred = ?, tags = ?, updated_at = NOW()
            WHERE id = ?
        ');
        $update->execute([
            $n['title'],
            $n['topic'],
            $n['category'],
            $n['resource_type'],
            $n['url'],
            $n['file_size'],
            $n['thumbnail'],
            $n['description'],
            $n['author'],
            $n['pinned'],
            $n['starred'],
            $n['tags'],
            $existingId,
        ]);
        $inserted[] = "Updated: {$n['title']} (ID: {$existingId})";
    } else {
        // Insert new record
        $insert = $pdo->prepare('
            INSERT INTO study_notes
                (id, title, topic, category, resource_type, url, file_size, thumbnail, description, author, pinned, starred, tags, created_at, updated_at)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ');
        $insert->execute([
            $n['id'],
            $n['title'],
            $n['topic'],
            $n['category'],
            $n['resource_type'],
            $n['url'],
            $n['file_size'],
            $n['thumbnail'],
            $n['description'],
            $n['author'],
            $n['pinned'],
            $n['starred'],
            $n['tags'],
        ]);
        $inserted[] = "Inserted: {$n['title']} (ID: {$n['id']})";
    }
    $upsertCount++;
}

ok([
    'total_processed' => $upsertCount,
    'details' => $inserted,
], "Successfully seeded {$upsertCount} engineering study notes into the database.");
