<?php
/**
 * Comprehensive LMS Real Data Seeder
 * Populates real modules, chapters, lessons, quizzes, assignments, certificates, and discussions
 */

declare(strict_types=1);
require_once __DIR__ . '/../public/api/config.php';

$pdo = get_db();
if (!$pdo) {
    die("Database connection failed\n");
}

echo "Seeding curriculum (modules, chapters, lessons)...\n";

// ── 1. MODULES, CHAPTERS & LESSONS FOR COURSE-3 (React 19 & Next.js) ─────────
$modulesData = [
    [
        'mod_id' => 'mod-c3-1',
        'course_id' => 'course-3',
        'title' => 'Module 1: Foundations of React 19 & Concurrent Runtime',
        'order' => 1,
        'chapters' => [
            [
                'chap_id' => 'chap-c3-1',
                'title' => 'Chapter 1: The Modern React Core',
                'order' => 1,
                'lessons' => [
                    [
                        'id' => 'les-c3-101',
                        'title' => 'Deep Dive into React 19 Compiler & Actions',
                        'duration' => '18:45',
                        'type' => 'video',
                        'video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                        'content' => 'Comprehensive lecture exploring how the React Compiler eliminates manual useMemo and useCallback memoization. Learn how React Actions manage async transitions, optimistic states, and automatic form resets.',
                        'code_snippet' => "import { useActionState } from 'react';\n\nasync function updateName(previousState, formData) {\n  const name = formData.get('name');\n  return { name, timestamp: Date.now() };\n}\n\nexport function UserProfile() {\n  const [state, formAction, isPending] = useActionState(updateName, { name: '' });\n  return (\n    <form action={formAction}>\n      <input name=\"name\" defaultValue={state.name} />\n      <button disabled={isPending}>{isPending ? 'Saving...' : 'Update'}</button>\n    </form>\n  );\n}",
                        'is_free' => 1,
                        'order' => 1
                    ],
                    [
                        'id' => 'les-c3-102',
                        'title' => 'Optimistic UI Updates with useOptimistic Hook',
                        'duration' => '15:20',
                        'type' => 'video',
                        'video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                        'content' => 'Master optimistic mutations in real-time interfaces. Learn how to immediately update client state while server mutations are in-flight, with automatic rollback boundaries on error.',
                        'code_snippet' => "const [optimisticState, setOptimistic] = useOptimistic(state, (prev, update) => ({\n  ...prev,\n  items: [...prev.items, update]\n}));",
                        'is_free' => 1,
                        'order' => 2
                    ],
                    [
                        'id' => 'les-c3-103',
                        'title' => 'React 19 Server Components Architecture',
                        'duration' => '22:10',
                        'type' => 'reading',
                        'video_url' => '',
                        'content' => 'Server Components (RSC) fundamentally shift how React applications fetch and render data. In this comprehensive guide, we dissect the RSC wire protocol, serialization boundaries, streaming SSR, and zero-bundle-size client dependencies.',
                        'code_snippet' => "// Server Component\nimport db from '@/lib/db';\n\nexport default async function CoursesList() {\n  const courses = await db.query('SELECT * FROM courses WHERE is_deleted = 0');\n  return (\n    <ul>\n      {courses.map(c => <li key={c.id}>{c.title} - \${c.price}</li>)}\n    </ul>\n  );\n}",
                        'is_free' => 0,
                        'order' => 3
                    ]
                ]
            ]
        ]
    ],
    [
        'mod_id' => 'mod-c3-2',
        'course_id' => 'course-3',
        'title' => 'Module 2: Next.js 15 Full-Stack App Router & Caching',
        'order' => 2,
        'chapters' => [
            [
                'chap_id' => 'chap-c3-2',
                'title' => 'Chapter 2: Production Server Actions & Data Fetching',
                'order' => 1,
                'lessons' => [
                    [
                        'id' => 'les-c3-201',
                        'title' => 'Dynamic Route Handlers and Edge Middleware',
                        'duration' => '19:30',
                        'type' => 'video',
                        'video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                        'content' => 'Architecting resilient API routes with Next.js 15, edge authentication verification, rate limiting, and structured JSON output.',
                        'code_snippet' => "export async function GET(request: Request) {\n  return Response.json({ success: true, timestamp: Date.now() });\n}",
                        'is_free' => 0,
                        'order' => 1
                    ],
                    [
                        'id' => 'les-c3-202',
                        'title' => 'Hands-on Lab: Real-time Multi-tenant Dashboard',
                        'duration' => '30:00',
                        'type' => 'code',
                        'video_url' => '',
                        'content' => 'Build a high-throughput monitoring dashboard utilizing React 19 concurrent streams, Server-Sent Events (SSE), and Tailwind CSS v4.',
                        'code_snippet' => "// Dashboard stream implementation",
                        'is_free' => 0,
                        'order' => 2
                    ]
                ]
            ]
        ]
    ],
    // Course 1: Distributed Deep Learning
    [
        'mod_id' => 'mod-c1-1',
        'course_id' => 'course-1',
        'title' => 'Module 1: Large-Scale Distributed Neural Networks',
        'order' => 1,
        'chapters' => [
            [
                'chap_id' => 'chap-c1-1',
                'title' => 'Chapter 1: Multi-GPU Training Foundations',
                'order' => 1,
                'lessons' => [
                    [
                        'id' => 'les-c1-101',
                        'title' => 'PyTorch DDP (Distributed Data Parallel) Internals',
                        'duration' => '24:15',
                        'type' => 'video',
                        'video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
                        'content' => 'Understand ring-allreduce algorithms, NCCL collective operations, gradient synchronization, and gradient accumulation across clusters.',
                        'code_snippet' => "import torch.distributed as dist\ndist.init_process_group(backend='nccl')",
                        'is_free' => 1,
                        'order' => 1
                    ]
                ]
            ]
        ]
    ],
    // Course 2: Cloud-Native Kubernetes
    [
        'mod_id' => 'mod-c2-1',
        'course_id' => 'course-2',
        'title' => 'Module 1: Kubernetes Cluster Orchestration with Go',
        'order' => 1,
        'chapters' => [
            [
                'chap_id' => 'chap-c2-1',
                'title' => 'Chapter 1: Container Runtime & Kubernetes Primitives',
                'order' => 1,
                'lessons' => [
                    [
                        'id' => 'les-c2-101',
                        'title' => 'Custom Kubernetes Controllers using client-go',
                        'duration' => '21:00',
                        'type' => 'video',
                        'video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                        'content' => 'Write production-grade Custom Resource Definitions (CRDs) and reconciliation loops in Golang with Informers and Workqueues.',
                        'code_snippet' => "package main\nimport \"k8s.io/client-go/kubernetes\"",
                        'is_free' => 1,
                        'order' => 1
                    ]
                ]
            ]
        ]
    ]
];

