import { BlogPost } from '../types/lms';

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Zero-Copy Data Pipelines in Rust: Architecting Sub-Millisecond Event Streaming',
    slug: 'zero-copy-data-pipelines-rust',
    excerpt: 'How modern high-throughput streaming systems eliminate user-to-kernel memory copies using sendfile, mmap, and io_uring in Rust 2024.',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&auto=format&fit=crop&q=80',
    category: 'Rust & Systems',
    tags: ['Rust', 'io_uring', 'Zero-Copy', 'Networking', 'High Performance'],
    author: {
      name: 'Marcus Thorne',
      role: 'Principal Infrastructure Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    publishedAt: 'Sep 11, 2026',
    readingTime: '8 min read',
    likesCount: 1420,
    viewsCount: 18450,
    featured: true,
    content: `
### The Cost of Premature Copying in High-Throughput Streams

In traditional Linux I/O pipelines, moving a message from a network socket to disk or another client buffer requires up to four context switches and three redundant buffer copies between kernel space and user space.

When scaling data pipelines beyond 10,000,000 events/second, the CPU cache miss penalty dominates runtime execution profiles.

\`\`\`rust
// Zero-copy network transmission using Rust nix crate and splice
use nix::fcntl::{splice, SpliceFFlags};
use std::os::unix::io::AsRawFd;

pub fn stream_zero_copy(src_fd: i32, pipe_out: i32, len: usize) -> nix::Result<usize> {
    splice(
        src_fd,
        None,
        pipe_out,
        None,
        len,
        SpliceFFlags::SPLICE_F_NONBLOCK | SpliceFFlags::SPLICE_F_MOVE,
    )
}
\`\`\`

#### Key Architectural Rules:
1. **Never deserialize payloads** unless routing or payload modification is strictly mandatory.
2. **Employ pinned buffer pools** allocated with jemalloc or hugetlbfs to avoid Linux page allocation lock contention.
3. **Use io_uring for async queue submission**, maintaining zero user-space wait states and batched completions.

By shifting our message queues to memory-mapped ring buffers and employing \`io_uring\` completions, overall tail latency (p99.9) plummeted from 4.2ms to 280 microseconds.
    `
  },
  {
    id: 'post-2',
    title: 'Building Production Agentic AI with Structured Function Calling & Grounding',
    slug: 'production-agentic-ai-function-calling',
    excerpt: 'A practical deep-dive into multi-turn agent tool dispatching, schema validation, loop protection, and context token budgeting.',
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&auto=format&fit=crop&q=80',
    category: 'AI & ML',
    tags: ['Gemini', 'LLMs', 'Agentic Workflows', 'Function Calling', 'TypeScript'],
    author: {
      name: 'Dr. Elena Vance',
      role: 'Staff AI Engineer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    publishedAt: 'Sep 8, 2026',
    readingTime: '11 min read',
    likesCount: 2310,
    viewsCount: 29800,
    featured: true,
    content: `
### Moving Beyond Naive Text Completion Loops

Production agents fail when they rely on loose prompt engineering rather than rigid typed contracts. Modern generative models provide first-class function calling interfaces that return deterministic JSON structures matching JSON Schema definitions.

\`\`\`typescript
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Declaring strict tool schema
const weatherTool = {
  name: "getLiveMetrics",
  description: "Queries live telemetry for a given cluster node",
  parameters: {
    type: Type.OBJECT,
    properties: {
      nodeId: { type: Type.STRING, description: "Target node identifier" },
      metric: { type: Type.STRING, enum: ["cpu", "memory", "io"] }
    },
    required: ["nodeId", "metric"]
  }
};
\`\`\`

#### Essential Guards for Production Loops:
- **Maximum Step Hard Limits**: Always terminate loops after 5-10 turns if unresolved.
- **Recursive Calling Prevention**: Check idempotency keys on every tool execution.
- **Context Pruning**: Maintain a rolling window of recent tool calls to prevent token context blowup and degraded hallucination.
    `
  },
  {
    id: 'post-3',
    title: 'React 19 Server Actions & Fine-Grained Optimistic UI Mutations',
    slug: 'react-19-server-actions-optimistic-ui',
    excerpt: 'Stop writing boilerplate loading spinners. Leverage React 19 useActionState, useOptimistic, and concurrent transitions for fluid UX.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900&auto=format&fit=crop&q=80',
    category: 'Frontend Architecture',
    tags: ['React 19', 'Next.js', 'Optimistic UI', 'UX', 'TypeScript'],
    author: {
      name: 'Sarah Chen',
      role: 'Lead Frontend Engineer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
    },
    publishedAt: 'Aug 30, 2026',
    readingTime: '6 min read',
    likesCount: 1890,
    viewsCount: 21500,
    content: `
### The New Primitive: useOptimistic

Users expect immediate visual responses when clicking a heart, toggling an enrollment, or submitting an assignment grade. Waiting for network round-trips creates an artificial lag that makes web applications feel sluggish.

\`\`\`tsx
import { useOptimistic, useTransition } from 'react';

function LikeButton({ initialLikes, onLikeAction }: { initialLikes: number; onLikeAction: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    initialLikes,
    (state, delta: number) => state + delta
  );

  const handleClick = () => {
    startTransition(async () => {
      setOptimisticLikes(1);
      await onLikeAction();
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      Likes: {optimisticLikes} {isPending && '↻'}
    </button>
  );
}
\`\`\`

If the server mutation fails, React automatically rolls back the optimistic state without requiring complex custom undo-redo stacks.
    `
  },
  {
    id: 'post-4',
    title: 'Distributed Consensus with Raft: Deconstructing Leader Election & Split Votes',
    slug: 'distributed-consensus-raft-leader-election',
    excerpt: 'Step-by-step visual dissection of heartbeats, randomized election timeouts, log replication, and brain-split mitigation in high-availability clusters.',
    coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900&auto=format&fit=crop&q=80',
    category: 'Distributed Systems',
    tags: ['Raft', 'Consensus', 'Distributed Systems', 'Go', 'High Availability'],
    author: {
      name: 'Marcus Thorne',
      role: 'Principal Infrastructure Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    publishedAt: 'Aug 22, 2026',
    readingTime: '12 min read',
    likesCount: 3105,
    viewsCount: 35200,
    content: `
### Why Consensus is the Foundation of Cloud Reliability

In a distributed cluster of N nodes, Raft guarantees that up to (N - 1) / 2 node failures can occur without sacrificing linearizability or data consistency.

#### The Three Node States:
1. **Follower**: Passive recipient of Heartbeats and AppendEntries RPCs.
2. **Candidate**: State entered when election timeout fires without heartbeat reception.
3. **Leader**: Manages all client writes and enforces log synchronization across the quorum.

The magic that prevents perpetual split votes is **randomized election timeouts** (e.g. 150ms - 300ms), ensuring one candidate almost always starts and wins the election before competitors reset.
    `
  },
  {
    id: 'post-5',
    title: 'PostgreSQL Deep Dive: B-Trees vs BRIN vs GiST Indexes in Multi-Tenant Schemas',
    slug: 'postgresql-indexes-btree-brin-gist',
    excerpt: 'Choosing the right database index can reduce query times from 14 seconds to 3 milliseconds while cutting storage footprint by 90%.',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=900&auto=format&fit=crop&q=80',
    category: 'Cloud Native',
    tags: ['PostgreSQL', 'SQL', 'Database Optimization', 'Indexing', 'Performance'],
    author: {
      name: 'Sarah Chen',
      role: 'Lead Frontend Engineer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
    },
    publishedAt: 'Aug 15, 2026',
    readingTime: '9 min read',
    likesCount: 2045,
    viewsCount: 24100,
    content: `
### Index Selection Matrix

When dealing with time-series append-only tables containing 100M+ rows, standard B-Trees consume gigabytes of RAM.

- **B-Tree**: Default. Ideal for high-cardinality lookups like \`user_id\` or primary keys.
- **BRIN (Block Range Index)**: Orders of magnitude smaller. Perfect for naturally sequenced timestamp columns like \`created_at\`.
- **GIN (Generalized Inverted Index)**: Essential for PostgreSQL JSONB search and full-text search arrays.

\`\`\`sql
-- BRIN index on append-only audit trail
CREATE INDEX idx_audit_created_at_brin 
ON audit_events 
USING BRIN (created_at);
\`\`\`
    `
  },
  {
    id: 'post-6',
    title: 'Kubernetes Multi-Cluster GitOps with ArgoCD, Cilium, and eBPF Telemetry',
    slug: 'kubernetes-gitops-argocd-cilium-ebpf',
    excerpt: 'Eliminating kube-proxy iptables bloat with Cilium eBPF mesh routing across hybrid AWS and on-premise Kubernetes clusters.',
    coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=900&auto=format&fit=crop&q=80',
    category: 'DevOps & Tooling',
    tags: ['Kubernetes', 'eBPF', 'Cilium', 'ArgoCD', 'GitOps'],
    author: {
      name: 'Marcus Thorne',
      role: 'Principal Infrastructure Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    publishedAt: 'Jul 29, 2026',
    readingTime: '10 min read',
    likesCount: 1680,
    viewsCount: 19400,
    content: `
### Replacing iptables with Linux Kernel eBPF

As Kubernetes clusters scale to hundreds of microservices, iptables rule evaluation degrades linearly with service count. Cilium utilizes extended Berkeley Packet Filters (eBPF) to attach bytecode directly to Linux network sockets, enabling O(1) hash table lookups.

Paired with ArgoCD for declared GitOps pipelines, infrastructure drift is eliminated in real time.
    `
  }
];
