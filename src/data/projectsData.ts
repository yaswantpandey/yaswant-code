import { ProjectItem } from '../types/lms';

export const MOCK_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'Full-Stack Distributed Kanban Studio',
    tagline: 'Production-ready kanban engine with React 19 Server Actions, Optimistic Rollbacks, and Multi-tenant PostgreSQL.',
    description: 'Build a multi-user collaborative board with real-time optimistic task reordering, server actions, optimistic UI rollbacks, and webhook event streaming. Designed for enterprise SLAs and zero UI flicker.',
    category: 'Full-Stack',
    difficulty: 'Intermediate',
    estimatedHours: 24,
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80',
    techStack: ['React 19', 'Next.js 15', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Drizzle ORM'],
    courseRelation: 'Next.js 15 & React 19: Full-Stack Architecture',
    starterRepoCommand: 'npx degit yaswantcode/capstone-react19-kanban kanban-studio',
    liveDemoUrl: 'https://kanban-production-demo.vercel.app',
    status: 'In Progress',
    submissionsCount: 1420,
    featured: true,
    milestones: [
      {
        id: 'm1',
        title: 'Schema & Database Migrations',
        description: 'Design normalized tables for organizations, boards, columns, cards, and audit logs using Drizzle ORM.',
        completed: true,
      },
      {
        id: 'm2',
        title: 'Optimistic UI Drag-and-Drop',
        description: 'Integrate useOptimistic hook with pointer drag events and server action persistence.',
        completed: true,
      },
      {
        id: 'm3',
        title: 'Conflict Resolution & WebSocket Sync',
        description: 'Handle concurrent edits from multiple tabs with revision vectors and broadcast channels.',
        completed: false,
      },
      {
        id: 'm4',
        title: 'Edge Deployment & End-to-End Tests',
        description: 'Deploy to Cloud Run / Vercel Edge with Playwright testing suite.',
        completed: false,
      }
    ],
    deliverables: [
      'Clean GitHub repository with CI/CD GitHub Actions workflow',
      'Architecture diagram of optimistic state lifecycle',
      'Performance report verifying <100ms P99 mutation response'
    ],
    architectureDiagramSnippet: `[Client UI (useOptimistic)] 
       │ 
       ▼ (Fire Server Action)
[Next.js Server Worker] ──► [PostgreSQL Transaction]
       │
       ▼ (Push Event)
[Redis Pub/Sub Sync] ──► [Other Active Browser Clients]`
  },
  {
    id: 'proj-2',
    title: 'Raft Distributed Consensus Engine in Go',
    tagline: 'Fault-tolerant replicated state machine implementing leader election, log replication, and snapshots.',
    description: 'Implement the full Raft consensus algorithm from scratch in Go. Handle split-brain scenarios, randomized election timeouts, log compaction, RPC heartbeats, and cluster membership reconfiguration.',
    category: 'Distributed Systems',
    difficulty: 'Advanced',
    estimatedHours: 40,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    techStack: ['Go 1.23', 'gRPC', 'Protobuf', 'etcd/raft testsuite', 'Docker'],
    courseRelation: 'Distributed Systems & Microservices with Go',
    starterRepoCommand: 'git clone https://github.com/yaswantcode/raft-consensus-engine.git',
    liveDemoUrl: 'https://raft-visualizer.yaswantcode.io',
    status: 'Available',
    submissionsCount: 890,
    featured: true,
    milestones: [
      {
        id: 'm1',
        title: 'Leader Election & Heartbeat Loop',
        description: 'Build RPC protocol for RequestVote and AppendEntries with jittered timers.',
        completed: false,
      },
      {
        id: 'm2',
        title: 'Log Replication & Safety Invariants',
        description: 'Enforce matching term and index rules across majority quorum before commits.',
        completed: false,
      },
      {
        id: 'm3',
        title: 'Log Compaction & Snapshots',
        description: 'Truncate historical WAL into disk snapshots when log exceeds threshold.',
        completed: false,
      },
      {
        id: 'm4',
        title: 'Jepsen Chaos Testing Suite',
        description: 'Subject cluster to network partitions and packet drops while verifying linearizability.',
        completed: false,
      }
    ],
    deliverables: [
      'Go package passing all Jepsen linearizability test scenarios',
      'Benchmarking report under 5-node cluster load',
      'Interactive CLI for inspecting leader state'
    ],
    architectureDiagramSnippet: `Leader (Node 1) ── AppendEntries RPC ──► Follower (Node 2)
       │
       └────────── AppendEntries RPC ──► Follower (Node 3)
[Quorum Reached (2/3)] ──► Commit Index Applied to State Machine`
  },
  {
    id: 'proj-3',
    title: 'Autonomous Multi-Agent AI Workflow Engine',
    tagline: 'Production orchestrator with Gemini 2.5 Flash, dynamic tool calling, memory buffers, and human-in-the-loop validation.',
    description: 'Architect a multi-agent system where autonomous agents decompose complex user goals, delegate subtasks, invoke sandboxed Python execution tools, and synthesize grounded research outputs.',
    category: 'AI & ML',
    difficulty: 'Intermediate',
    estimatedHours: 20,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    techStack: ['Gemini 2.5 Flash', '@google/genai', 'TypeScript', 'Vector Embeddings', 'Node.js'],
    courseRelation: 'Production LLMs, RLHF & Agentic Workflows',
    starterRepoCommand: 'npx degit yaswantcode/gemini-agent-engine agent-orchestrator',
    liveDemoUrl: 'https://agent-demo.yaswantcode.io',
    status: 'Available',
    submissionsCount: 2150,
    featured: true,
    milestones: [
      {
        id: 'm1',
        title: 'Declarative Tool Definition & Validation',
        description: 'Define type-safe tool schemas with Zod and register them with Gemini client.',
        completed: false,
      },
      {
        id: 'm2',
        title: 'ReAct Agent Execution Loop',
        description: 'Implement Reasoning + Acting cycle with loop guards and error backoffs.',
        completed: false,
      },
      {
        id: 'm3',
        title: 'Episodic & Semantic Memory Buffer',
        description: 'Store conversation history and contextual embeddings for cross-session recall.',
        completed: false,
      },
      {
        id: 'm4',
        title: 'Human-in-the-Loop Approval Checkpoint',
        description: 'Pause execution on high-risk tool calls (e.g. database write, external email).',
        completed: false,
      }
    ],
    deliverables: [
      'Full TypeScript SDK with streaming tool-call status updates',
      'Interactive web playground testing agent reasoning graphs',
      'Unit test suite asserting grounded outputs and token safety'
    ],
    architectureDiagramSnippet: `User Goal ──► Planner Agent (Gemini 2.5) ──► Subtask Queue
                    │
                    ├──► Research Agent ──► Search Grounding Tool
                    └──► Coder Agent    ──► Python Sandboxed Runner`
  },
  {
    id: 'proj-4',
    title: 'LSM-Tree Key-Value Database Storage Engine',
    tagline: 'Write-optimized persistent key-value store built in Rust with WAL, MemTable, SSTables, and Bloom filters.',
    description: 'Construct the underlying storage engine modeled after RocksDB and LevelDB. Implement write-ahead logging (WAL), skip-list memtables, SSTable flushing with binary encoding, and background tiered compaction.',
    category: 'Systems & Rust',
    difficulty: 'Advanced',
    estimatedHours: 36,
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
    techStack: ['Rust', 'Tokio', 'Memory Mapping (mmap)', 'Bloom Filters', 'Bincode'],
    courseRelation: 'Zero-Trust Architecture & Linux eBPF Security',
    starterRepoCommand: 'cargo new --lib lsm-kv-engine && git clone https://github.com/yaswantcode/lsm-starter',
    liveDemoUrl: 'https://docs.yaswantcode.io/rust-lsm',
    status: 'Available',
    submissionsCount: 620,
    milestones: [
      {
        id: 'm1',
        title: 'Write-Ahead Log (WAL) & Recovery',
        description: 'Append writes sequentially with CRC32 checksums for crash resilience.',
        completed: false,
      },
      {
        id: 'm2',
        title: 'Concurrent SkipList MemTable',
        description: 'Support lock-free read and thread-safe inserts up to 64MB buffer.',
        completed: false,
      },
      {
        id: 'm3',
        title: 'SSTable Format with Bloom Filters',
        description: 'Flush sorted runs to disk with block-level index and probabilistic filters.',
        completed: false,
      },
      {
        id: 'm4',
        title: 'Leveled Compaction Strategy',
        description: 'Merge overlapping key ranges into lower levels to minimize read amplification.',
        completed: false,
      }
    ],
    deliverables: [
      'Rust crate with clean public API: get, put, delete, scan(prefix)',
      'Benchmark comparing throughput against standard std::collections::BTreeMap',
      'Comprehensive crash-injection recovery tests'
    ],
    architectureDiagramSnippet: `PUT(k, v) ──► [WAL Log (Disk)] + [MemTable (RAM)]
                        │ (When MemTable >= 64MB)
                        ▼
                [SSTable L0 (Disk)] ──► [Bloom Filter Index]
                        │ (Compaction)
                        ▼
                [SSTable L1 (Disk)] ──► [SSTable L2]`
  },
  {
    id: 'proj-5',
    title: 'Cloud-Native eBPF Network Security Monitor',
    tagline: 'Kernel-level intrusion detection and low-overhead packet inspection using Cilium eBPF and Go.',
    description: 'Hook into Linux kernel tracepoints and socket filters to detect suspicious lateral movement, DNS tunneling, and port scans with zero application latency and nanosecond profiling.',
    category: 'DevOps & Cloud',
    difficulty: 'Advanced',
    estimatedHours: 30,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    techStack: ['Linux Kernel eBPF', 'C', 'Go 1.23', 'Cilium ebpf-go', 'Grafana', 'Prometheus'],
    courseRelation: 'Zero-Trust Architecture & Linux eBPF Security',
    starterRepoCommand: 'git clone https://github.com/yaswantcode/ebpf-security-agent.git',
    liveDemoUrl: 'https://security-telemetry.yaswantcode.io',
    status: 'Available',
    submissionsCount: 480,
    milestones: [
      {
        id: 'm1',
        title: 'Kernel Probes & Socket Hooking',
        description: 'Compile eBPF C bytecode into BPF ring buffers for socket connect and bind events.',
        completed: false,
      },
      {
        id: 'm2',
        title: 'Go Userspace Collector Daemon',
        description: 'Load BPF program into kernel and stream events to userspace ring buffer.',
        completed: false,
      },
      {
        id: 'm3',
        title: 'Anomaly Heuristics Engine',
        description: 'Flag anomalous egress payloads and unauthorized shell spawn syscalls.',
        completed: false,
      },
      {
        id: 'm4',
        title: 'Prometheus Exporter & Dashboard',
        description: 'Expose live metrics at /metrics and provide production Grafana dashboard JSON.',
        completed: false,
      }
    ],
    deliverables: [
      'Self-contained Docker container with privileged BPF capabilities',
      'Test script triggering simulated attacks and verifying instant alerts',
      'Grafana visualization dashboard export'
    ],
    architectureDiagramSnippet: `[Linux Kernel Space] 
  kprobe:sys_enter_connect ──► [eBPF Program] ──► [BPF Ring Buffer]
                                                       │
[User Space Daemon] ◄──────────────────────────────────┘
  Parse Network Tuples ──► Anomaly Rules ──► Prometheus Alert`
  },
  {
    id: 'proj-6',
    title: 'Real-Time Vector Whiteboard with CRDTs',
    tagline: 'Multiplayer infinite canvas with Yjs, WebSockets, canvas spatial indexing, and pen pressure.',
    description: 'Develop a high-performance vector sketching and diagramming tool. Implement local-first conflict-free replicated data types (CRDTs), peer-to-peer cursor tracking, and infinite canvas pan/zoom transforms.',
    category: 'Full-Stack',
    difficulty: 'Intermediate',
    estimatedHours: 22,
    thumbnail: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80',
    techStack: ['React 19', 'Yjs CRDT', 'HTML5 Canvas', 'WebSockets', 'TypeScript', 'Vite'],
    courseRelation: 'Next.js 15 & React 19: Full-Stack Architecture',
    starterRepoCommand: 'npx degit yaswantcode/crdt-whiteboard multiplayer-canvas',
    liveDemoUrl: 'https://whiteboard-demo.yaswantcode.io',
    status: 'Completed',
    submissionsCount: 1890,
    milestones: [
      {
        id: 'm1',
        title: 'Canvas Pan, Zoom & Matrix Math',
        description: 'Implement smooth trackpad pinch-to-zoom and coordinate transform matrices.',
        completed: true,
      },
      {
        id: 'm2',
        title: 'Yjs CRDT Shape Synchronization',
        description: 'Bind vector strokes and rectangle objects to shared Y.Doc instances.',
        completed: true,
      },
      {
        id: 'm3',
        title: 'Multiplayer Awareness Cursors',
        description: 'Broadcast user cursor positions, user names, and selected color tags.',
        completed: true,
      },
      {
        id: 'm4',
        title: 'Export to SVG / PNG & Offline Cache',
        description: 'Serialize vector tree into high-resolution SVG files with IndexedDB caching.',
        completed: true,
      }
    ],
    deliverables: [
      'Complete client-server repository supporting 20+ concurrent drawers',
      'Stress test benchmark report measuring FPS during rapid multi-user drawing',
      'Offline-first sync recovery demonstration'
    ],
    architectureDiagramSnippet: `Browser 1 (Local Y.Doc) ◄── WebSockets ──► Node.js Sync Server
          ▲                                         │
          │                                         ▼
Browser 2 (Local Y.Doc) ◄───────────────────────────┘`
  }
];