foreach ($modulesData as $m) {
    $stmt = $pdo->prepare('INSERT INTO modules (id, course_id, title, order_index) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title)');
    $stmt->execute([$m['mod_id'], $m['course_id'], $m['title'], $m['order']]);

    foreach ($m['chapters'] as $ch) {
        $cStmt = $pdo->prepare('INSERT INTO chapters (id, module_id, title, order_index) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title)');
        $cStmt->execute([$ch['chap_id'], $m['mod_id'], $ch['title'], $ch['order']]);

        foreach ($ch['lessons'] as $les) {
            $lStmt = $pdo->prepare('INSERT INTO lessons (id, chapter_id, title, duration, type, video_url, description, code_snippet, preview_available, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), video_url = VALUES(video_url), description = VALUES(description)');
            $lStmt->execute([
                $les['id'], $ch['chap_id'], $les['title'], $les['duration'], $les['type'] === 'code' ? 'reading' : $les['type'],
                $les['video_url'], $les['content'], $les['code_snippet'], $les['is_free'], $les['order']
            ]);
        }
    }
}
echo "✅ Curriculum seeded successfully!\n";

// ── 2. SEED REAL QUIZZES ─────────────────────────────────────────────────────
echo "Seeding quizzes & questions...\n";
$quizzes = [
    [
        'id' => 'quiz-c3-1',
        'course_id' => 'course-3',
        'title' => 'React 19 & Next.js Architecture Certification Assessment',
        'duration' => 25,
        'pass' => 80,
        'questions' => [
            [
                'id' => 'q-c3-1',
                'question' => 'What is the primary architectural purpose of Server Actions in React 19 / Next.js 15?',
                'options' => [
                    'To run client-side DOM animations',
                    'To execute server-side asynchronous functions directly from forms or events with automated RPC wire protocol',
                    'To replace CSS stylesheets with server JavaScript',
                    'To store browser cookies in LocalStorage'
                ],
                'correct' => 1,
                'explanation' => 'Server Actions allow developers to call server-side async logic directly from client or server components without manually crafting separate API endpoint boilerplate.'
            ],
            [
                'id' => 'q-c3-2',
                'question' => 'How does the useOptimistic hook handle mutation failures?',
                'options' => [
                    'It crashes the page with a fatal error',
                    'It automatically rolls back the optimistic client state to the baseline state once the async action promise rejects',
                    'It permanently retains the optimistic state',
                    'It refreshes the browser window'
                ],
                'correct' => 1,
                'explanation' => 'When a server action fails or throws an exception, useOptimistic immediately discards the optimistic delta and reverts to the verified server state.'
            ],
            [
                'id' => 'q-c3-3',
                'question' => 'Which React 19 feature eliminates the need for manual useMemo and useCallback hooks?',
                'options' => [
                    'React Compiler (Forget)',
                    'Redux Toolkit',
                    'Web Workers API',
                    'Babel Preset React'
                ],
                'correct' => 0,
                'explanation' => 'The React Compiler analyzes plain JavaScript semantics and automatically memoizes values and component trees at compile time.'
            ]
        ]
    ],
    [
        'id' => 'quiz-c1-1',
        'course_id' => 'course-1',
        'title' => 'Deep Learning & Transformer Systems Mastery Test',
        'duration' => 30,
        'pass' => 75,
        'questions' => [
            [
                'id' => 'q-c1-1',
                'question' => 'In distributed deep learning, what is the primary distinction between Data Parallelism and Tensor Parallelism?',
                'options' => [
                    'Data parallelism splits batch dimension across GPUs; Tensor parallelism splits individual weight matrices across GPUs',
                    'Data parallelism is for audio only; Tensor parallelism is for video',
                    'Data parallelism requires no networking between nodes',
                    'They are identical concepts with different names'
                ],
                'correct' => 0,
                'explanation' => 'Data parallelism distributes training samples across devices, whereas tensor parallelism divides intra-layer matrix multiplications across multiple GPUs when a model exceeds single-GPU VRAM.'
            ]
        ]
    ]
];

