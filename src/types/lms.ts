export type RoleType = 'student' | 'admin';

export type ActiveView = 
  | 'landing'
  | 'student-dashboard'
  | 'learning-paths'
  | 'community'
  | 'student-profile'
  | 'admin-dashboard'
  | 'settings'
  | 'blog'
  | 'resources'
  | 'notes'
  | 'tools'
  | 'projects';

export interface Instructor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  coursesCount: number;
  expertise: string[];
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  achievements?: string[];
}

export interface DiscussionThread {
  id: string;
  courseId?: string;
  courseName?: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  title: string;
  content: string;
  tags: string[];
  category: 'General' | 'Frontend' | 'Backend' | 'AI & ML' | 'Architecture' | 'Career';
  upvotes: number;
  repliesCount: number;
  hasAcceptedAnswer: boolean;
  createdAt: string;
  answers: {
    id: string;
    author: { name: string; avatar: string; role: string };
    content: string;
    createdAt: string;
    isAccepted?: boolean;
    upvotes: number;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: 'course' | 'assignment' | 'quiz' | 'certificate' | 'announcement' | 'community';
  read: boolean;
  link?: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  difficulty: string;
  duration: string;
  minRating: number;
  priceType: 'all' | 'free' | 'paid';
  sortBy: 'popular' | 'highest-rated' | 'newest' | 'price-low' | 'price-high';
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: 'Distributed Systems' | 'AI & ML' | 'Frontend Architecture' | 'Rust & Systems' | 'Cloud Native' | 'DevOps & Tooling';
  tags: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readingTime: string;
  likesCount: number;
  viewsCount: number;
  featured?: boolean;
  content: string; // Markdown or rich text
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: 'Cheat Sheets' | 'Architecture Blueprints' | 'Roadmaps' | 'Starter Kits' | 'Checklists';
  format: 'PDF' | 'Markdown' | 'Interactive' | 'GitHub' | 'ZIP';
  fileSize?: string;
  downloadUrl?: string;
  copyableCommand?: string;
  iconName: string;
  badge?: string;
  tags: string[];
  downloadsCount: number;
  updatedAt: string;
  contentSnippet?: string;
}

export type NoteResourceType = 'pdf' | 'google_drive' | 'google_docs' | 'google_sheets' | 'google_slides' | 'link';

export interface StudyNote {
  id: string;
  title: string;
  courseOrTopic: string;
  category: 
    | 'System Design' 
    | 'React & Web' 
    | 'Distributed Systems' 
    | 'Databases & SQL' 
    | 'Machine Learning' 
    | 'DevOps & Cloud' 
    | 'Data Structures & Algorithms'
    | 'Languages & Programming'
    | 'Core CS & B.Tech'
    | 'General'
    | (string & {});
  tags: string[];
  content?: string;
  pinned: boolean;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
  resourceType: NoteResourceType;
  url: string;
  fileSize?: string;
  description?: string;
  author?: string;
  thumbnail?: string;
  previewUrl?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'Full-Stack' | 'Distributed Systems' | 'AI & ML' | 'DevOps & Cloud' | 'Systems & Rust';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  thumbnail: string;
  techStack: string[];
  courseRelation?: string;
  starterRepoCommand: string;
  liveDemoUrl?: string;
  status: 'Available' | 'In Progress' | 'Completed';
  submissionsCount: number;
  featured?: boolean;
  milestones: ProjectMilestone[];
  deliverables: string[];
  architectureDiagramSnippet?: string;
}

