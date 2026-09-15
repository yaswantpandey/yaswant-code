import { Course, LearningPath, Instructor, Certificate, Assignment, Quiz, DiscussionThread, NotificationItem } from '../types/lms';

export const BRAND_CONFIG = {
  name: "Yaswant Code",
  shortName: "YaswantCode",
  tagline: "The Future of Technical Mastery & Engineering Education",
  founded: "2026",
};

export const MOCK_INSTRUCTORS: Instructor[] = [
  {
    id: "inst-1",
    name: "Dr. Elena Vance",
    role: "Staff AI Engineer & Former Research Fellow",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    bio: "Ex-Google DeepMind researcher specializing in scalable distributed transformer architectures, RLHF, and production LLM evaluation.",
    rating: 4.96,
    reviewsCount: 3420,
    studentsCount: 48900,
    coursesCount: 4,
    expertise: ["Machine Learning", "PyTorch", "Distributed Systems", "CUDA"],
    socialLinks: {
      github: "https://github.com",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
    },
    achievements: [
      "Top Rated Instructor 2025",
      "Published 12 NeurIPS Papers",
      "Over 45,000+ certified graduates worldwide"
    ]
  },
  {
    id: "inst-2",
    name: "Marcus Thorne",
    role: "Principal Infrastructure Architect",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    bio: "14+ years building mission-critical distributed systems and Kubernetes infrastructure for Fortune 100 fintech and cloud hyper-scalers.",
    rating: 4.92,
    reviewsCount: 2890,
    studentsCount: 36500,
    coursesCount: 5,
    expertise: ["Kubernetes", "Go", "Distributed Consensus", "gRPC", "Observability"],
    socialLinks: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
    achievements: [
      "CNCF Ambassador",
      "Author of 'Reliable Microservices at Scale'",
      "Ex-Lead Architect at Stripe"
    ]
  },
  {
    id: "inst-3",
    name: "Sarah Chen",
    role: "Design Technologist & Lead Frontend Engineer",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    bio: "Pioneering the intersection of cutting-edge React 19 architecture, WebGL, high-velocity design systems, and accessible micro-interactions.",
    rating: 4.98,
    reviewsCount: 4120,
    studentsCount: 62100,
    coursesCount: 6,
    expertise: ["React 19", "TypeScript", "Tailwind CSS", "Motion", "Design Tokens"],
    socialLinks: {
      github: "https://github.com",
      twitter: "https://twitter.com",
      website: "https://sarahchen.dev"
    },
    achievements: [
      "React Core Contributor Community",
      "Keynote Speaker at RenderATL & ReactConf",
      "Creator of Nexus UI Toolkit"
    ]
  },
  {
    id: "inst-4",
    name: "Alex Rivera",
    role: "Chief Information Security Officer & Kernel Dev",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    bio: "Specializing in zero-trust architecture, Linux eBPF security monitoring, offensive red-teaming, and memory-safe systems engineering in Rust.",
    rating: 4.89,
    reviewsCount: 1980,
    studentsCount: 24300,
    coursesCount: 3,
    expertise: ["Rust", "eBPF", "Cybersecurity", "Kernel Internals", "Zero-Trust"],
    socialLinks: {
      github: "https://github.com",
      linkedin: "https://linkedin.com"
    },
    achievements: [
      "DEF CON Black Badge Holder",
      "Security Advisor to Cloud Native Platforms"
    ]
  }
];