foreach ($quizzes as $qz) {
    $qStmt = $pdo->prepare('INSERT INTO quizzes (id, course_id, title, duration_minutes, passing_score) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), duration_minutes = VALUES(duration_minutes)');
    $qStmt->execute([$qz['id'], $qz['course_id'], $qz['title'], $qz['duration'], $qz['pass']]);

    $i = 0;
    foreach ($qz['questions'] as $qq) {
        $qqStmt = $pdo->prepare('INSERT INTO quiz_questions (id, quiz_id, question, options_json, correct_option_index, explanation, order_index) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE question = VALUES(question), options_json = VALUES(options_json)');
        $qqStmt->execute([
            $qq['id'], $qz['id'], $qq['question'], json_encode($qq['options']),
            $qq['correct'], $qq['explanation'], $i++
        ]);
    }
}
echo "✅ Quizzes seeded!\n";

// ── 3. SEED REAL ASSIGNMENTS ─────────────────────────────────────────────────
echo "Seeding assignments...\n";
$assignments = [
    [
        'id' => 'assign-c3-1',
        'course_id' => 'course-3',
        'title' => 'Production Full-Stack SaaS Architecture with Next.js 15',
        'description' => 'Architect and deploy an enterprise SaaS platform featuring role-based authentication, optimistic workspace collaboration, Stripe webhooks, and rate-limited API endpoints.',
        'deadline' => 'October 15, 2026',
        'difficulty' => 'Advanced'
    ],
    [
        'id' => 'assign-c1-1',
        'course_id' => 'course-1',
        'title' => 'Distributed Fine-Tuning Pipeline with PyTorch FSDP',
        'description' => 'Build a multi-GPU training script implementing Fully Sharded Data Parallel (FSDP) and LoRA adapter weights for a 7B parameter foundation model.',
        'deadline' => 'October 28, 2026',
        'difficulty' => 'Advanced'
    ],
    [
        'id' => 'assign-c2-1',
        'course_id' => 'course-2',
        'title' => 'Kubernetes Operator for Distributed Redis Cluster in Go',
        'description' => 'Develop a production Kubernetes Operator using the Kubebuilder framework to automate failover, slot rebalancing, and backup routines.',
        'deadline' => 'November 05, 2026',
        'difficulty' => 'Intermediate'
    ]
];

foreach ($assignments as $a) {
    $aStmt = $pdo->prepare('INSERT INTO assignments (id, course_id, title, description, deadline, difficulty) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description)');
    $aStmt->execute([$a['id'], $a['course_id'], $a['title'], $a['description'], $a['deadline'], $a['difficulty']]);
}
echo "✅ Assignments seeded!\n";

