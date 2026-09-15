import { ResourceItem } from '../types/lms';

export const MOCK_RESOURCES: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'Distributed Systems & Microservices Architecture Cheat Sheet',
    description: 'Comprehensive visual reference covering CAP theorem, PACELC, Raft vs Paxos, circuit breakers, saga pattern, and idempotent webhook handlers.',
    category: 'Cheat Sheets',
    format: 'PDF',
    fileSize: '4.2 MB',
    iconName: 'Layers',
    badge: 'Most Popular',
    tags: ['Microservices', 'Distributed Systems', 'CAP Theorem', 'Saga Pattern'],
    downloadsCount: 14280,
    updatedAt: 'Sep 2026',
    contentSnippet: `
# Distributed Systems Cheat Sheet
- CAP Theorem: Consistency, Availability, Partition Tolerance (choose 2).
- PACELC: If Partition (P) -> Availability (A) vs Consistency (C); Else (E) -> Latency (L) vs Consistency (C).
- Raft Invariants: Leader election, log matching, election safety.
- Two-Phase Commit (2PC): Prepare phase, Commit phase.
- Saga Pattern: Choreography vs Orchestration with compensating transactions.
    `
  },
  {
    id: 'res-2',
    title: 'System Design Interview Master Blueprint (2026 Edition)',
    description: 'Battle-tested step-by-step framework to decompose any large-scale system design question in 45 minutes: scale estimates, API contracts, DB schema, and bottlenecks.',
    category: 'Architecture Blueprints',
    format: 'Markdown',
    fileSize: '1.8 MB',
    iconName: 'Server',
    badge: 'Staff Engineer Pick',
    tags: ['System Design', 'Scalability', 'Interviews', 'Load Balancers'],
    downloadsCount: 28900,
    updatedAt: 'Aug 2026',
    contentSnippet: `
# System Design 45-Minute Framework
1. Requirements Clarification (5 mins): Functional vs Non-functional (99.99% availability, 100ms p99 latency).
2. Capacity & Scale Estimations (5 mins): QPS, Storage per year, Bandwidth.
3. High-Level API Design (5 mins): REST/gRPC endpoints with request/response payloads.
4. Data Modeling & Storage Engine (10 mins): RDBMS vs NoSQL vs Object Store.
5. Deep Dive & Edge Cases (15 mins): Caching (Redis/Memcached), Sharding, Dead-letter queues.
    `
  },
  {
    id: 'res-3',
    title: 'Full-Stack Software Engineer Career Roadmap 2026',
    description: 'Interactive visual progression roadmap from foundational algorithms and modern TypeScript/React 19 to distributed cloud infrastructure and Kubernetes.',
    category: 'Roadmaps',
    format: 'Interactive',
    iconName: 'Compass',
    tags: ['Career', 'Full-Stack', 'Frontend', 'Backend', 'DevOps'],
    downloadsCount: 39400,
    updatedAt: 'Sep 2026',
    contentSnippet: `
# Full-Stack Engineering Roadmap
Phase 1: Deep JavaScript/TypeScript, Memory Management, Event Loop.
Phase 2: Modern Frontend: React 19, RSC, Tailwind, Web Performance (Core Web Vitals).
Phase 3: Robust Backend: Go / Node.js / Python, Relational SQL, Query Profiling.
Phase 4: Cloud & Deployment: Docker, Kubernetes, CI/CD, Observability (Prometheus/Grafana).
Phase 5: Distributed Architectures: Event Streaming (Kafka/RabbitMQ), Caching, Fault-Tolerance.
    `
  },
  {
    id: 'res-4',
    title: 'Production-Ready React 19 + TypeScript + Vite Starter Boilerplate',
    description: 'Clean enterprise repository template featuring strict TypeScript, Tailwind CSS, Lucide icons, Dark/Light mode, and Vitest preconfigured.',
    category: 'Starter Kits',
    format: 'GitHub',
    copyableCommand: 'npx degit yaswantcode/enterprise-react19-starter my-app',
    iconName: 'Code',
    badge: 'Open Source',
    tags: ['React 19', 'TypeScript', 'Vite', 'Tailwind', 'Starter'],
    downloadsCount: 19800,
    updatedAt: 'Sep 2026',
  },
  {
    id: 'res-5',
    title: 'Docker & Kubernetes High-Performance CLI Reference Guide',
    description: 'Essential commands, debugging techniques, multi-stage Dockerfiles, cgroup resource limits, and kubectl kubectl debug/port-forwarding tricks.',
    category: 'Cheat Sheets',
    format: 'PDF',
    fileSize: '3.1 MB',
    iconName: 'Terminal',
    tags: ['Docker', 'Kubernetes', 'CLI', 'DevOps', 'Containers'],
    downloadsCount: 17500,
    updatedAt: 'Aug 2026',
    contentSnippet: `
# Kubernetes Essential Commands
- kubectl get pods -o wide --watch
- kubectl top nodes / kubectl top pods
- kubectl describe pod <pod_name>
- kubectl logs -f -l app=backend --tail=100
- kubectl exec -it <pod_name> -- /bin/sh
- kubectl port-forward svc/my-service 8080:80
    `
  },
  {
    id: 'res-6',
    title: 'Web Security & OWASP Top 10 Hardening Checklist',
    description: 'Actionable 45-point verification checklist for production web apps: CSRF, XSS, CSP headers, rate-limiting, secure cookies, and input sanitization.',
    category: 'Checklists',
    format: 'Markdown',
    fileSize: '850 KB',
    iconName: 'ShieldCheck',
    badge: 'Security Essential',
    tags: ['Security', 'OWASP', 'XSS', 'CSRF', 'CSP'],
    downloadsCount: 12400,
    updatedAt: 'Sep 2026',
    contentSnippet: `
# OWASP Production Hardening Checklist
- [ ] Content-Security-Policy (CSP) configured without unsafe-inline or unsafe-eval.
- [ ] Strict-Transport-Security (HSTS) with max-age=63072000; includeSubDomains; preload.
- [ ] Cookies marked with Secure, HttpOnly, and SameSite=Lax/Strict.
- [ ] Rate limiting on authentication and sensitive state-changing endpoints.
- [ ] Parameterized SQL queries preventing SQL Injection.
- [ ] Secrets never exposed in client bundles or public repositories.
    `
  },
  {
    id: 'res-7',
    title: 'PostgreSQL Query Optimization & Indexing Guide',
    description: 'Deep dive into EXPLAIN ANALYZE interpretation, sequential scans vs index scans, parallel workers, vacuuming, and connection pool sizing.',
    category: 'Cheat Sheets',
    format: 'PDF',
    fileSize: '2.9 MB',
    iconName: 'Database',
    tags: ['PostgreSQL', 'SQL', 'Indexes', 'Performance', 'Backend'],
    downloadsCount: 15300,
    updatedAt: 'Aug 2026',
    contentSnippet: `
# PostgreSQL Optimization Reference
- EXPLAIN (ANALYZE, BUFFERS) SELECT ...
- High Buffer Shared Hit ratio (>99%) indicates good memory utilization.
- Sequential Scans indicate missing index or high table selectivity.
- Work Mem setting directly impacts hash join / merge sort speed.
    `
  },
  {
    id: 'res-8',
    title: 'Microservices Clean Architecture in Go Starter Repository',
    description: 'Domain-Driven Design (DDD) template in Go featuring gRPC, HTTP gateway, PostgreSQL connection pooling, and structured zap logging.',
    category: 'Starter Kits',
    format: 'GitHub',
    copyableCommand: 'git clone https://github.com/yaswantcode/go-clean-microservice.git',
    iconName: 'Cpu',
    tags: ['Go', 'gRPC', 'Clean Architecture', 'DDD', 'Microservices'],
    downloadsCount: 8900,
    updatedAt: 'Jul 2026',
  }
];
