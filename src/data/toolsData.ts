export interface DevToolItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'DevOps & Docker' | 'IDE & Editors' | 'Database GUI' | 'API & Backend' | 'Full-Stack Kits' | 'Utilities';
  downloadType: 'zip' | 'drive' | 'direct';
  downloadUrl: string;
  fileSize: string;
  version: string;
  osSupport: ('Windows' | 'macOS' | 'Linux' | 'Cross-Platform')[];
  thumbnail: string;
  downloadsCount: number;
  featured?: boolean;
  updatedAt: string;
  author: string;
}

export const INITIAL_DEV_TOOLS: DevToolItem[] = [
  {
    id: 'tool-1',
    name: 'Full-Stack Docker Development Environment',
    tagline: 'One-click local stack: MySQL, Redis, Nginx & Node.js',
    description: 'Pre-configured docker-compose.yml, SSL certs, database seeds, and environment configs for zero-setup local development.',
    category: 'DevOps & Docker',
    downloadType: 'zip',
    downloadUrl: 'https://github.com/Yaswant-pandey/Yaswant-pandey/archive/refs/heads/main.zip',
    fileSize: '18.4 MB • ZIP Archive',
    version: 'v2.4.0',
    osSupport: ['Windows', 'macOS', 'Linux'],
    thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&auto=format&fit=crop&q=80',
    downloadsCount: 1420,
    featured: true,
    updatedAt: '2026-09-15',
    author: 'Yaswant DevOps Team'
  },
  {
    id: 'tool-2',
    name: 'VS Code Ultimate Extension & Snippets Suite',
    tagline: 'Essential productivity extensions, custom shortcuts & React/Python snippets',
    description: 'Complete bundle containing settings.json, keybindings, theme configurations, Prettier presets, and multi-language snippets.',
    category: 'IDE & Editors',
    downloadType: 'drive',
    downloadUrl: 'https://drive.google.com/drive/folders/1Yaswant_VSCode_Ultimate_Pack',
    fileSize: '42.5 MB • Drive Bundle',
    version: '2026 Pro Edition',
    osSupport: ['Cross-Platform'],
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    downloadsCount: 2150,
    featured: true,
    updatedAt: '2026-09-14',
    author: 'Yaswant Pandey'
  },
  {
    id: 'tool-3',
    name: 'Database Migration & Schema Workbench Toolkit',
    tagline: 'SQL migration generator, schema diff & fake data seeder',
    description: 'Automated CLI migration utility supporting MySQL, MariaDB, and SQLite with automated rollbacks and mock data generators.',
    category: 'Database GUI',
    downloadType: 'zip',
    downloadUrl: 'https://github.com/Yaswant-pandey/Yaswant-pandey/archive/refs/heads/main.zip',
    fileSize: '14.2 MB • ZIP Archive',
    version: 'v1.8.2',
    osSupport: ['Windows', 'macOS', 'Linux'],
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
    downloadsCount: 980,
    featured: false,
    updatedAt: '2026-09-12',
    author: 'Database Engineering'
  },
  {
    id: 'tool-4',
    name: 'API Testing & Postman Enterprise Collections',
    tagline: 'Ready-to-use Postman/Insomnia collections for 40+ REST & GraphQL endpoints',
    description: 'Complete test suites, auth token presets, automated assertion tests, and environment templates for backend testing.',
    category: 'API & Backend',
    downloadType: 'drive',
    downloadUrl: 'https://drive.google.com/drive/folders/1Postman_API_Collections_Suite',
    fileSize: '8.5 MB • Drive Folder',
    version: 'v4.1.0',
    osSupport: ['Cross-Platform'],
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    downloadsCount: 1840,
    featured: true,
    updatedAt: '2026-09-10',
    author: 'Yaswant Code API Lab'
  },
  {
    id: 'tool-5',
    name: 'Python Data Science & PyTorch Starter Sandbox',
    tagline: 'Jupyter notebooks, GPU acceleration configs & clean pipeline templates',
    description: 'Pre-configured environment with PyTorch, transformers, pandas, visualization tools, and virtualenv bootstrap scripts.',
    category: 'Full-Stack Kits',
    downloadType: 'zip',
    downloadUrl: 'https://github.com/Yaswant-pandey/Yaswant-pandey/archive/refs/heads/main.zip',
    fileSize: '56.8 MB • ZIP Archive',
    version: 'v3.0.0',
    osSupport: ['Windows', 'macOS', 'Linux'],
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    downloadsCount: 1320,
    featured: false,
    updatedAt: '2026-09-08',
    author: 'AI Research Group'
  },
  {
    id: 'tool-6',
    name: 'React 19 & Next.js SaaS Production Starter Kit',
    tagline: 'Production boilerplate: Tailwind, Auth, DB ORM & Dashboard Layout',
    description: 'Enterprise starter kit with user authentication, responsive dashboard layout, dark mode, and optimized build pipelines.',
    category: 'Full-Stack Kits',
    downloadType: 'drive',
    downloadUrl: 'https://drive.google.com/drive/folders/1Nextjs_React19_SaaS_Boilerplate',
    fileSize: '34.2 MB • Drive Bundle',
    version: 'v5.2.1',
    osSupport: ['Cross-Platform'],
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
    downloadsCount: 2890,
    featured: true,
    updatedAt: '2026-09-05',
    author: 'Yaswant Pandey'
  }
];

export const TOOL_CATEGORY_THUMBNAILS: Record<string, string> = {
  'DevOps & Docker': 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&auto=format&fit=crop&q=80',
  'IDE & Editors': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
  'Database GUI': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
  'API & Backend': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  'Full-Stack Kits': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
  'Utilities': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
};