export const MOCK_COURSES: Course[] = [
  {
    id: "course-1",
    title: "Next.js 15 & React 19: Full-Stack Architecture",
    tagline: "Build ultra-performant, edge-rendered web applications with React Server Components, Server Actions, and Optimistic UI.",
    description: "Master the next paradigm of web development. From foundational React 19 primitives, Server Actions, streaming SSR, to distributed caching, database indexing, and edge deployments. Built entirely around real enterprise production codebases.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
    instructor: MOCK_INSTRUCTORS[2],
    category: "Web Development",
    difficulty: "Intermediate",
    rating: 4.95,
    reviewsCount: 3410,
    studentsCount: 28400,
    durationHours: 32,
    lessonsCount: 64,
    price: 89,
    originalPrice: 149,
    discountPercentage: 40,
    isBestseller: true,
    isFeatured: true,
    language: "English (US)",
    lastUpdated: "September 2026",
    hasCertificate: true,
    enrolled: true,
    progressPercent: 68,
    currentLessonId: "lesson-1-3",
    whatYouWillLearn: [
      "Architect full-stack applications with React Server Components (RSC) and streaming HTML",
      "Design zero-waterfall data fetching patterns using React 19 use() and Suspense boundaries",
      "Implement optimistic mutations with useOptimistic and transactional server actions",
      "Deploy scalable edge functions with distributed session caching and security headers",
      "Build a complete multi-tenant SaaS application with Stripe billing and real-time websockets"
    ],
    requirements: [
      "Solid knowledge of JavaScript (ES2022+) and basic TypeScript",
      "Fundamental understanding of React component lifecycles and hooks",
      "Node.js 20+ installed on your local computer"
    ],
    skills: ["React 19", "Next.js 15", "TypeScript", "Tailwind CSS", "Server Actions", "PostgreSQL"],
    projectsCount: 4,
    modules: [
      {
        id: "mod-1",
        title: "Module 1: React 19 Primitives & RSC Mental Models",
        duration: "4h 25m",
        chapters: [
          {
            id: "chap-1-1",
            title: "Chapter 1: The Modern Rendering Spectrum",
            duration: "2h 10m",
            lessons: [
              {
                id: "lesson-1-1",
                title: "Introduction to React 19 and Server Components Architecture",
                duration: "18:45",
                type: "video",
                completed: true,
                locked: false,
                previewAvailable: true,
                description: "Deep dive into why RSC changes mental models, separating server data serialization from client interactive boundaries.",
                codeSnippet: `// Server Component: direct async database query\nexport default async function ProjectList({ teamId }: { teamId: string }) {\n  const projects = await db.query.projects.findMany({\n    where: eq(projectsTable.teamId, teamId),\n  });\n\n  return (\n    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">\n      {projects.map((p) => (\n        <ProjectCard key={p.id} project={p} />\n      ))}\n    </div>\n  );\n}`,
                codeLanguage: "typescript",
                resources: [
                  { name: "RSC-Architecture-Diagram.pdf", size: "2.4 MB", url: "#" },
                  { name: "starter-repository.zip", size: "14.1 MB", url: "#" }
                ],
                transcript: [
                  { time: "00:00", text: "Welcome to Next.js 15 and React 19 architecture." },
                  { time: "01:25", text: "Today we are analyzing how Server Components serialize over the wire." },
                  { time: "04:30", text: "Notice how zero client bundles are shipped for database connector dependencies." }
                ]
              },
              {
                id: "lesson-1-2",
                title: "Hydration Boundaries, useActionState, & Form Actions",
                duration: "24:10",
                type: "video",
                completed: true,
                locked: false,
                previewAvailable: true,
                description: "Eliminating boilerplate state management with React 19 action states and progressive enhancement.",
                codeSnippet: `const [state, formAction, isPending] = useActionState(updateProfile, initialState);`,
                codeLanguage: "typescript"
              },
              {
                id: "lesson-1-3",
                title: "Optimistic UI Updates with useOptimistic",
                duration: "21:30",
                type: "video",
                completed: false,
                locked: false,
                previewAvailable: false,
                description: "Instantly update student UI states without waiting for network roundtrips, with rollback safety.",
                codeSnippet: `const [optimisticLikes, addOptimisticLike] = useOptimistic(\n  currentLikes,\n  (state, amount: number) => state + amount\n);`,
                codeLanguage: "typescript"
              },
              {
                id: "lesson-1-4",
                title: "Knowledge Check: React 19 Architecture Quiz",
                duration: "15:00",
                type: "quiz",
                completed: false,
                locked: false
              }
            ]
          },
          {
            id: "chap-1-2",
            title: "Chapter 2: Streaming SSR & Suspense Trees",
            duration: "2h 15m",
            lessons: [
              {
                id: "lesson-1-5",
                title: "Progressive Streaming with Suspense and loading.tsx",
                duration: "26:15",
                type: "video",
                completed: false,
                locked: false
              },
              {
                id: "lesson-1-6",
                title: "Assignment: Build an Optimistic Kanban Board",
                duration: "45:00",
                type: "assignment",
                completed: false,
                locked: false
              }
            ]
          }
        ]
      },
      {
        id: "mod-2",
        title: "Module 2: Advanced Caching & Edge Middleware",
        duration: "5h 40m",
        chapters: [
          {
            id: "chap-2-1",
            title: "Chapter 1: Granular Cache Control & Tag Invalidation",
            duration: "2h 50m",
            lessons: [
              {
                id: "lesson-2-1",
                title: "unstable_cache vs revalidateTag vs Dynamic IO",
                duration: "28:10",
                type: "video",
                completed: false,
                locked: true
              },
              {
                id: "lesson-2-2",
                title: "Edge Rate Limiting with Redis and Upstash",
                duration: "31:40",
                type: "video",
                completed: false,
                locked: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "course-2",
    title: "Large Language Models & PyTorch: Deep Engineering",
    tagline: "Build, pre-train, fine-tune, and quantize transformer architectures from scratch with PyTorch and Triton.",
    description: "Go beyond API wrappers. Implement multi-head attention, rotary position embeddings (RoPE), KV-cache optimization, flash-attention integration, and LoRA/QLoRA fine-tuning on custom enterprise datasets.",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
    instructor: MOCK_INSTRUCTORS[0],
    category: "AI & Machine Learning",
    difficulty: "Advanced",
    rating: 4.98,
    reviewsCount: 2950,
    studentsCount: 21800,
    durationHours: 46,
    lessonsCount: 82,
    price: 119,
    originalPrice: 199,
    discountPercentage: 40,
    isBestseller: true,
    isFeatured: true,
    language: "English (US)",
    lastUpdated: "August 2026",
    hasCertificate: true,
    enrolled: true,
    progressPercent: 42,
    currentLessonId: "lesson-2-2",
    whatYouWillLearn: [
      "Implement the transformer decoder architecture from mathematical foundations in pure PyTorch",
      "Understand FlashAttention-2 mechanics and custom GPU kernel optimization",
      "Fine-tune 7B and 70B parameter models using QLoRA and Unsloth pipelines",
      "Deploy high-throughput inference engines with vLLM, continuous batching, and speculative decoding",
      "Benchmark perplexity, hallucination rates, and evaluation metrics using LM-Eval Harness"
    ],
    requirements: [
      "Proficient in Python and linear algebra / calculus fundamentals",
      "Familiarity with neural network backpropagation and loss functions",
      "Google Colab or access to a GPU (T4/A10G/V100 recommended)"
    ],
    skills: ["PyTorch", "Transformers", "CUDA", "LLMs", "LoRA", "vLLM", "Python"],
    projectsCount: 5,
    modules: []
  },
  {
    id: "course-3",
    title: "Distributed Systems & Cloud-Native Go Architecture",
    tagline: "Design resilient microservices, Raft consensus engines, and event-driven pipelines handling 100k+ req/sec.",
    description: "Learn how modern cloud providers and hyper-growth startups design fault-tolerant systems. Covers gRPC, distributed tracing with OpenTelemetry, Kafka event streaming, consensus protocols, and graceful degradation.",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
    instructor: MOCK_INSTRUCTORS[1],
    category: "Cloud & DevOps",
    difficulty: "Advanced",
    rating: 4.93,
    reviewsCount: 2100,
    studentsCount: 19400,
    durationHours: 38,
    lessonsCount: 72,
    price: 99,
    originalPrice: 169,
    discountPercentage: 41,
    isBestseller: false,
    isFeatured: true,
    language: "English (US)",
    lastUpdated: "July 2026",
    hasCertificate: true,
    enrolled: false,
    progressPercent: 0,
    whatYouWillLearn: [
      "Write high-concurrency Go programs with channels, mutexes, and atomics",
      "Implement the Raft consensus algorithm for distributed leader election",
      "Build gRPC microservices with bi-directional streaming and protobuf v3",
      "Design transactional outbox patterns with Apache Kafka and PostgreSQL",
      "Deploy with Kubernetes Operators, Istio service mesh, and Prometheus alerting"
    ],
    requirements: [
      "Basic experience with Go or another C-family language (Java, C++, Rust)",
      "Understanding of TCP/IP, HTTP, and relational databases"
    ],
    skills: ["Go", "Distributed Systems", "Kubernetes", "gRPC", "Kafka", "Docker"],
    projectsCount: 3,
    modules: []
  },
  {
    id: "course-4",
    title: "Rust Systems Engineering: Memory Safety & eBPF",
    tagline: "Build lightning-fast CLI utilities, Linux network proxies, and kernel observability probes without memory leaks.",
    description: "Master Rust's ownership model, lifetimes, unsafe boundaries, and asynchronous runtimes like Tokio. Then step into the Linux kernel with eBPF to monitor sockets and packets in real time.",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    instructor: MOCK_INSTRUCTORS[3],
    category: "Systems & Security",
    difficulty: "Intermediate",
    rating: 4.88,
    reviewsCount: 1450,
    studentsCount: 14200,
    durationHours: 28,
    lessonsCount: 52,
    price: 79,
    originalPrice: 129,
    discountPercentage: 38,
    isBestseller: false,
    isFeatured: false,
    language: "English (US)",
    lastUpdated: "June 2026",
    hasCertificate: true,
    enrolled: false,
    progressPercent: 0,
    whatYouWillLearn: [
      "Master the Borrow Checker, Lifetimes, and Zero-Cost Abstractions",
      "Develop asynchronous network servers using Tokio and Tower",
      "Write Linux kernel packet filters with Aya and eBPF",
      "Avoid memory leaks and data races in concurrent multithreaded code"
    ],
    requirements: [
      "Experience in at least one systems or scripting language",
      "Linux terminal comfort"
    ],
    skills: ["Rust", "eBPF", "Linux", "Tokio", "Concurrency", "Systems"],
    projectsCount: 3,
    modules: []
  },
  {
    id: "course-5",
    title: "Design Systems & Micro-Interactions for Modern Web",
    tagline: "Create award-winning digital experiences, Figma design tokens, motion choreographies, and accessible component suites.",
    description: "Bridge the divide between high-end digital design and robust production engineering. Construct design tokens, CSS architectures, gesture animations, and keyboard-first accessibility.",
    thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
    instructor: MOCK_INSTRUCTORS[2],
    category: "Design & UX",
    difficulty: "All Levels",
    rating: 4.97,
    reviewsCount: 3800,
    studentsCount: 32000,
    durationHours: 24,
    lessonsCount: 48,
    price: 69,
    originalPrice: 119,
    discountPercentage: 42,
    isBestseller: true,
    isFeatured: false,
    language: "English (US)",
    lastUpdated: "September 2026",
    hasCertificate: true,
    enrolled: true,
    progressPercent: 100,
    whatYouWillLearn: [
      "Create scalable multi-brand design tokens syncing Figma with CSS Variables",
      "Engineer physics-based micro-interactions with Motion and Web Animations API",
      "Ensure WCAG 2.2 AAA compliance, focus traps, and screen reader announcements",
      "Package reusable React component libraries with semantic versioning"
    ],
    requirements: [
      "Basic HTML/CSS and React fundamentals"
    ],
    skills: ["Design Systems", "Figma", "Tailwind CSS", "Motion", "Accessibility", "TypeScript"],
    projectsCount: 4,
    modules: []
  },
  {
    id: "course-6",
    title: "Kubernetes & Multi-Cloud Infrastructure as Code",
    tagline: "Automate zero-downtime cluster rollouts, Terraform modules, Helm charts, and GitOps pipelines with ArgoCD.",
    description: "Production infrastructure from day one. Build high-availability Kubernetes clusters across AWS and GCP using Terraform, manage secrets with HashiCorp Vault, and run declarative CD pipelines with ArgoCD.",
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80",
    instructor: MOCK_INSTRUCTORS[1],
    category: "Cloud & DevOps",
    difficulty: "Intermediate",
    rating: 4.91,
    reviewsCount: 1820,
    studentsCount: 16800,
    durationHours: 35,
    lessonsCount: 68,
    price: 89,
    originalPrice: 149,
    discountPercentage: 40,
    isBestseller: false,
    isFeatured: false,
    language: "English (US)",
    lastUpdated: "August 2026",
    hasCertificate: true,
    enrolled: false,
    progressPercent: 0,
    whatYouWillLearn: [
      "Provision multi-region infrastructure using Terraform and Terragrunt",
      "Deploy and manage stateful workloads on Kubernetes with CSI drivers",
      "Implement automated GitOps releases using ArgoCD and Sealed Secrets",
      "Configure ingress controllers, cert-manager, and Cloudflare DNS automation"
    ],
    requirements: [
      "Familiarity with command line and cloud concepts"
    ],
    skills: ["Kubernetes", "Terraform", "Docker", "ArgoCD", "AWS", "GitOps"],
    projectsCount: 4,
    modules: []
  }
];

export const MOCK_LEARNING_PATHS: LearningPath[] = [
  {
    id: "path-1",
    title: "Full-Stack Web Architect",
    description: "A comprehensive trajectory taking engineers from front-end component fundamentals to resilient distributed systems, edge rendering, and cloud deployment.",
    iconName: "Layers",
    difficulty: "Intermediate",
    estimatedDuration: "6 Months • 12 hrs/week",
    coursesCount: 5,
    skillsCovered: ["React 19", "Next.js 15", "TypeScript", "PostgreSQL", "Tailwind CSS", "Redis", "Docker"],
    progressPercent: 54,
    isRecommended: true,
    careerRoles: ["Senior Frontend Engineer", "Full-Stack Architect", "Founding Engineer"],
    milestones: [
      {
        title: "Phase 1: Modern Component Foundations & Type Safety",
        level: "Beginner",
        courses: ["TypeScript Strict Typing", "Modern React 19 Patterns"],
        description: "Develop bulletproof component architectures and master immutable data flows."
      },
      {
        title: "Phase 2: Full-Stack Edge Frameworks & Databases",
        level: "Intermediate",
        courses: ["Next.js 15 Deep Architecture", "Relational Modeling with Drizzle ORM"],
        description: "Server Actions, streaming SSR, schema migrations, and optimistic UI mutations."
      },
      {
        title: "Phase 3: High-Concurrency Backend Services",
        level: "Advanced",
        courses: ["Distributed Systems in Go", "Caching Strategies with Redis"],
        description: "Microservice boundaries, background job workers, and rate limiting."
      },
      {
        title: "Phase 4: Capstone Production SaaS Platform",
        level: "Capstone",
        courses: ["Enterprise SaaS Architecture Capstone"],
        description: "Ship a production-grade multi-tenant collaborative application."
      },
      {
        title: "Phase 5: Industry Certification",
        level: "Certification",
        courses: ["Apex Certified Full-Stack Architect Exam"],
        description: "Verified digital credential shareable directly to LinkedIn and portfolio."
      }
    ]
  },
  {
    id: "path-2",
    title: "AI & Large Language Model Engineer",
    description: "Go beyond prompting. Master transformer architecture, PyTorch deep learning, GPU optimization, LoRA fine-tuning, and production inference servers.",
    iconName: "BrainCircuit",
    difficulty: "Advanced",
    estimatedDuration: "8 Months • 14 hrs/week",
    coursesCount: 6,
    skillsCovered: ["Python", "PyTorch", "Transformers", "CUDA", "vLLM", "LangChain", "Vector DBs"],
    progressPercent: 28,
    isRecommended: true,
    careerRoles: ["AI Systems Engineer", "Machine Learning Researcher", "GenAI Lead"],
    milestones: [
      {
        title: "Phase 1: Deep Learning Math & PyTorch Primitives",
        level: "Beginner",
        courses: ["Tensor Operations & Autograd in PyTorch"],
        description: "Understand gradients, forward/backward passes, and custom loss layers."
      },
      {
        title: "Phase 2: Transformer Architectures from Scratch",
        level: "Intermediate",
        courses: ["Large Language Models & PyTorch: Deep Engineering"],
        description: "Code multi-head self-attention, rotary embeddings, and tokenizer tokenizers."
      },
      {
        title: "Phase 3: Parameter Efficient Fine-Tuning (PEFT)",
        level: "Advanced",
        courses: ["QLoRA, DPO & RLHF Alignment Pipelines"],
        description: "Adapt models with minimal compute budgets and custom reward modeling."
      },
      {
        title: "Phase 4: Capstone Autonomous Agent & RAG System",
        level: "Capstone",
        courses: ["Production Multimodal Agent Capstone"],
        description: "Build an end-to-end grounded agent with continuous evaluation telemetry."
      }
    ]
  },
  {
    id: "path-3",
    title: "Cloud Native DevOps & SRE",
    description: "Master multi-cloud orchestration, declarative GitOps workflows, Kubernetes cluster administration, and zero-downtime continuous deployment.",
    iconName: "CloudCog",
    difficulty: "Intermediate",
    estimatedDuration: "5 Months • 10 hrs/week",
    coursesCount: 4,
    skillsCovered: ["Kubernetes", "Terraform", "AWS", "ArgoCD", "Prometheus", "Linux", "Docker"],
    progressPercent: 15,
    isRecommended: false,
    careerRoles: ["Site Reliability Engineer", "Platform Engineer", "DevOps Specialist"],
    milestones: [
      {
        title: "Phase 1: Linux Internals & Containerization",
        level: "Beginner",
        courses: ["Docker Containerization & Linux Systems"],
        description: "Master namespaces, cgroups, and multi-stage container builds."
      },
      {
        title: "Phase 2: Infrastructure as Code with Terraform",
        level: "Intermediate",
        courses: ["Terraform Enterprise Multi-Cloud Modules"],
        description: "Declarative infrastructure provisioning with state locking and secrets."
      },
      {
        title: "Phase 3: Production Kubernetes Orchestration",
        level: "Advanced",
        courses: ["Kubernetes Multi-Cloud & GitOps with ArgoCD"],
        description: "Manage complex stateful applications, ingress controllers, and auto-scalers."
      }
    ]
  }
];

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: "cert-001",
    courseId: "course-5",
    courseTitle: "Design Systems & Micro-Interactions for Modern Web",
    studentName: "Alex Mercer",
    instructorName: "Sarah Chen",
    issueDate: "September 02, 2026",
    credentialId: "APX-2026-DS-98421",
    skillsAcquired: ["Design Tokens", "Figma", "Tailwind CSS", "Motion", "Accessibility"],
    grade: "Grade: Distinction (98%)",
    verificationUrl: "https://verify.apexlearn.io/cert/APX-2026-DS-98421",
    thumbnailUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "cert-002",
    courseId: "course-web-foundations",
    courseTitle: "TypeScript Enterprise Design Patterns & Generics",
    studentName: "Alex Mercer",
    instructorName: "Marcus Thorne",
    issueDate: "July 14, 2026",
    credentialId: "APX-2026-TS-61045",
    skillsAcquired: ["TypeScript", "Generics", "Conditional Types", "AST Transformation"],
    grade: "Grade: Pass with Honors (94%)",
    verificationUrl: "https://verify.apexlearn.io/cert/APX-2026-TS-61045",
    thumbnailUrl: "https://images.unsplash.com/photo-1516116211227-bbc13c6b2452?w=600&auto=format&fit=crop&q=80"
  }
];

export const MOCK_QUIZ: Quiz = {
  id: "quiz-next15",
  courseId: "course-1",
  lessonId: "lesson-1-4",
  title: "React 19 & Next.js 15 Core Principles Assessment",
  durationMinutes: 10,
  passingScore: 80,
  questions: [
    {
      id: "q1",
      question: "Which statement accurately describes the client-server serialization model in React Server Components?",
      options: [
        "Server Components re-execute in the browser after initial SSR rendering.",
        "Server Components only output a compact JSON-like stream of JSX and serializable props, shipping 0kB JS bundle for their internal logic.",
        "Server Components require hydration code for every DOM node they render.",
        "Server Components cannot fetch data asynchronously during rendering."
      ],
      correctOptionIndex: 1,
      explanation: "Server Components execute exclusively on the server and stream an optimized protocol representation (RSC payload) to the client, omitting all backend-only dependencies from the client JavaScript bundle."
    },
    {
      id: "q2",
      question: "What is the primary benefit of the React 19 `useOptimistic` hook?",
      options: [
        "It automatically compresses network requests using gzip.",
        "It allows immediate UI feedback during async actions while safely rolling back if the action fails.",
        "It caches database queries directly in the client memory indefinitely.",
        "It replaces the need for React Server Actions entirely."
      ],
      correctOptionIndex: 1,
      explanation: "`useOptimistic` lets you present the user with the expected result of an async mutation instantaneously, and handles transparent rollback if an error occurs."
    },
    {
      id: "q3",
      question: "When invoking a Server Action via a `<form action={...}>`, how does React 19 enhance standard HTML form behavior?",
      options: [
        "Forms work even before JavaScript has finished loading (progressive enhancement).",
        "It converts every input element into a binary buffer automatically.",
        "It bypasses CORS completely.",
        "It encrypts the entire page with AES-256."
      ],
      correctOptionIndex: 0,
      explanation: "By binding directly to standard HTML form submission semantics, Server Actions support progressive enhancement before full client-side hydration."
    },
    {
      id: "q4",
      question: "In Next.js 15, what is the default caching behavior for standard `fetch()` requests without explicit cache flags?",
      options: [
        "`force-cache` forever",
        "`no-store` (uncached by default for dynamic flexibility)",
        "Cached for exactly 60 seconds",
        "Stored in IndexedDB on the user device"
      ],
      correctOptionIndex: 1,
      explanation: "Next.js 15 adjusted default fetch behavior to `no-store` to avoid unexpected stale cache states, prioritizing fresh data by default unless explicitly configured."
    }
  ]
};

export const MOCK_ASSIGNMENT: Assignment = {
  id: "assign-1",
  courseId: "course-1",
  title: "Build an Optimistic Multi-Column Kanban Board with Server Actions",
  description: "Construct a responsive Kanban workflow application featuring drag-and-drop task reordering, server-persisted mutations, and instant optimistic status updates with error rollback.",
  deadline: "September 28, 2026 • 23:59 UTC",
  difficulty: "Intermediate",
  status: "In Progress",
  submittedDate: undefined,
  grade: "Pending Review",
  instructions: [
    "Clone the project template repository or initiate a clean Next.js 15 repository with Tailwind CSS.",
    "Implement at least 3 column states: 'To Do', 'In Progress', and 'Completed'.",
    "Wire up `useOptimistic` to instantly update the task column position when dragged or clicked.",
    "Execute a simulated 800ms Server Action to persist the updated status.",
    "Introduce an artificial 10% failure switch to demonstrate safe optimistic rollback."
  ],
  requirements: [
    "Must use React 19 `useOptimistic` and `useActionState`.",
    "Must render cleanly on desktop and mobile viewports.",
    "Must include GitHub repository URL and live deployed link."
  ],
  githubUrl: "https://github.com/alex-mercer/next15-optimistic-kanban",
  feedback: "Your previous submission showed exceptional type safety. Ensure you handle the rollback state cleanly with a subtle toast notification."
};

export const MOCK_DISCUSSIONS: DiscussionThread[] = [
  {
    id: "disc-1",
    courseId: "course-1",
    courseName: "Next.js 15 & React 19: Full-Stack Architecture",
    author: {
      name: "Marcus Aurelius",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      role: "Senior Student"
    },
    title: "Best practice for handling optimistic rollback with nested arrays in useOptimistic?",
    content: "When updating a nested Kanban board where each column contains an array of cards, what is the cleanest immutable pattern for useOptimistic? Has anyone benchmarked Immer inside optimistic reducers?",
    tags: ["React 19", "useOptimistic", "State Management", "Performance"],
    category: "Frontend",
    upvotes: 42,
    repliesCount: 6,
    hasAcceptedAnswer: true,
    createdAt: "2 hours ago",
    answers: [
      {
        id: "ans-1",
        author: {
          name: "Sarah Chen",
          avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
          role: "Instructor"
        },
        content: "Great question! Standard structural sharing with `map` and object spreads performs significantly faster than Immer inside high-frequency optimistic loops. Here is the recommended snippet:\n\n```typescript\nconst [optimisticColumns, updateColumn] = useOptimistic(columns, (prev, update) => {\n  return prev.map(col => col.id === update.colId ? { ...col, cards: updateCards(col.cards, update) } : col);\n});\n```",
        createdAt: "1 hour ago",
        isAccepted: true,
        upvotes: 38
      }
    ]
  },
  {
    id: "disc-2",
    courseId: "course-2",
    courseName: "Large Language Models & PyTorch",
    author: {
      name: "Devon Miles",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80",
      role: "AI Researcher"
    },
    title: "Understanding Rotary Position Embeddings (RoPE) vs ALiBi in long-context models",
    content: "In Module 2, we implement RoPE using complex numbers. How does context window extrapolation behave beyond 32k tokens without YaRN scaling?",
    tags: ["PyTorch", "RoPE", "Transformers", "Math"],
    category: "AI & ML",
    upvotes: 31,
    repliesCount: 4,
    hasAcceptedAnswer: false,
    createdAt: "5 hours ago",
    answers: []
  },
  {
    id: "disc-3",
    title: "Transitioning from Mid-level to Staff Infrastructure Engineer",
    content: "What architectural systems knowledge moved the needle most in your career? Distributed consensus, kernel tracing, or cross-functional system design?",
    tags: ["Career", "Architecture", "Distributed Systems"],
    category: "Career",
    author: {
      name: "Liam O'Connor",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=80",
      role: "Lead Learner"
    },
    upvotes: 89,
    repliesCount: 14,
    hasAcceptedAnswer: false,
    createdAt: "1 day ago",
    answers: []
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New Module Available",
    message: "Module 3: Distributed State & WebSockets is now unlocked in Next.js 15 Mastery.",
    timeAgo: "15m ago",
    type: "course",
    read: false
  },
  {
    id: "notif-2",
    title: "Assignment Feedback Posted",
    message: "Sarah Chen left 3 comments on your 'Optimistic Kanban Board' submission.",
    timeAgo: "2h ago",
    type: "assignment",
    read: false
  },
  {
    id: "notif-3",
    title: "Quiz Passed with Distinction!",
    message: "You scored 100% on React 19 Core Principles Assessment. Badge unlocked.",
    timeAgo: "1d ago",
    type: "quiz",
    read: true
  },
  {
    id: "notif-4",
    title: "Certificate Issued & Verified",
    message: "Your credential for Design Systems Engineering is ready for LinkedIn export.",
    timeAgo: "3d ago",
    type: "certificate",
    read: true
  },
  {
    id: "notif-5",
    title: "Community Upvote Milestone",
    message: "Your answer in 'Best practice for optimistic rollback' received 25+ upvotes.",
    timeAgo: "4d ago",
    type: "community",
    read: true
  }
];

export const MOCK_STUDENT_STATS = {
  hoursLearned: 142.5,
  coursesEnrolled: 4,
  coursesCompleted: 2,
  currentStreakDays: 19,
  skillsAcquired: 28,
  certificatesEarned: 2,
  assignmentsSubmitted: 14,
  averageQuizScore: 94.2,
  weeklyLearningHours: [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 3.8 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 4.2 },
    { day: "Fri", hours: 3.0 },
    { day: "Sat", hours: 5.5 },
    { day: "Sun", hours: 4.0 }
  ]
};

export const MOCK_INSTRUCTOR_STATS = {
  totalStudents: 124500,
  activeStudents: 38200,
  courseCompletionRate: 78.4,
  averageRating: 4.94,
  monthlyRevenue: 28450,
  totalRevenue: 342900,
  engagementRate: 88.6,
  pendingAssignments: 8,
  monthlyEarnings: [
    { month: "Apr", amount: 21400 },
    { month: "May", amount: 23800 },
    { month: "Jun", amount: 25100 },
    { month: "Jul", amount: 27300 },
    { month: "Aug", amount: 26900 },
    { month: "Sep", amount: 28450 }
  ]
};

export const MOCK_ADMIN_STATS = {
  totalUsers: 248900,
  activeStudents: 68400,
  totalInstructors: 420,
  publishedCourses: 310,
  courseEnrollments: 842100,
  grossPlatformRevenue: 1485000,
  averageCompletionRate: 76.2,
  recentSignups: [
    { id: "u-1", name: "David K.", email: "david.k@meta.com", role: "Student", date: "5 mins ago", status: "Active" },
    { id: "u-2", name: "Dr. Rachel Bloom", email: "rbloom@stanford.edu", role: "Instructor", date: "22 mins ago", status: "Verified" },
    { id: "u-3", name: "Kenji Sato", email: "kenji@tokyo-tech.jp", role: "Student", date: "1 hour ago", status: "Active" },
    { id: "u-4", name: "Amara Okonkwo", email: "amara.o@fintech.ng", role: "Student", date: "2 hours ago", status: "Active" },
    { id: "u-5", name: "Sofia Morales", email: "sofia@designcraft.es", role: "Instructor", date: "4 hours ago", status: "Pending Review" }
  ]
};
