export type RoleType = 'student' | 'instructor' | 'admin' | 'guest';

export type ActiveView = 
  | 'landing'
  | 'courses'
  | 'course-detail'
  | 'learning-interface'
  | 'quiz'
  | 'assignment'
  | 'student-dashboard'
  | 'learning-paths'
  | 'certificate'
  | 'instructor-profile'
  | 'community'
  | 'student-profile'
  | 'instructor-dashboard'
  | 'course-creation'
  | 'admin-dashboard'
  | 'settings'
  | 'blog'
  | 'resources'
  | 'notes'
  | 'tools'
  | 'projects'
  | 'workspace';

export interface Lesson {
  id: string;
  title: string;
  duration: string; // e.g. "14:20"
  type: 'video' | 'quiz' | 'assignment' | 'reading';
  completed: boolean;
  locked: boolean;
  previewAvailable?: boolean;
  videoUrl?: string;
  description?: string;
  codeSnippet?: string;
  codeLanguage?: string;
  resources?: { name: string; size: string; url: string }[];
  transcript?: { time: string; text: string }[];
}

export interface Chapter {
  id: string;
  title: string;
  duration: string;
  lessons: Lesson[];
}

export interface Module {
  id: string;
  title: string;
  duration: string;
  chapters: Chapter[];
}

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

export interface Course {
  id: string;
  title: string;
  tagline: string;
  description: string;
  thumbnail: string;
  instructor: Instructor;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  durationHours: number;
  lessonsCount: number;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  isBestseller?: boolean;
  isFeatured?: boolean;
  language: string;
  lastUpdated: string;
  hasCertificate: boolean;
  enrolled?: boolean;
  progressPercent?: number;
  currentLessonId?: string;
  whatYouWillLearn: string[];
  requirements: string[];
  modules: Module[];
  skills: string[];
  projectsCount: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  durationMinutes: number;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  deadline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  requirements: string[];
  instructions: string[];
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Under Review' | 'Completed' | 'Needs Revision';
  submittedDate?: string;
  grade?: string;
  feedback?: string;
  githubUrl?: string;
  submittedFile?: string;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  instructorName: string;
  issueDate: string;
  credentialId: string;
  skillsAcquired: string[];
  grade: string;
  verificationUrl: string;
  thumbnailUrl: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  iconName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  coursesCount: number;
  skillsCovered: string[];
  progressPercent: number;
  isRecommended?: boolean;
  careerRoles: string[];
  milestones: {
    title: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Capstone' | 'Certification';
    courses: string[];
    description: string;
  }[];
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

export interface StudyNote {
  id: string;
  title: string;
  courseOrTopic: string;
  category: 'System Design' | 'React & Web' | 'Distributed Systems' | 'Databases & SQL' | 'Machine Learning' | 'General';
  tags: string[];
  content: string;
  pinned: boolean;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
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

