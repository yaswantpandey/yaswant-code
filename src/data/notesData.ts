import { StudyNote } from '../types/lms';

export const INITIAL_STUDY_NOTES: StudyNote[] = [
  {
    id: 'note-1',
    title: 'Raft Consensus: Split-Brain Mitigation & Randomized Timeouts',
    courseOrTopic: 'Cloud-Native Kubernetes & Distributed Microservices in Go',
    category: 'Distributed Systems',
    tags: ['Raft', 'Consensus', 'Leader Election', 'High Availability'],
    pinned: true,
    starred: true,
    createdAt: '2026-09-10',
    updatedAt: '2026-09-12',
    content: `
### Key Invariants in Raft Consensus
1. **Election Safety**: At most one leader can be elected in a given term.
2. **Leader Append-Only**: A leader never overwrites or truncates its own log entries; it only appends new entries.
3. **Log Matching Property**: If two logs contain an entry with the same index and term, then the logs are identical in all entries up through the given index.

#### The Magic of Randomized Timeouts:
- Election timeouts must be chosen randomly from a range such as **150ms to 300ms**.
- This randomness dramatically reduces the probability of a split vote (where two candidates solicit votes simultaneously and neither reaches a majority quorum).
- A candidate must receive votes from a strict majority: \`floor(N / 2) + 1\`.

\`\`\`go
// Randomized ticker pattern in Go
timeout := time.Duration(150 + rand.Intn(150)) * time.Millisecond
ticker := time.NewTicker(timeout)
\`\`\`
    `
  },
  {
    id: 'note-2',
    title: 'React 19 Server Components vs Client Components Rules',
    courseOrTopic: 'React 19, Next.js & Modern Frontend Architecture',
    category: 'React & Web',
    tags: ['React 19', 'RSC', 'Next.js', 'Server Actions'],
    pinned: true,
    starred: true,
    createdAt: '2026-09-08',
    updatedAt: '2026-09-11',
    content: `
### Server Components vs Client Components Rules
- **Server Components** (Default in App Router):
  - Can be marked \`async\` and await database/fetch queries directly.
  - Zero bundle impact on client JS payload.
  - CANNOT use React hooks (\`useState\`, \`useEffect\`, \`useMemo\`) or browser DOM APIs (\`window\`, \`localStorage\`).
  - CANNOT pass functions as props to Client Components unless they are Server Actions.

- **Client Components** (\`'use client'\` directive):
  - Rendered on server first (SSR) then hydrated in browser.
  - Used when user interactivity, event listeners (\`onClick\`, \`onChange\`), and client state are needed.
  - Pass Server Components as \`children\` props into Client Components to avoid dragging entire subtrees into the client bundle!
    `
  },
  {
    id: 'note-3',
    title: 'PostgreSQL: When to use B-Tree, BRIN, and GIN Indexes',
    courseOrTopic: 'High-Performance Database Systems',
    category: 'Databases & SQL',
    tags: ['PostgreSQL', 'Indexes', 'Performance', 'SQL'],
    pinned: false,
    starred: true,
    createdAt: '2026-09-02',
    updatedAt: '2026-09-05',
    content: `
### Index Selection Guidelines:
1. **B-Tree**:
   - The Swiss Army knife. Use for equality (\`=\`), range queries (\`<\`, \`<=\`, \`>\`, \`BETWEEN\`), and \`ORDER BY\`.
   - Great for UUIDs, user IDs, and foreign keys.

2. **BRIN (Block Range Index)**:
   - Extremely lightweight index storing min/max values for ranges of disk pages (usually 128 pages).
   - Use on naturally ordered append-only tables (e.g., \`created_at\` timestamp, auto-incrementing serial IDs).
   - Index size is often 95% smaller than equivalent B-Tree!

3. **GIN (Generalized Inverted Index)**:
   - For composite items where elements must be searched inside (e.g., JSONB keys, full-text \`tsvector\`, arrays).
    `
  },
  {
    id: 'note-4',
    title: 'PyTorch Quantization & KV Cache Memory Estimation Formula',
    courseOrTopic: 'Distributed Deep Learning & Transformer Architectures',
    category: 'Machine Learning',
    tags: ['PyTorch', 'Transformers', 'KV Cache', 'Quantization'],
    pinned: false,
    starred: false,
    createdAt: '2026-08-25',
    updatedAt: '2026-08-29',
    content: `
### Memory Calculation for LLM Inference:
Total VRAM required = Weights VRAM + KV Cache + Activation memory

#### 1. Weights Memory:
- FP16 / BF16: \`Params * 2 bytes\` (e.g. 8B model = 16 GB)
- INT8: \`Params * 1 byte\` (8B model = 8 GB)
- INT4: \`Params * 0.5 bytes\` (8B model = 4 GB)

#### 2. KV Cache Formula per Token:
\`\`\`
KV_Cache_Size = 2 * (num_layers) * (num_heads) * (head_dim) * (batch_size) * (seq_len) * (bytes_per_elem)
\`\`\`
For an 8B model with 32 layers, 32 heads, head_dim=128, batch=4, context=4096:
KV Cache ≈ 1.07 GB in FP16!
    `
  },
  {
    id: 'note-5',
    title: 'System Design: API Rate Limiting Algorithms Comparison',
    courseOrTopic: 'System Design Masterclass',
    category: 'System Design',
    tags: ['Rate Limiting', 'Redis', 'Token Bucket', 'Leaky Bucket'],
    pinned: false,
    starred: false,
    createdAt: '2026-08-18',
    updatedAt: '2026-08-20',
    content: `
### Rate Limiting Strategies:
1. **Token Bucket** (Industry Standard - AWS, Stripe):
   - Tokens added at fixed rate. Capacity capped at burst limit.
   - Allows brief traffic bursts while keeping long-term average capped.
   - Easily implemented with Redis \`EVAL\` Lua script.

2. **Leaky Bucket**:
   - Requests enter queue of fixed size; processed at steady FIFO rate.
   - Smooths out traffic spikes, but drops requests if bucket overflows.

3. **Sliding Window Counter**:
   - Combines previous window rate with current window elapsed fraction.
   - Low memory footprint compared to Sliding Window Log.
    `
  }
];