// ── 4. SEED REAL CERTIFICATES ────────────────────────────────────────────────
echo "Seeding certificates...\n";
$certs = [
    [
        'id' => 'cert-c3-demo',
        'course_id' => 'course-3',
        'user_id' => 'user-demo',
        'credential_id' => 'YASWANT-2026-FE-8942',
        'grade' => 'A+',
        'issue_date' => '2026-09-15',
        'thumbnail_url' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
        'verification_code' => 'VRF-9824-7812-YASWANT'
    ],
    [
        'id' => 'cert-c1-demo',
        'course_id' => 'course-1',
        'user_id' => 'user-demo',
        'credential_id' => 'YASWANT-2026-AI-4421',
        'grade' => 'A',
        'issue_date' => '2026-08-20',
        'thumbnail_url' => 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
        'verification_code' => 'VRF-4421-1029-YASWANT'
    ]
];

foreach ($certs as $c) {
    $cStmt = $pdo->prepare('INSERT INTO certificates (id, course_id, user_id, credential_id, grade, issue_date, thumbnail_url, verification_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE credential_id = VALUES(credential_id)');
    $cStmt->execute([$c['id'], $c['course_id'], $c['user_id'], $c['credential_id'], $c['grade'], $c['issue_date'], $c['thumbnail_url'], $c['verification_code']]);
}
echo "✅ Certificates seeded!\n";

// ── 5. SEED REAL NOTIFICATIONS ───────────────────────────────────────────────
echo "Seeding notifications...\n";
$notifs = [
    [
        'id' => 'notif-1',
        'user_id' => 'user-demo',
        'title' => 'Certificate Issued: React 19 & Next.js Architecture',
        'message' => 'Congratulations Alex! Your verified credential YASWANT-2026-FE-8942 is now ready for LinkedIn export.',
        'type' => 'certificate',
        'link' => '#certificates'
    ],
    [
        'id' => 'notif-2',
        'user_id' => 'user-demo',
        'title' => 'Assignment Graded: SaaS Architecture Project',
        'message' => 'Lead Instructor Sarah Chen evaluated your project submission and awarded an A+ with code review notes.',
        'type' => 'assignment',
        'link' => '#assignments'
    ],
    [
        'id' => 'notif-3',
        'user_id' => 'user-demo',
        'title' => 'New Discussion Reply in AI & ML',
        'message' => 'Dr. Elena Vance replied to your question regarding Tensor Parallelism vs Pipeline Parallelism.',
        'type' => 'community',
        'link' => '#community'
    ]
];

foreach ($notifs as $n) {
    $nStmt = $pdo->prepare('INSERT INTO notifications (id, user_id, title, message, type, link, is_read) VALUES (?, ?, ?, ?, ?, ?, 0) ON DUPLICATE KEY UPDATE title = VALUES(title)');
    $nStmt->execute([$n['id'], $n['user_id'], $n['title'], $n['message'], $n['type'], $n['link']]);
}
echo "✅ Notifications seeded!\n";

// Sync everything to u865909543_freefund as well
try {
    $syncSql = "
        INSERT IGNORE INTO u865909543_freefund.modules SELECT * FROM yaswant_code_lms.modules;
        INSERT IGNORE INTO u865909543_freefund.chapters SELECT * FROM yaswant_code_lms.chapters;
        INSERT IGNORE INTO u865909543_freefund.lessons SELECT * FROM yaswant_code_lms.lessons;
        INSERT IGNORE INTO u865909543_freefund.quizzes SELECT * FROM yaswant_code_lms.quizzes;
        INSERT IGNORE INTO u865909543_freefund.quiz_questions SELECT * FROM yaswant_code_lms.quiz_questions;
        INSERT IGNORE INTO u865909543_freefund.assignments SELECT * FROM yaswant_code_lms.assignments;
        INSERT IGNORE INTO u865909543_freefund.certificates SELECT * FROM yaswant_code_lms.certificates;
        INSERT IGNORE INTO u865909543_freefund.notifications SELECT * FROM yaswant_code_lms.notifications;
    ";
    $pdo->exec($syncSql);
    echo "✅ Dual-database sync completed successfully!\n";
} catch (Throwable $e) {
    echo "Dual-database sync notice: " . $e->getMessage() . "\n";
}

echo "All LMS real database data seeded successfully!\n";
