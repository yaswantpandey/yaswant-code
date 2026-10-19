import React, { useState, useEffect, useCallback } from 'react';
import { useLms } from '../context/LmsContext';
import { tokenStorage } from '../services/api';
import { safeHref } from '../lib/safeHref';
import { RoadmapStage } from '../data/fullstackRoadmap';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Activity, 
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Mail,
  Database,
  UserCheck,
  UserX,
  ExternalLink,
  Copy,
  Check,
  Server,
  FileText,
  Wrench,
  Download,
  Settings as SettingsIcon,
  Globe,
  Sliders,
  AlertTriangle,
  MessageSquare,
  ArrowLeft,
  LogOut,
  Edit3,
  Star,
  Pin,
  Flame,
  FileArchive,
  Save,
  Radio,
  FolderGit2,
  Map,
  Layout,
  Link,
  Code2,
  Target,
  GraduationCap,
  ChevronDown,
  Cpu,
  GitBranch,
  PlayCircle,
  Layers,
  MessageCircle,
  FileCode,
  Eye,
  EyeOff,
  Send,
  BookCheck
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { BentoCard } from '../components/ui/BentoCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { sendPushNotification } from '../services/notifications';

// ── Types for Complete Website Administration ────────────────────────────────
interface AdminOverview {
  users: {
    total: number;
    students: number;
    admins: number;
    active: number;
  };
  notes: {
    total: number;
    pdf: number;
    drive: number;
  };
  tools: {
    total: number;
    zip: number;
    drive: number;
  };
  inquiries: {
    total: number;
    recent: Array<{
      id: number;
      name: string;
      email: string;
      subject: string;
      message: string;
      course?: string;
      created_at: string;
    }>;
  };
  subscribers: {
    total: number;
    active: number;
  };
  discussions?: {
    total: number;
    unresolved: number;
  };
  database: {
    status: string;
    driver: string;
    database: string;
    host: string;
    server: string;
    php_version: string;
  };
  recent_users?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    title: string;
    is_active: number | boolean;
    created_at: string;
  }>;
}

export interface AdminDiscussion {
  id: string;
  courseId: string;
  courseTitle: string;
  userId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: number;
  hasAcceptedAnswer: boolean;
  repliesCount: number;
  createdAt: string;
}

export interface AdminDiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  isAccepted: boolean;
  upvotes: number;
  createdAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar: string;
  title: string;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  isActive: boolean;
  createdAt: string;
}

interface AdminNote {
  id: string;
  title: string;
  topic: string;
  courseOrTopic?: string;
  category: string;
  resourceType: 'pdf' | 'google_drive' | 'google_docs' | 'google_sheets' | string;
  url: string;
  fileSize: string;
  thumbnail: string;
  description: string;
  author: string;
  pinned: boolean;
  starred: boolean;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

interface AdminTool {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  downloadType: 'zip' | 'drive' | 'direct' | string;
  downloadUrl: string;
  fileSize: string;
  version: string;
  osSupport: string[];
  thumbnail: string;
  downloadsCount: number;
  featured: boolean;
  author: string;
  createdAt: string;
  updatedAt?: string;
}

interface AdminInquiry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  course?: string;
  phone?: string;
  ip_address?: string;
  created_at: string;
}

interface AdminSubscriber {
  id: number;
  email: string;
  name?: string;
  is_active: number;
  subscribed_at: string;
}

interface DbTableStat {
  name: string;
  rows_count: number;
  size_mb: number;
}

// ── New Content Type Interfaces ───────────────────────────────────────────────
interface AdminProject {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  techStack: string[];
  thumbnail: string;
  courseRelation: string;
  starterRepoCommand: string;
  liveDemoUrl: string;
  status: 'Available' | 'In Progress' | 'Completed';
  submissionsCount: number;
  featured: boolean;
}

interface AdminRoadmap {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  category: string;
  categoryLabel?: string;
  tagline?: string;
  difficulty?: string;
  duration?: string;
  weeklyCommitment?: string;
  totalTopics?: number;
  salaryBenchmark?: string;
  careerRoles?: string[];
  stages?: RoadmapStage[];
  status?: string;
  orderIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminWorkspaceLink {
  id: string;
  title: string;
  description: string;
  category: 'Google Workspace' | 'Dev Tools' | 'Learning Resources' | 'Community' | 'Other';
  url: string;
  icon: string;
  featured: boolean;
  order: number;
}

interface SiteSettingsMap {
  announcement_enabled: string;
  announcement_badge: string;
  announcement_text: string;
  announcement_link: string;
  announcement_btn_text: string;
  platform_title: string;
  platform_tagline: string;
  contact_email: string;
  support_phone: string;
  office_location: string;
  github_url: string;
  youtube_url: string;
  linkedin_url: string;
  telegram_url: string;
  maintenance_mode: string;
  allow_registration: string;
  [key: string]: string;
}

const NOTE_CATEGORY_THUMBNAILS: Record<string, string> = {
  'System Design': 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80',
  'React & Web': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
  'Distributed Systems': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  'Databases & SQL': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
  'Machine Learning': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
  'DevOps & Cloud': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
  'Data Structures & Algorithms': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
  'Languages & Programming': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
  'Core CS & B.Tech': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
  'General': 'https://images.unsplash.com/photo-1516116211227-bbc13c6b2452?w=800&auto=format&fit=crop&q=80'
};

const TOOL_CATEGORY_THUMBNAILS: Record<string, string> = {
  'DevOps & Docker': 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&auto=format&fit=crop&q=80',
  'IDE & Editors': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
  'Database GUI': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
  'API & Backend': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  'Full-Stack Kits': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
  'Utilities': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
};

export const AdminDashboardPage: React.FC = () => {
  const { addToast, setCurrentView } = useLms();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'discussions' | 'notes' | 'tools' | 'projects' | 'roadmaps' | 'users' | 'settings' | 'inquiries' | 'subscribers' | 'database' | 'notifications'>('overview');
  
  // Loading & sync state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>('Just now');
  const [copiedEmails, setCopiedEmails] = useState<boolean>(false);

  // Live Data States
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [discussionsList, setDiscussionsList] = useState<AdminDiscussion[]>([]);
  const [notesList, setNotesList] = useState<AdminNote[]>([]);
  const [toolsList, setToolsList] = useState<AdminTool[]>([]);
  const [projectsList, setProjectsList] = useState<AdminProject[]>([]);
  const [roadmapsList, setRoadmapsList] = useState<AdminRoadmap[]>([]);
  const [inquiriesList, setInquiriesList] = useState<AdminInquiry[]>([]);
  const [subscribersList, setSubscribersList] = useState<AdminSubscriber[]>([]);
  const [dbTables, setDbTables] = useState<DbTableStat[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsMap>({
    announcement_enabled: '1',
    announcement_badge: 'NEW RELEASE',
    announcement_text: '🚀 Welcome to Yaswant Code — Direct ZIP developer downloads & university study notes now available!',
    announcement_link: '#paths',
    announcement_btn_text: 'Explore Roadmaps →',
    platform_title: 'Yaswant Code',
    platform_tagline: 'Full-Stack Engineering & Cloud Architecture Learning Ecosystem',
    contact_email: 'ecotech.internship@gmail.com',
    support_phone: '+91 98765 43210',
    office_location: 'Tech Hub, Cyber City, Bangalore, India',
    github_url: 'https://github.com/Yaswant-pandey',
    youtube_url: 'https://youtube.com/@yaswantcode',
    linkedin_url: 'https://linkedin.com/in/yaswant-pandey',
    telegram_url: 'https://t.me/yaswantcode',
    maintenance_mode: '0',
    allow_registration: '1',
  });
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // Filtering states
  const [userSearch, setUserSearch] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'All' | 'student' | 'admin'>('All');
  const [userStatusFilter, setUserStatusFilter] = useState<'All' | 'active' | 'inactive'>('All');
  
  const [discussionSearch, setDiscussionSearch] = useState<string>('');
  const [discussionCategoryFilter, setDiscussionCategoryFilter] = useState<string>('All');
  const [noteSearch, setNoteSearch] = useState<string>('');
  const [selectedNoteCategory, setSelectedNoteCategory] = useState<string>('All');
  
  const [toolSearch, setToolSearch] = useState<string>('');
  const [selectedToolCategory, setSelectedToolCategory] = useState<string>('All');

  const [projectSearch, setProjectSearch] = useState<string>('');
  const [roadmapSearch, setRoadmapSearch] = useState<string>('');

  // ── Modals & Drawers State ──
  // Discussions Replies Modal
  const [activeDiscussionRepliesModal, setActiveDiscussionRepliesModal] = useState<AdminDiscussion | null>(null);
  const [discussionReplies, setDiscussionReplies] = useState<AdminDiscussionReply[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState<boolean>(false);

  // Database Optimization
  const [isOptimizingDb, setIsOptimizingDb] = useState<boolean>(false);
  const [dbOptimizationResults, setDbOptimizationResults] = useState<Record<string, string> | null>(null);

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'admin',
    title: ''
  });
  const [isSubmittingUser, setIsSubmittingUser] = useState<boolean>(false);

  // Study Note Modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<AdminNote | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    topic: '',
    category: 'System Design',
    resourceType: 'pdf',
    url: '',
    fileSize: '1.5 MB • 20p',
    thumbnail: NOTE_CATEGORY_THUMBNAILS['System Design'],
    description: '',
    author: 'Yaswant Pandey',
    pinned: false,
    starred: true,
    tags: 'Architecture, System Design'
  });
  const [isSubmittingNote, setIsSubmittingNote] = useState<boolean>(false);

  // Developer Tool Modal
  const [isToolModalOpen, setIsToolModalOpen] = useState<boolean>(false);
  const [editingTool, setEditingTool] = useState<AdminTool | null>(null);
  const [toolForm, setToolForm] = useState({
    name: '',
    tagline: '',
    description: '',
    category: 'DevOps & Docker',
    downloadType: 'zip',
    downloadUrl: '',
    fileSize: '15.0 MB • ZIP',
    version: 'v1.0.0',
    osSupport: ['Windows', 'macOS', 'Linux'],
    thumbnail: TOOL_CATEGORY_THUMBNAILS['DevOps & Docker'],
    author: 'Yaswant DevOps Team',
    featured: true
  });
  const [isSubmittingTool, setIsSubmittingTool] = useState<boolean>(false);

  // Project Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'Full-Stack',
    difficulty: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced',
    estimatedHours: 24,
    techStack: 'React, TypeScript, Node.js',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
    courseRelation: '',
    starterRepoCommand: '',
    liveDemoUrl: '',
    status: 'Available' as 'Available' | 'In Progress' | 'Completed',
    featured: true,
  });
  const [isSubmittingProject, setIsSubmittingProject] = useState<boolean>(false);

  // Roadmap Modal
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState<boolean>(false);
  const [editingRoadmap, setEditingRoadmap] = useState<AdminRoadmap | null>(null);
  const [roadmapStagesJson, setRoadmapStagesJson] = useState<string>('[]');
  const [stagesJsonError, setStagesJsonError] = useState<string | null>(null);
  const [roadmapModalTab, setRoadmapModalTab] = useState<'info' | 'curriculum'>('info');
  const [roadmapForm, setRoadmapForm] = useState({
    slug: '',
    title: '',
    subtitle: '',
    description: '',
    badge: 'Official Career Track',
    category: 'full-stack',
    categoryLabel: 'Full Stack Development',
    tagline: '',
    difficulty: 'Intermediate',
    duration: '6 months',
    weeklyCommitment: '10–15 hrs/week',
    totalTopics: 15,
    salaryBenchmark: '₹8–25 LPA',
    status: 'published',
    orderIndex: 0,
    careerRoles: 'Software Engineer, Full Stack Developer, Tech Lead',
  });
  const [isSubmittingRoadmap, setIsSubmittingRoadmap] = useState<boolean>(false);
  const [isSeedingRoadmaps, setIsSeedingRoadmaps] = useState<boolean>(false);

  // Inquiry View Modal
  const [activeInquiryModal, setActiveInquiryModal] = useState<AdminInquiry | null>(null);


  // Helper to retrieve valid Bearer session token
  const getAdminHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = tokenStorage.get();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }, []);

  const adminFetch = useCallback(async (action: string, options: RequestInit = {}) => {
    const authHeaders = await getAdminHeaders();
    return fetch(`/api/admin.php?action=${action}`, {
      ...options,
      headers: {
        ...authHeaders,
        ...(options.headers as Record<string, string> || {})
      }
    });
  }, [getAdminHeaders]);

  // Fetch Overview Data
  const fetchOverview = useCallback(async () => {
    try {
      const res = await adminFetch('overview');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) setOverview(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin overview:', err);
    }
  }, [adminFetch]);

  // Fetch Users List
  const fetchUsers = useCallback(async () => {
    try {
      const res = await adminFetch('users');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setUsersList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    }
  }, [adminFetch]);

  // Fetch Notes List
  const fetchNotes = useCallback(async () => {
    try {
      const res = await adminFetch('notes');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setNotesList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin notes:', err);
    }
  }, [adminFetch]);

  // Fetch Tools List
  const fetchTools = useCallback(async () => {
    try {
      const res = await adminFetch('tools');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setToolsList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin tools:', err);
    }
  }, [adminFetch]);

  // Fetch Inquiries List
  const fetchInquiries = useCallback(async () => {
    try {
      const res = await adminFetch('inquiries');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setInquiriesList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin inquiries:', err);
    }
  }, [adminFetch]);

  // Fetch Subscribers List
  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await adminFetch('subscribers');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setSubscribersList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin subscribers:', err);
    }
  }, [adminFetch]);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await adminFetch('settings');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSiteSettings(prev => ({ ...prev, ...json.data }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch site settings:', err);
    }
  }, [adminFetch]);

  // Fetch Database Diagnostics
  const fetchDbStats = useCallback(async () => {
    try {
      const res = await adminFetch('db_stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && Array.isArray(json.data.tables)) {
          setDbTables(json.data.tables);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin db stats:', err);
    }
  }, [adminFetch]);

  // Fetch Projects List
  const fetchProjects = useCallback(async () => {
    try {
      const res = await adminFetch('projects');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setProjectsList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin projects:', err);
    }
  }, [adminFetch]);

  // Fetch Roadmaps List
  const fetchRoadmaps = useCallback(async () => {
    try {
      const res = await adminFetch('roadmaps');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setRoadmapsList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin roadmaps:', err);
    }
  }, [adminFetch]);

  // Fetch Discussions List
  const fetchDiscussions = useCallback(async () => {
    try {
      const res = await adminFetch('discussions');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setDiscussionsList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin discussions:', err);
    }
  }, [adminFetch]);

  // Refresh all data
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchOverview(),
      fetchUsers(),
      fetchDiscussions(),
      fetchNotes(),
      fetchTools(),
      fetchProjects(),
      fetchRoadmaps(),
      fetchSettings(),
      fetchInquiries(),
      fetchSubscribers(),
      fetchDbStats()
    ]);
    setIsRefreshing(false);
    setLastSynced(new Date().toLocaleTimeString());
    addToast('Admin Data Synced', 'Live records loaded directly from Hostinger MySQL.', 'success');
  };

  // Initial load
  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchOverview(),
        fetchUsers(),
        fetchDiscussions(),
        fetchNotes(),
        fetchTools(),
        fetchProjects(),
        fetchRoadmaps(),
        fetchSettings(),
        fetchInquiries(),
        fetchSubscribers(),
        fetchDbStats()
      ]);
      setIsLoading(false);
      setLastSynced(new Date().toLocaleTimeString());
    };
    loadInitial();
  }, [fetchOverview, fetchUsers, fetchDiscussions, fetchNotes, fetchTools, fetchProjects, fetchRoadmaps, fetchSettings, fetchInquiries, fetchSubscribers, fetchDbStats]);

  // ── LMS ACTION HANDLERS ────────────────────────────────────────────────────
  // Discussions Moderation Handlers
  const handleToggleDiscussionSolution = async (id: string) => {
    try {
      const res = await adminFetch('toggle_discussion_solution', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setDiscussionsList(prev => prev.map(d => d.id === id ? { ...d, hasAcceptedAnswer: !d.hasAcceptedAnswer } : d));
        addToast('Updated', 'Discussion solution status updated', 'success');
      }
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleDeleteDiscussion = async (id: string, title: string) => {
    if (!window.confirm(`Delete discussion topic "${title}"?`)) return;
    try {
      const res = await adminFetch('delete_discussion', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        addToast('Deleted', 'Discussion thread removed', 'success');
        fetchDiscussions();
        fetchOverview();
      }
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleOpenDiscussionReplies = async (disc: AdminDiscussion) => {
    setActiveDiscussionRepliesModal(disc);
    setIsLoadingReplies(true);
    try {
      const res = await adminFetch(`discussion_replies&discussion_id=${disc.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setDiscussionReplies(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleDeleteDiscussionReply = async (replyId: string) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      const res = await adminFetch('delete_discussion_reply', {
        method: 'POST',
        body: JSON.stringify({ id: replyId })
      });
      if (res.ok) {
        setDiscussionReplies(prev => prev.filter(r => r.id !== replyId));
        addToast('Deleted', 'Reply removed', 'success');
        fetchDiscussions();
      }
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleOptimizeTables = async () => {
    setIsOptimizingDb(true);
    try {
      const res = await adminFetch('optimize_tables', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.success) {
        setDbOptimizationResults(json.data?.results || {});
        addToast('Optimization Complete', 'All database tables inspected & verified', 'success');
        fetchDbStats();
      }
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    } finally {
      setIsOptimizingDb(false);
    }
  };

  // ── STUDY NOTES ACTIONS ───────────────────────────────────────────────────
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.url.trim()) {
      addToast('Validation Error', 'Note title and URL are required.', 'warning');
      return;
    }
    setIsSubmittingNote(true);
    try {
      const isEditing = Boolean(editingNote);
      const action = isEditing ? 'update_note' : 'create_note';
      const payload = {
        ...(isEditing ? { id: editingNote?.id } : {}),
        title: noteForm.title,
        topic: noteForm.topic,
        category: noteForm.category,
        resourceType: noteForm.resourceType,
        url: noteForm.url,
        fileSize: noteForm.fileSize,
        thumbnail: noteForm.thumbnail,
        description: noteForm.description,
        author: noteForm.author,
        pinned: noteForm.pinned,
        starred: noteForm.starred,
        tags: noteForm.tags
      };

      const res = await adminFetch(action, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(isEditing ? 'Note Updated' : 'Note Published', `${noteForm.title} successfully saved.`, 'success');
        setIsNoteModalOpen(false);
        setEditingNote(null);
        fetchNotes();
        fetchOverview();
      } else {
        addToast('Action Failed', data.error || 'Could not save note.', 'warning');
      }
    } catch {
      addToast('Network Error', 'Failed to connect to API.', 'warning');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleOpenEditNote = (n: AdminNote) => {
    setEditingNote(n);
    setNoteForm({
      title: n.title,
      topic: n.topic || n.courseOrTopic || '',
      category: n.category,
      resourceType: n.resourceType,
      url: n.url,
      fileSize: n.fileSize,
      thumbnail: n.thumbnail,
      description: n.description,
      author: n.author,
      pinned: n.pinned,
      starred: n.starred,
      tags: Array.isArray(n.tags) ? n.tags.join(', ') : (n.tags || '')
    });
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = async (id: string, title: string) => {
    if (!window.confirm(`Delete note "${title}"?`)) return;
    try {
      const res = await adminFetch('delete_note', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotesList(prev => prev.filter(n => n.id !== id));
        addToast('Note Deleted', `"${title}" has been removed.`, 'info');
        fetchOverview();
      }
    } catch {
      addToast('Error', 'Failed to delete note.', 'warning');
    }
  };

  // ── DEVELOPER TOOLS ACTIONS ───────────────────────────────────────────────
  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolForm.name.trim() || !toolForm.downloadUrl.trim()) {
      addToast('Validation Error', 'Tool name and download URL are required.', 'warning');
      return;
    }
    setIsSubmittingTool(true);
    try {
      const isEditing = Boolean(editingTool);
      const action = isEditing ? 'update_tool' : 'create_tool';
      const payload = {
        ...(isEditing ? { id: editingTool?.id } : {}),
        name: toolForm.name,
        tagline: toolForm.tagline,
        description: toolForm.description,
        category: toolForm.category,
        downloadType: toolForm.downloadType,
        downloadUrl: toolForm.downloadUrl,
        fileSize: toolForm.fileSize,
        version: toolForm.version,
        osSupport: toolForm.osSupport,
        thumbnail: toolForm.thumbnail,
        author: toolForm.author,
        featured: toolForm.featured
      };

      const res = await adminFetch(action, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(isEditing ? 'Tool Updated' : 'Tool Published', `${toolForm.name} successfully saved.`, 'success');
        setIsToolModalOpen(false);
        setEditingTool(null);
        fetchTools();
        fetchOverview();
      } else {
        addToast('Action Failed', data.error || 'Could not save tool.', 'warning');
      }
    } catch {
      addToast('Network Error', 'Failed to connect to API.', 'warning');
    } finally {
      setIsSubmittingTool(false);
    }
  };

  const handleOpenEditTool = (t: AdminTool) => {
    setEditingTool(t);
    setToolForm({
      name: t.name,
      tagline: t.tagline,
      description: t.description,
      category: t.category,
      downloadType: t.downloadType,
      downloadUrl: t.downloadUrl,
      fileSize: t.fileSize,
      version: t.version,
      osSupport: t.osSupport,
      thumbnail: t.thumbnail,
      author: t.author,
      featured: t.featured
    });
    setIsToolModalOpen(true);
  };

  const handleDeleteTool = async (id: string, name: string) => {
    if (!window.confirm(`Delete developer tool "${name}"?`)) return;
    try {
      const res = await adminFetch('delete_tool', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setToolsList(prev => prev.filter(t => t.id !== id));
        addToast('Tool Deleted', `"${name}" removed from downloads catalog.`, 'info');
        fetchOverview();
      }
    } catch {
      addToast('Error', 'Failed to delete tool.', 'warning');
    }
  };

  // ── USER MANAGEMENT ACTIONS ───────────────────────────────────────────────
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim() || !newUserForm.password.trim()) {
      addToast('Validation Error', 'Please provide name, email, and password.', 'warning');
      return;
    }
    setIsSubmittingUser(true);
    try {
      const res = await adminFetch('create_user', {
        method: 'POST',
        body: JSON.stringify(newUserForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('User Created', `User ${newUserForm.name} added as ${newUserForm.role}.`, 'success');
        setIsAddUserModalOpen(false);
        setNewUserForm({ name: '', email: '', password: '', role: 'student', title: '' });
        fetchUsers();
        fetchOverview();
      } else {
        addToast('Creation Failed', data.error || 'Could not create user account.', 'warning');
      }
    } catch {
      addToast('Network Error', 'Failed to connect to API server.', 'warning');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'student' | 'admin') => {
    try {
      const res = await adminFetch('update_user', {
        method: 'POST',
        body: JSON.stringify({ id: userId, role: newRole })
      });
      if (res.ok) {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        addToast('Role Updated', `User permissions changed to ${newRole}.`, 'success');
        fetchOverview();
      }
    } catch {
      addToast('Error', 'Failed to update user role.', 'warning');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    try {
      const res = await adminFetch('update_user', {
        method: 'POST',
        body: JSON.stringify({ id: userId, isActive: nextStatus })
      });
      if (res.ok) {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isActive: nextStatus } : u));
        addToast(nextStatus ? 'User Activated' : 'User Deactivated', nextStatus ? 'User can now sign in.' : 'Account disabled.', 'info');
        fetchOverview();
      }
    } catch {
      addToast('Error', 'Failed to toggle user status.', 'warning');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Permanently delete user "${userName}"?`)) return;
    try {
      const res = await adminFetch('delete_user', {
        method: 'POST',
        body: JSON.stringify({ id: userId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersList(prev => prev.filter(u => u.id !== userId));
        addToast('User Deleted', `User ${userName} has been removed.`, 'info');
        fetchOverview();
      } else {
        addToast('Action Blocked', data.error || 'Cannot delete user.', 'warning');
      }
    } catch {
      addToast('Error', 'Failed to delete user.', 'warning');
    }
  };

  // ── INQUIRIES & SUBSCRIBERS ACTIONS ───────────────────────────────────────
  const handleDeleteInquiry = async (id: number) => {
    try {
      const res = await adminFetch('delete_inquiry', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setInquiriesList(prev => prev.filter(i => i.id !== id));
        addToast('Inquiry Removed', 'Message deleted from inbox.', 'info');
        if (activeInquiryModal?.id === id) setActiveInquiryModal(null);
        fetchOverview();
      }
    } catch {
      addToast('Error', 'Failed to delete inquiry.', 'warning');
    }
  };

  const handleCopyEmails = () => {
    const emails = subscribersList
      .filter(s => s.is_active)
      .map(s => s.email)
      .join(', ');
    if (!emails) {
      addToast('No Subscribers', 'No active subscriber emails to copy.', 'info');
      return;
    }
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 3000);
    addToast('Emails Copied', `${subscribersList.length} subscriber email(s) copied to clipboard.`, 'success');
  };

  // ── SITE SETTINGS ACTIONS ─────────────────────────────────────────────────
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await adminFetch('update_settings', {
        method: 'POST',
        body: JSON.stringify(siteSettings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Settings Saved', 'Platform announcement banner and configuration updated in MariaDB.', 'success');
      } else {
        addToast('Save Failed', data.error || 'Could not update settings.', 'warning');
      }
    } catch {
      addToast('Error', 'Failed to connect to API.', 'warning');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Filtered lists
  const filteredUsers = usersList.filter(u => {
    if (selectedRoleFilter !== 'All' && u.role !== selectedRoleFilter) return false;
    if (userStatusFilter === 'active' && !u.isActive) return false;
    if (userStatusFilter === 'inactive' && u.isActive) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.title && u.title.toLowerCase().includes(q));
    }
    return true;
  });

  const filteredNotes = notesList.filter(n => {
    if (selectedNoteCategory !== 'All' && n.category !== selectedNoteCategory) return false;
    if (noteSearch.trim()) {
      const q = noteSearch.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.topic.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredTools = toolsList.filter(t => {
    if (selectedToolCategory !== 'All' && t.category !== selectedToolCategory) return false;
    if (toolSearch.trim()) {
      const q = toolSearch.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredProjects = projectsList.filter(p => {
    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredRoadmaps = roadmapsList.filter(r => {
    if (roadmapSearch.trim()) {
      const q = roadmapSearch.toLowerCase();
      return (
        (r.title || '').toLowerCase().includes(q) ||
        (r.slug || '').toLowerCase().includes(q) ||
        (r.categoryLabel || '').toLowerCase().includes(q) ||
        (r.category || '').toLowerCase().includes(q) ||
        (r.badge || '').toLowerCase().includes(q) ||
        (r.subtitle || '').toLowerCase().includes(q) ||
        (r.tagline || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredDiscussions = discussionsList.filter(d => {
    if (discussionCategoryFilter !== 'All' && d.category !== discussionCategoryFilter) return false;
    if (discussionSearch.trim()) {
      const s = discussionSearch.toLowerCase();
      return (
        d.title.toLowerCase().includes(s) ||
        d.content.toLowerCase().includes(s) ||
        d.authorName.toLowerCase().includes(s) ||
        d.courseTitle.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ── Top Header & Mission Control Bar ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live Production Control Center
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              MariaDB ({overview?.database?.database || 'u865909543_freefund'})
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Platform Administration & Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
            Directly govern all aspects of Yaswant Code: Discussions, Notes, Tools, Projects, Roadmaps, Users, and Settings.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            title="Reload live database records"
          >
            {isRefreshing ? 'Syncing...' : 'Sync Database'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.hash = '';
              setCurrentView('landing');
            }}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Exit to Student Site
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              tokenStorage.remove();
              window.location.hash = '';
              setCurrentView('landing');
            }}
            icon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* ── Global Bento KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <BentoCard
          title="Total Users"
          value={overview?.users?.total ?? usersList.length}
          subtitle={`${overview?.users?.active ?? usersList.filter(u=>u.isActive).length} active`}
          change={{ value: `${overview?.users?.students ?? 0} students`, trend: 'up' }}
          icon={<Users className="w-5 h-5 text-blue-500" />}
          onClick={() => setActiveTab('users')}
        />
        <BentoCard
          title="Discussions"
          value={overview?.discussions?.total ?? discussionsList.length}
          subtitle={`${overview?.discussions?.unresolved ?? 0} open`}
          change={{ value: 'Forum topics', trend: 'neutral' }}
          icon={<MessageCircle className="w-5 h-5 text-pink-500" />}
          onClick={() => setActiveTab('discussions')}
        />
        <BentoCard
          title="Study Notes"
          value={overview?.notes?.total ?? notesList.length}
          subtitle={`${overview?.notes?.pdf ?? 0} PDFs`}
          change={{ value: `${overview?.notes?.drive ?? 0} Drive`, trend: 'up' }}
          icon={<FileText className="w-5 h-5 text-teal-500" />}
          onClick={() => setActiveTab('notes')}
        />
        <BentoCard
          title="Dev Tools"
          value={overview?.tools?.total ?? toolsList.length}
          subtitle={`${overview?.tools?.zip ?? 0} ZIPs`}
          change={{ value: `${overview?.tools?.drive ?? 0} Drive`, trend: 'up' }}
          icon={<Wrench className="w-5 h-5 text-indigo-500" />}
          onClick={() => setActiveTab('tools')}
        />
      </div>

      {/* ── Tabs Navigation ─────────────────────────────────────────────── */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-3 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: Activity, count: null },
          { id: 'discussions', label: 'Discussions', icon: MessageCircle, count: discussionsList.length },
          { id: 'notes', label: 'Study Notes', icon: FileText, count: notesList.length },
          { id: 'tools', label: 'Dev Tools', icon: Wrench, count: toolsList.length },
          { id: 'projects', label: 'Projects', icon: FolderGit2, count: projectsList.length },
          { id: 'roadmaps', label: 'Roadmaps', icon: Map, count: roadmapsList.length },
          { id: 'users', label: 'Users', icon: Users, count: usersList.length },
          { id: 'settings', label: 'Settings', icon: SettingsIcon, count: null },
          { id: 'inquiries', label: 'Inquiries', icon: MessageSquare, count: inquiriesList.length },
          { id: 'subscribers', label: 'Newsletter', icon: Mail, count: subscribersList.length },
          { id: 'notifications', label: 'Push Notify', icon: Radio, count: null },
          { id: 'database', label: 'DB Health', icon: Database, count: dbTables.length ? `${dbTables.length} tables` : null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 transition-colors relative flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-neutral-950 dark:text-white font-bold'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  isActive 
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                }`}>
                  {tab.count}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW & PLATFORM PULSE ─────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Server & DB Telemetry Banner */}
          <GlassCard className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm" icon={<Server className="w-3 h-3" />}>
                    MariaDB 11.8 Online
                  </Badge>
                  <span className="text-xs text-neutral-400 font-mono">PHP {overview?.database?.php_version || '8.3'}</span>
                  <span className="text-neutral-300 dark:text-neutral-700">•</span>
                  <span className="text-xs text-emerald-500 font-semibold">Synced: {lastSynced}</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Database: <span className="font-mono text-indigo-600 dark:text-indigo-400">{overview?.database?.database || 'u865909543_freefund'}</span>
                </h3>
                <p className="text-xs text-neutral-500 max-w-xl">
                  Hostinger MariaDB connected with schemas for users, study notes, developer tools, projects, roadmaps, site settings, and subscribers.
                </p>
              </div>

              {/* Quick Action Launchers */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingNote(null);
                    setNoteForm({
                      title: '',
                      topic: '',
                      category: 'System Design',
                      resourceType: 'pdf',
                      url: '',
                      fileSize: '1.5 MB • 20p',
                      thumbnail: NOTE_CATEGORY_THUMBNAILS['System Design'],
                      description: '',
                      author: 'Yaswant Pandey',
                      pinned: false,
                      starred: true,
                      tags: 'Architecture, Notes'
                    });
                    setIsNoteModalOpen(true);
                  }}
                  icon={<FileText className="w-3.5 h-3.5 text-emerald-500" />}
                >
                  Add Note
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingTool(null);
                    setToolForm({
                      name: '',
                      tagline: '',
                      description: '',
                      category: 'DevOps & Docker',
                      downloadType: 'zip',
                      downloadUrl: '',
                      fileSize: '15.0 MB • ZIP',
                      version: 'v1.0.0',
                      osSupport: ['Windows', 'macOS', 'Linux'],
                      thumbnail: TOOL_CATEGORY_THUMBNAILS['DevOps & Docker'],
                      author: 'Yaswant DevOps Team',
                      featured: true
                    });
                    setIsToolModalOpen(true);
                  }}
                  icon={<Wrench className="w-3.5 h-3.5 text-amber-500" />}
                >
                  Publish Tool
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('settings')}
                  icon={<SettingsIcon className="w-3.5 h-3.5" />}
                >
                  Site Settings
                </Button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Students</span>
                <div className="text-2xl font-black text-neutral-900 dark:text-white">
                  {overview?.users?.students ?? 0}
                </div>
                <span className="text-[11px] text-neutral-400">Student accounts</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Projects</span>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  {projectsList.length}
                </div>
                <span className="text-[11px] text-neutral-400">Capstone projects</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Study Notes & PDFs</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {overview?.notes?.total ?? notesList.length}
                </div>
                <span className="text-[11px] text-neutral-400">Available for download</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Developer Tools</span>
                <div className="text-2xl font-black text-amber-500">
                  {overview?.tools?.total ?? toolsList.length}
                </div>
                <span className="text-[11px] text-neutral-400">ZIP & Drive tools</span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Shortcuts: Recent Notes, Tools & Messages */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Notes */}
            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  Recent Study Notes
                </h4>
                <button onClick={() => setActiveTab('notes')} className="text-xs text-indigo-500 hover:underline">
                  View All ({notesList.length}) →
                </button>
              </div>
              <div className="space-y-2">
                {notesList.slice(0, 3).map(n => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 flex items-center gap-3 border border-neutral-200/50 dark:border-neutral-750">
                    <img src={n.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">{n.title}</div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-2">
                        <span className="capitalize">{n.resourceType.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{n.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Recent Developer Tools */}
            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-500" />
                  Recent Developer Tools
                </h4>
                <button onClick={() => setActiveTab('tools')} className="text-xs text-indigo-500 hover:underline">
                  View All ({toolsList.length}) →
                </button>
              </div>
              <div className="space-y-2">
                {toolsList.slice(0, 3).map(t => (
                  <div key={t.id} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 flex items-center gap-3 border border-neutral-200/50 dark:border-neutral-750">
                    <img src={t.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">{t.name}</div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-2">
                        <span className="uppercase font-semibold">{t.downloadType}</span>
                        <span>•</span>
                        <span>{t.fileSize}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Recent Contact Inquiries */}
            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                  Recent Inquiries
                </h4>
                <button onClick={() => setActiveTab('inquiries')} className="text-xs text-indigo-500 hover:underline">
                  View Inbox ({inquiriesList.length}) →
                </button>
              </div>
              <div className="space-y-2">
                {inquiriesList.slice(0, 3).map(inq => (
                  <div key={inq.id} onClick={() => setActiveInquiryModal(inq)} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 cursor-pointer hover:border-indigo-500 border border-neutral-200/50 dark:border-neutral-750 transition-colors">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">{inq.subject}</div>
                    <div className="text-[11px] text-neutral-400 truncate">From: {inq.name}</div>
                  </div>
                ))}
                {inquiriesList.length === 0 && (
                  <div className="text-xs text-neutral-400 italic p-4 text-center">No pending inquiries.</div>
                )}
              </div>
            </GlassCard>

          </div>
        </div>
      )}

      {/* ── TAB: COMMUNITY DISCUSSIONS ───────────────────────────────────── */}
      {activeTab === 'discussions' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={discussionSearch}
                  onChange={(e) => setDiscussionSearch(e.target.value)}
                  placeholder="Search forum topics, questions, authors..."
                  className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={discussionCategoryFilter}
                onChange={(e) => setDiscussionCategoryFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-medium"
              >
                {['All', 'General', 'Frontend', 'Backend', 'AI & ML', 'Architecture'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="text-xs font-mono text-neutral-500">
              {discussionsList.length} Threads • {discussionsList.filter(d => !d.hasAcceptedAnswer).length} Open
            </div>
          </div>

          <div className="space-y-3">
            {filteredDiscussions.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                No discussion threads match the criteria.
              </div>
            ) : (
              filteredDiscussions.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl border bg-neutral-50 dark:bg-neutral-850/70 border-neutral-200 dark:border-neutral-750 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple" size="sm">{d.category}</Badge>
                      <Badge variant={d.hasAcceptedAnswer ? 'success' : 'neutral'} size="sm">
                        {d.hasAcceptedAnswer ? '✓ Solved' : 'Open Question'}
                      </Badge>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {d.title}
                    </h4>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 max-w-2xl">
                      {d.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-mono">
                      <span>By: <strong className="text-neutral-700 dark:text-neutral-300">{d.authorName}</strong></span>
                      <span>•</span>
                      <span>▲ {d.upvotes} upvotes</span>
                      <span>•</span>
                      <span>💬 {d.repliesCount} replies</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDiscussionReplies(d)}
                      icon={<MessageCircle className="w-3.5 h-3.5" />}
                    >
                      Replies ({d.repliesCount})
                    </Button>

                    <Button
                      variant={d.hasAcceptedAnswer ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleDiscussionSolution(d.id)}
                    >
                      {d.hasAcceptedAnswer ? 'Mark Open' : 'Mark Solved'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDiscussion(d.id, d.title)}
                      className="text-rose-500 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      )}

      {/* ── TAB 3: STUDY NOTES MANAGEMENT ────────────────────────────────── */}
      {activeTab === 'notes' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  placeholder="Search notes by title, topic, or description..."
                  className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedNoteCategory}
                onChange={(e) => setSelectedNoteCategory(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-medium"
              >
                {['All', 'System Design', 'React & Web', 'Distributed Systems', 'Databases & SQL', 'Machine Learning', 'DevOps & Cloud', 'General'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingNote(null);
                setNoteForm({
                  title: '',
                  topic: '',
                  category: 'System Design',
                  resourceType: 'pdf',
                  url: '',
                  fileSize: '1.5 MB • 20p',
                  thumbnail: NOTE_CATEGORY_THUMBNAILS['System Design'],
                  description: '',
                  author: 'Yaswant Pandey',
                  pinned: false,
                  starred: true,
                  tags: 'Architecture, Notes'
                });
                setIsNoteModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Study Note
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full p-12 text-center text-xs text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                No study notes match the query.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden aspect-[16/9] border border-neutral-200/60 dark:border-neutral-700">
                      <img src={note.thumbnail} alt={note.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <Badge variant="purple" size="sm">{note.category}</Badge>
                        <Badge variant="neutral" size="sm" className="bg-black/60 text-white backdrop-blur-sm uppercase">
                          {note.resourceType.replace('_', ' ')}
                        </Badge>
                      </div>
                      {note.pinned && (
                        <span className="absolute top-2 right-2 p-1.5 rounded-lg bg-indigo-600 text-white shadow-md">
                          <Pin className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
                        {note.title}
                      </h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                        {note.topic || note.courseOrTopic || 'General Study Material'}
                      </p>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                        {note.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-750 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-neutral-400 font-mono">{note.fileSize}</span>
                    <div className="flex items-center gap-1">
                      <a
                        href={note.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                        title="Open Resource"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditNote(note)}
                        className="text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id, note.title)}
                        className="text-xs text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      )}

      {/* ── TAB 4: DEVELOPER TOOLS MANAGEMENT ────────────────────────────── */}
      {activeTab === 'tools' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={toolSearch}
                  onChange={(e) => setToolSearch(e.target.value)}
                  placeholder="Search tools by name, category, or features..."
                  className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={selectedToolCategory}
                onChange={(e) => setSelectedToolCategory(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-medium"
              >
                {['All', 'DevOps & Docker', 'IDE & Editors', 'Database GUI', 'API & Backend', 'Full-Stack Kits', 'Utilities'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingTool(null);
                setToolForm({
                  name: '',
                  tagline: '',
                  description: '',
                  category: 'DevOps & Docker',
                  downloadType: 'zip',
                  downloadUrl: '',
                  fileSize: '15.0 MB • ZIP',
                  version: 'v1.0.0',
                  osSupport: ['Windows', 'macOS', 'Linux'],
                  thumbnail: TOOL_CATEGORY_THUMBNAILS['DevOps & Docker'],
                  author: 'Yaswant DevOps Team',
                  featured: true
                });
                setIsToolModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Developer Tool
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.length === 0 ? (
              <div className="col-span-full p-12 text-center text-xs text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                No developer tools match the query.
              </div>
            ) : (
              filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <img src={tool.thumbnail} alt={tool.name} className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {tool.name}
                        </h4>
                        <span className="text-[10px] text-indigo-500 font-semibold">{tool.category}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 italic font-medium">
                      "{tool.tagline}"
                    </p>
                    <p className="text-[11px] text-neutral-400 line-clamp-2">
                      {tool.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      <Badge variant="outline" size="sm" className="font-mono text-[9px] uppercase">
                        {tool.downloadType}
                      </Badge>
                      <Badge variant="neutral" size="sm" className="font-mono text-[9px]">
                        {tool.version}
                      </Badge>
                      <Badge variant="neutral" size="sm" className="font-mono text-[9px]">
                        {tool.fileSize}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-750 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-neutral-400 font-mono">{tool.downloadsCount} downloads</span>
                    <div className="flex items-center gap-1">
                      <a
                        href={tool.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                        title="Download Link"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditTool(tool)}
                        className="text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTool(tool.id, tool.name)}
                        className="text-xs text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      )}

      {/* ── TAB 5: USERS DIRECTORY & PROVISIONING ────────────────────────── */}
      {activeTab === 'users' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, or title..."
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-850 p-1 rounded-xl border border-neutral-200 dark:border-neutral-750">
                {(['All', 'student', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      selectedRoleFilter === r
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-850 p-1 rounded-xl border border-neutral-200 dark:border-neutral-750">
                {(['All', 'active', 'inactive'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setUserStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      userStatusFilter === s
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddUserModalOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add User
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="pb-3 font-semibold">User / Profile</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Activity</th>
                  <th className="pb-3 font-semibold">Created</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500">
                      No users match the search filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/40 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-neutral-750"
                          />
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                              {u.name}
                              {u.role === 'admin' && (
                                <ShieldCheck className="w-3.5 h-3.5 text-rose-500 inline" title="Administrator" />
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">{u.email}</div>
                            {u.title && (
                              <div className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-0.5 font-medium">
                                {u.title}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 pr-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value as any)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-semibold bg-white dark:bg-neutral-900 cursor-pointer focus:outline-none ${
                            u.role === 'admin'
                              ? 'border-amber-500/30 text-amber-600 dark:text-amber-400'
                              : 'border-blue-500/30 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="py-3.5 pr-4">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                          className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                          title="Click to toggle user status"
                        >
                          <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                          <span className={`font-semibold ${u.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>

                      <td className="py-3.5 pr-4 text-neutral-600 dark:text-neutral-400">
                        {u.role === 'admin' ? (
                          <span className="font-mono text-[11px] text-amber-500 font-semibold">Staff Admin</span>
                        ) : (
                          <span className="font-mono text-[11px]">Student</span>
                        )}
                      </td>

                      <td className="py-3.5 pr-4 text-neutral-400 font-mono text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Seed'}
                      </td>

                      <td className="py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                            className="text-xs"
                            title={u.isActive ? "Deactivate user" : "Activate user"}
                          >
                            {u.isActive ? <UserX className="w-3.5 h-3.5 text-neutral-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-500" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="text-xs text-rose-500 hover:text-rose-600"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* ── TAB 6: SITE SETTINGS & ANNOUNCEMENT BANNER ────────────────────── */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <GlassCard className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  Website Settings & Announcements
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Changes made here are permanently stored in the MariaDB database and immediately broadcasted to all visitors.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingSettings}
                icon={<Save className="w-3.5 h-3.5" />}
              >
                Save All Settings
              </Button>
            </div>

            {/* Announcement Banner Section */}
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/80 border border-neutral-200 dark:border-neutral-750 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Global Top Announcement Banner
                  </h4>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteSettings.announcement_enabled === '1'}
                    onChange={(e) => setSiteSettings({ ...siteSettings, announcement_enabled: e.target.checked ? '1' : '0' })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{siteSettings.announcement_enabled === '1' ? 'Banner Enabled (Active)' : 'Banner Disabled'}</span>
                </label>
              </div>

              {/* Banner Live Preview */}
              <div className="p-3 rounded-xl bg-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 font-bold uppercase text-[10px] tracking-wider">
                    {siteSettings.announcement_badge || 'NEW'}
                  </span>
                  <span>{siteSettings.announcement_text || 'Announcement message preview...'}</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-white text-indigo-950 font-bold text-[11px] shrink-0">
                  {siteSettings.announcement_btn_text || 'Action →'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={siteSettings.announcement_badge}
                    onChange={(e) => setSiteSettings({ ...siteSettings, announcement_badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. NEW RELEASE"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Announcement Message Text
                  </label>
                  <input
                    type="text"
                    value={siteSettings.announcement_text}
                    onChange={(e) => setSiteSettings({ ...siteSettings, announcement_text: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter broadcast announcement message..."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={siteSettings.announcement_btn_text}
                    onChange={(e) => setSiteSettings({ ...siteSettings, announcement_btn_text: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Explore Roadmaps →"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Button Destination URL / Route
                  </label>
                  <input
                    type="text"
                    value={siteSettings.announcement_link}
                    onChange={(e) => setSiteSettings({ ...siteSettings, announcement_link: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. #paths, #notes, #tools, or https://..."
                  />
                </div>
              </div>
            </div>

            {/* Platform Branding & Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 space-y-3">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  Platform Identity
                </h4>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Platform Title
                  </label>
                  <input
                    type="text"
                    value={siteSettings.platform_title}
                    onChange={(e) => setSiteSettings({ ...siteSettings, platform_title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={siteSettings.platform_tagline}
                    onChange={(e) => setSiteSettings({ ...siteSettings, platform_tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 space-y-3">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-500" />
                  Support & Contact Info
                </h4>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Official Support Email
                  </label>
                  <input
                    type="email"
                    value={siteSettings.contact_email}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Helpline Phone
                  </label>
                  <input
                    type="text"
                    value={siteSettings.support_phone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, support_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Social & Community Links */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 space-y-3 text-xs">
              <h4 className="font-bold text-neutral-900 dark:text-white">
                Social Media & Community Links
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={siteSettings.github_url}
                    onChange={(e) => setSiteSettings({ ...siteSettings, github_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">YouTube Channel</label>
                  <input
                    type="url"
                    value={siteSettings.youtube_url}
                    onChange={(e) => setSiteSettings({ ...siteSettings, youtube_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={siteSettings.linkedin_url}
                    onChange={(e) => setSiteSettings({ ...siteSettings, linkedin_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Telegram Community</label>
                  <input
                    type="url"
                    value={siteSettings.telegram_url}
                    onChange={(e) => setSiteSettings({ ...siteSettings, telegram_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingSettings}
                icon={<Save className="w-3.5 h-3.5" />}
              >
                Save All Settings
              </Button>
            </div>
          </GlassCard>
        </form>
      )}

      {/* ── TAB 7: CONTACT FORM INQUIRIES ────────────────────────────────── */}
      {activeTab === 'inquiries' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Contact Messages & Inquiries ({inquiriesList.length})
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Submissions captured through the website contact form and saved to MariaDB.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInquiries}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Inbox
            </Button>
          </div>

          {inquiriesList.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 space-y-2 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <MessageSquare className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-700" />
              <p className="text-sm font-semibold">No messages received yet.</p>
              <p className="text-xs text-neutral-500">Contact form submissions from visitors will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiriesList.map((inq) => (
                <div
                  key={inq.id}
                  className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/80 border border-neutral-200 dark:border-neutral-750 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/60 dark:border-neutral-800 pb-3">
                    <div>
                      <div className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        {inq.subject}
                        {inq.course && (
                          <Badge variant="purple" size="sm">Course: {inq.course}</Badge>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        From: <strong className="text-neutral-800 dark:text-neutral-200">{inq.name}</strong> ({inq.email})
                        {inq.phone && ` • Phone: ${inq.phone}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-neutral-400">
                        {inq.created_at ? new Date(inq.created_at).toLocaleString() : ''}
                      </span>
                      <a
                        href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90"
                      >
                        <Mail className="w-3 h-3" />
                        Reply
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInquiry(inq.id)}
                        className="text-rose-500 hover:text-rose-600"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap font-sans bg-white/50 dark:bg-neutral-900/50 p-3.5 rounded-xl border border-neutral-200/40 dark:border-neutral-800/40">
                    {inq.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* ── TAB 8: NEWSLETTER AUDIENCE ──────────────────────────────────── */}
      {activeTab === 'subscribers' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Newsletter Subscribers ({subscribersList.length})
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Audience captured via the footer and landing page newsletter opt-in forms.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyEmails}
                icon={copiedEmails ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedEmails ? 'Copied!' : 'Copy Active Emails'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchSubscribers}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Refresh
              </Button>
            </div>
          </div>

          {subscribersList.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 space-y-2 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <Mail className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-700" />
              <p className="text-sm font-semibold">No subscribers yet.</p>
              <p className="text-xs text-neutral-500">Subscribers who sign up via the website footer will be listed here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="pb-3 font-semibold">Email Address</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Subscribed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                  {subscribersList.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/40">
                      <td className="py-3 font-mono font-bold text-neutral-900 dark:text-white">
                        {s.email}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1.5 font-semibold text-[11px] ${
                          s.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                          {s.is_active ? 'Active' : 'Unsubscribed'}
                        </span>
                      </td>
                      <td className="py-3 text-neutral-400 font-mono text-[11px]">
                        {s.subscribed_at ? new Date(s.subscribed_at).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {/* ── TAB: PUSH NOTIFICATIONS ─────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <PushNotificationsPanel />
      )}

      {/* ── TAB 9: DATABASE HEALTH & TABLES INSPECTOR ────────────────────── */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  MariaDB Table Inspector ({dbTables.length} Tables)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Live schemas inside database <code className="font-mono text-indigo-500 font-bold">u865909543_freefund</code>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOptimizeTables}
                  isLoading={isOptimizingDb}
                  icon={<Cpu className="w-3.5 h-3.5" />}
                >
                  Optimize & Verify Tables
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={fetchDbStats}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Refresh Schemas
                </Button>
              </div>
            </div>

            {dbOptimizationResults && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Table Integrity & Defragmentation Report
                  </span>
                  <button onClick={() => setDbOptimizationResults(null)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs">Dismiss</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  {Object.entries(dbOptimizationResults).map(([tName, tStatus]) => (
                    <div key={tName} className="p-2 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                      <span className="truncate text-neutral-700 dark:text-neutral-300 font-medium">{tName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">{tStatus}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dbTables.map((tbl) => (
                <div
                  key={tbl.name}
                  className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                      {tbl.name}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {tbl.size_mb ? `${tbl.size_mb} MB` : 'In-memory'}
                    </div>
                  </div>

                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {tbl.rows_count.toLocaleString()} rows
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT STUDY NOTE ─────────────────────────────────── */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                {editingNote ? 'Edit Study Note' : 'Add University Study Note'}
              </h3>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="e.g. Operating Systems: Process Scheduling & Virtual Memory"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    value={noteForm.topic}
                    onChange={(e) => setNoteForm({ ...noteForm, topic: e.target.value })}
                    placeholder="e.g. Computer Science Sem 4"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={noteForm.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setNoteForm({
                        ...noteForm,
                        category: newCat,
                        thumbnail: NOTE_CATEGORY_THUMBNAILS[newCat] || noteForm.thumbnail
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  >
                    {['System Design', 'React & Web', 'Distributed Systems', 'Databases & SQL', 'Machine Learning', 'DevOps & Cloud', 'General'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Resource Type
                  </label>
                  <select
                    value={noteForm.resourceType}
                    onChange={(e) => setNoteForm({ ...noteForm, resourceType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="google_drive">Google Drive Folder</option>
                    <option value="google_docs">Google Doc</option>
                    <option value="google_sheets">Google Sheet</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    File Size / Page Count
                  </label>
                  <input
                    type="text"
                    value={noteForm.fileSize}
                    onChange={(e) => setNoteForm({ ...noteForm, fileSize: e.target.value })}
                    placeholder="e.g. 2.4 MB • 32p or Drive • 10 Files"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Download / Drive URL *
                </label>
                <input
                  type="url"
                  required
                  value={noteForm.url}
                  onChange={(e) => setNoteForm({ ...noteForm, url: e.target.value })}
                  placeholder="https://drive.google.com/... or direct PDF link"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Subject Photo / Thumbnail URL
                </label>
                <input
                  type="url"
                  value={noteForm.thumbnail}
                  onChange={(e) => setNoteForm({ ...noteForm, thumbnail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Simple Description
                </label>
                <textarea
                  rows={2}
                  value={noteForm.description}
                  onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                  placeholder="Brief overview of contents covered in this note..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noteForm.pinned}
                    onChange={(e) => setNoteForm({ ...noteForm, pinned: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Pin to Top of List</span>
                </label>

                <label className="flex items-center gap-2 font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noteForm.starred}
                    onChange={(e) => setNoteForm({ ...noteForm, starred: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Mark as Recommended</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsNoteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingNote}
                >
                  {editingNote ? 'Save Changes' : 'Publish Note'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT DEVELOPER TOOL ──────────────────────────────── */}
      {isToolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                {editingTool ? 'Edit Developer Tool' : 'Add Developer Tool / ZIP Download'}
              </h3>
              <button
                onClick={() => setIsToolModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTool} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tool Name *
                </label>
                <input
                  type="text"
                  required
                  value={toolForm.name}
                  onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                  placeholder="e.g. Docker Multi-Service Microservices Stack"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={toolForm.tagline}
                  onChange={(e) => setToolForm({ ...toolForm, tagline: e.target.value })}
                  placeholder="e.g. One-click local stack: MySQL, Redis, Nginx & Node.js"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={toolForm.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setToolForm({
                        ...toolForm,
                        category: newCat,
                        thumbnail: TOOL_CATEGORY_THUMBNAILS[newCat] || toolForm.thumbnail
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  >
                    {['DevOps & Docker', 'IDE & Editors', 'Database GUI', 'API & Backend', 'Full-Stack Kits', 'Utilities'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Download Type
                  </label>
                  <select
                    value={toolForm.downloadType}
                    onChange={(e) => setToolForm({ ...toolForm, downloadType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  >
                    <option value="zip">Direct ZIP File Download</option>
                    <option value="drive">Google Drive Link</option>
                    <option value="direct">Direct Binary / Installer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Direct Download or Drive URL *
                </label>
                <input
                  type="url"
                  required
                  value={toolForm.downloadUrl}
                  onChange={(e) => setToolForm({ ...toolForm, downloadUrl: e.target.value })}
                  placeholder="https://... direct zip download link or drive url"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={toolForm.version}
                    onChange={(e) => setToolForm({ ...toolForm, version: e.target.value })}
                    placeholder="e.g. v2.4.0"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={toolForm.fileSize}
                    onChange={(e) => setToolForm({ ...toolForm, fileSize: e.target.value })}
                    placeholder="e.g. 18.4 MB • ZIP"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Thumbnail / Icon URL
                </label>
                <input
                  type="url"
                  value={toolForm.thumbnail}
                  onChange={(e) => setToolForm({ ...toolForm, thumbnail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={toolForm.description}
                  onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                  placeholder="Describe the tool, features, and setup requirements..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={toolForm.featured}
                    onChange={(e) => setToolForm({ ...toolForm, featured: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Featured Tool on Tools Page</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsToolModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingTool}
                >
                  {editingTool ? 'Save Changes' : 'Publish Tool'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD USER ──────────────────────────────────────────────── */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Provision New User Account
              </h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Liam Anderson"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="name@organization.com"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    value={newUserForm.title}
                    onChange={(e) => setNewUserForm({ ...newUserForm, title: e.target.value })}
                    placeholder="e.g. Engineering Student"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingUser}
                >
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW INQUIRY DETAILS ─────────────────────────────────── */}
      {activeInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                Inquiry from {activeInquiryModal.name}
              </h3>
              <button
                onClick={() => setActiveInquiryModal(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-neutral-50 dark:bg-neutral-850 p-3 rounded-xl">
                <div>
                  <span className="text-neutral-400 font-semibold block">Email:</span>
                  <span className="text-neutral-900 dark:text-white font-mono">{activeInquiryModal.email}</span>
                </div>
                {activeInquiryModal.phone && (
                  <div>
                    <span className="text-neutral-400 font-semibold block">Phone:</span>
                    <span className="text-neutral-900 dark:text-white font-mono">{activeInquiryModal.phone}</span>
                  </div>
                )}
                {activeInquiryModal.course && (
                  <div>
                    <span className="text-neutral-400 font-semibold block">Course Interest:</span>
                    <span className="text-neutral-900 dark:text-white">{activeInquiryModal.course}</span>
                  </div>
                )}
                <div>
                  <span className="text-neutral-400 font-semibold block">Received:</span>
                  <span className="text-neutral-900 dark:text-white font-mono">
                    {activeInquiryModal.created_at ? new Date(activeInquiryModal.created_at).toLocaleString() : ''}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 font-semibold block mb-1">Subject:</span>
                <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-bold text-neutral-900 dark:text-white">
                  {activeInquiryModal.subject}
                </div>
              </div>

              <div>
                <span className="text-neutral-400 font-semibold block mb-1">Full Message:</span>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 max-h-48 overflow-y-auto">
                  {activeInquiryModal.message}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteInquiry(activeInquiryModal.id)}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveInquiryModal(null)}
                >
                  Close
                </Button>
                <a
                  href={`mailto:${activeInquiryModal.email}?subject=Re: ${encodeURIComponent(activeInquiryModal.subject)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: PROJECTS ─────────────────────────────────────────────────── */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-violet-500" /> Capstone Engineering Projects
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">{projectsList.length} projects in catalog</p>
            </div>
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => { setEditingProject(null); setProjectForm({ title:'', tagline:'', description:'', category:'Full-Stack', difficulty:'Intermediate', estimatedHours:24, techStack:'React, TypeScript, Node.js', thumbnail:'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop', courseRelation:'', starterRepoCommand:'', liveDemoUrl:'', status:'Available', featured:true }); setIsProjectModalOpen(true); }}>
              Add Project
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" placeholder="Search projects…" value={projectSearch} onChange={e => setProjectSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
          </div>

          {filteredProjects.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <FolderGit2 className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 font-medium">No projects yet.</p>
              <p className="text-xs text-neutral-400 mt-1">Click "Add Project" to create your first capstone project.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProjects.map(proj => (
                <GlassCard key={proj.id} className="p-4 space-y-3">
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <img src={proj.thumbnail} alt={proj.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">{proj.title}</h3>
                      {proj.featured && <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 fill-amber-400" />}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{proj.tagline}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${proj.difficulty === 'Advanced' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : proj.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>{proj.difficulty}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">{proj.category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${proj.status === 'Available' ? 'bg-blue-100 text-blue-700' : proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}`}>{proj.status}</span>
                  </div>
                  <div className="text-xs text-neutral-500 font-mono flex items-center gap-1">
                    <Code2 className="w-3 h-3" /> {proj.estimatedHours}h • {proj.submissionsCount ?? 0} submissions
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <Button variant="outline" size="sm" icon={<Edit3 className="w-3 h-3" />}
                      onClick={() => { setEditingProject(proj); setProjectForm({ title: proj.title, tagline: proj.tagline, description: proj.description, category: proj.category, difficulty: proj.difficulty, estimatedHours: proj.estimatedHours, techStack: proj.techStack.join(', '), thumbnail: proj.thumbnail, courseRelation: proj.courseRelation, starterRepoCommand: proj.starterRepoCommand, liveDemoUrl: proj.liveDemoUrl, status: proj.status, featured: proj.featured }); setIsProjectModalOpen(true); }}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" icon={<Trash2 className="w-3 h-3" />}
                      onClick={async () => { if (!window.confirm(`Delete project "${proj.title}"?`)) return; const res = await adminFetch('delete_project', { method: 'POST', body: JSON.stringify({ id: proj.id }) }); if (res.ok) { setProjectsList(prev => prev.filter(p => p.id !== proj.id)); addToast('Project Deleted', `"${proj.title}" removed.`, 'info'); } }}>
                      Delete
                    </Button>
                    {proj.liveDemoUrl && (
                      <a href={proj.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-neutral-400 hover:text-neutral-700 dark:hover:text-white">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ROADMAPS ─────────────────────────────────────────────────── */}
      {activeTab === 'roadmaps' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Map className="w-5 h-5 text-sky-500" /> Career Roadmaps & Learning Tracks
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {roadmapsList.length} interactive tracks stored dynamically in database • Changes reflect instantly on website
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                isLoading={isSeedingRoadmaps}
                onClick={async () => {
                  if (!window.confirm("Sync/seed all 4 canonical 2026 roadmaps (Full Stack, Frontend, Backend, DevOps) with complete 37+ topics from verified seed curriculum?")) return;
                  setIsSeedingRoadmaps(true);
                  try {
                    const res = await adminFetch('seed_roadmaps', { method: 'POST' });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      addToast('Roadmaps Synced', data.message || 'Canonical 2026 roadmaps synced successfully.', 'success');
                      await fetchRoadmaps();
                    } else {
                      addToast('Sync Failed', data.error || 'Could not sync roadmaps.', 'warning');
                    }
                  } catch (err) {
                    addToast('Network Error', 'Failed to connect to admin API.', 'warning');
                  } finally {
                    setIsSeedingRoadmaps(false);
                  }
                }}
              >
                Sync Canonical 2026 Roadmaps
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setEditingRoadmap(null);
                  setRoadmapForm({
                    slug: '',
                    title: '',
                    subtitle: '',
                    description: '',
                    badge: 'Specialized Track',
                    category: 'full-stack',
                    categoryLabel: 'Full Stack Development',
                    tagline: '',
                    difficulty: 'Intermediate',
                    duration: '6 months',
                    weeklyCommitment: '10–15 hrs/week',
                    totalTopics: 1,
                    salaryBenchmark: '₹8–25 LPA',
                    status: 'published',
                    orderIndex: roadmapsList.length,
                    careerRoles: 'Software Engineer, Full Stack Developer, Tech Lead',
                  });
                  const defaultStage = [
                    {
                      id: "stage-1",
                      stepNumber: 1,
                      title: "Core Fundamentals & Theory",
                      category: "foundations",
                      tagline: "Master essential core principles and theoretical foundations.",
                      description: "Foundational conceptual knowledge required before building production systems.",
                      topics: [
                        {
                          id: "core-basics",
                          title: "Architecture & Core Concepts",
                          type: "essential",
                          level: "Beginner",
                          description: "Fundamental protocols, mental models, and architectural fundamentals.",
                          whatToLearn: [
                            "Core mental models and standards",
                            "Runtime environment execution",
                            "Tooling and developer ergonomics"
                          ],
                          officialDocs: "https://developer.mozilla.org",
                          practiceChallenge: "Create a minimal proof-of-concept project demonstrating core principles.",
                          estimatedHours: 8
                        }
                      ]
                    }
                  ];
                  setRoadmapStagesJson(JSON.stringify(defaultStage, null, 2));
                  setStagesJsonError(null);
                  setRoadmapModalTab('info');
                  setIsRoadmapModalOpen(true);
                }}
              >
                Add Roadmap
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by title, slug, category, badge, or description…"
              value={roadmapSearch}
              onChange={e => setRoadmapSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {filteredRoadmaps.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Map className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 font-medium">No roadmaps found.</p>
              <p className="text-xs text-neutral-400 mt-1">Click "Sync Canonical 2026 Roadmaps" to seed default tracks, or "Add Roadmap" to create one.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRoadmaps.map(rm => (
                <GlassCard key={rm.id} className="p-5 space-y-3 flex flex-col justify-between hover:border-sky-500/40 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400">
                          {rm.categoryLabel || rm.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {rm.badge || 'Official Career Track'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          rm.status === 'draft' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {rm.status === 'draft' ? 'Draft' : 'Published'}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                        rm.difficulty === 'Advanced' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400' :
                        rm.difficulty === 'Intermediate' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' :
                        'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {rm.difficulty || 'Intermediate'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-neutral-900 dark:text-white leading-snug">
                        {rm.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 mt-1">
                        <Map className="w-3 h-3 text-sky-500" />
                        <span>/roadmaps/{rm.slug || rm.id}</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {rm.subtitle || rm.tagline || rm.description}
                    </p>

                    <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
                      <div className="bg-neutral-50 dark:bg-neutral-800/70 rounded-xl p-2 border border-neutral-100 dark:border-neutral-800">
                        <div className="text-sm font-bold text-neutral-900 dark:text-white">{rm.stages?.length || 0}</div>
                        <div className="text-[10px] text-neutral-400">Stages</div>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-800/70 rounded-xl p-2 border border-neutral-100 dark:border-neutral-800">
                        <div className="text-sm font-bold text-neutral-900 dark:text-white">{rm.totalTopics || 0}</div>
                        <div className="text-[10px] text-neutral-400">Topics</div>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-800/70 rounded-xl p-2 border border-neutral-100 dark:border-neutral-800">
                        <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">{rm.duration || '6 mos'}</div>
                        <div className="text-[10px] text-neutral-400">Duration</div>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-800/70 rounded-xl p-2 border border-neutral-100 dark:border-neutral-800">
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">{rm.salaryBenchmark || '₹8–25L'}</div>
                        <div className="text-[10px] text-neutral-400">Salary</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <a
                      href={`/roadmaps/${rm.slug || rm.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> View Live
                    </a>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit3 className="w-3 h-3" />}
                        onClick={() => {
                          setEditingRoadmap(rm);
                          setRoadmapForm({
                            slug: rm.slug || rm.id,
                            title: rm.title || '',
                            subtitle: rm.subtitle || rm.tagline || '',
                            description: rm.description || '',
                            badge: rm.badge || 'Official Career Track',
                            category: rm.category || 'full-stack',
                            categoryLabel: rm.categoryLabel || 'Web Development',
                            tagline: rm.tagline || rm.subtitle || '',
                            difficulty: rm.difficulty || 'Intermediate',
                            duration: rm.duration || '6 months',
                            weeklyCommitment: rm.weeklyCommitment || '10–15 hrs/week',
                            totalTopics: rm.totalTopics || 0,
                            salaryBenchmark: rm.salaryBenchmark || '₹8–25 LPA',
                            status: rm.status || 'published',
                            orderIndex: rm.orderIndex || 0,
                            careerRoles: Array.isArray(rm.careerRoles) ? rm.careerRoles.join(', ') : (rm.careerRoles || ''),
                          });
                          setRoadmapStagesJson(JSON.stringify(rm.stages && rm.stages.length > 0 ? rm.stages : [], null, 2));
                          setStagesJsonError(null);
                          setRoadmapModalTab('info');
                          setIsRoadmapModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="w-3 h-3" />}
                        onClick={async () => {
                          if (!window.confirm(`Delete roadmap "${rm.title}"? This will remove it from the database.`)) return;
                          const res = await adminFetch('delete_roadmap', { method: 'POST', body: JSON.stringify({ id: rm.id }) });
                          if (res.ok) {
                            setRoadmapsList(prev => prev.filter(r => r.id !== rm.id));
                            addToast('Roadmap Deleted', `"${rm.title}" removed.`, 'info');
                          } else {
                            addToast('Delete Failed', 'Could not delete roadmap.', 'warning');
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: ADD / EDIT PROJECT ─────────────────────────────────────── */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-violet-500" />
                  {editingProject ? 'Edit Project' : 'Add New Capstone Project'}
                </h3>
                <button onClick={() => setIsProjectModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white font-bold">✕</button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!projectForm.title.trim()) { addToast('Validation Error', 'Project title is required.', 'warning'); return; }
                setIsSubmittingProject(true);
                try {
                  const isEditing = Boolean(editingProject);
                  const payload = { ...(isEditing ? { id: editingProject?.id } : {}), ...projectForm, techStack: projectForm.techStack.split(',').map(s => s.trim()).filter(Boolean) };
                  const res = await adminFetch(isEditing ? 'update_project' : 'create_project', { method: 'POST', body: JSON.stringify(payload) });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    addToast(isEditing ? 'Project Updated' : 'Project Created', `${projectForm.title} saved.`, 'success');
                    setIsProjectModalOpen(false); fetchProjects();
                  } else { addToast('Error', data.error || 'Could not save project.', 'warning'); }
                } catch { addToast('Network Error', 'Failed to connect.', 'warning'); }
                finally { setIsSubmittingProject(false); }
              }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Project Title *</label>
                    <input type="text" required value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} placeholder="Full-Stack Distributed Kanban Studio"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Tagline</label>
                    <input type="text" value={projectForm.tagline} onChange={e => setProjectForm({...projectForm, tagline: e.target.value})} placeholder="One-line description…"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
                    <textarea rows={3} value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Category</label>
                    <select value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500">
                      {['Full-Stack','Distributed Systems','AI & ML','Systems & Rust','DevOps & Cloud'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Difficulty</label>
                    <select value={projectForm.difficulty} onChange={e => setProjectForm({...projectForm, difficulty: e.target.value as any})}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500">
                      {['Beginner','Intermediate','Advanced'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Status</label>
                    <select value={projectForm.status} onChange={e => setProjectForm({...projectForm, status: e.target.value as any})}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500">
                      {['Available','In Progress','Completed'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Est. Hours</label>
                    <input type="number" min={1} value={projectForm.estimatedHours} onChange={e => setProjectForm({...projectForm, estimatedHours: Number(e.target.value)})}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Tech Stack (comma-separated)</label>
                    <input type="text" value={projectForm.techStack} onChange={e => setProjectForm({...projectForm, techStack: e.target.value})} placeholder="React, TypeScript, Node.js, PostgreSQL"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Starter Repo Command</label>
                    <input type="text" value={projectForm.starterRepoCommand} onChange={e => setProjectForm({...projectForm, starterRepoCommand: e.target.value})} placeholder="npx degit yaswantcode/…"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Live Demo URL</label>
                    <input type="url" value={projectForm.liveDemoUrl} onChange={e => setProjectForm({...projectForm, liveDemoUrl: e.target.value})} placeholder="https://demo.vercel.app"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Thumbnail URL</label>
                    <input type="url" value={projectForm.thumbnail} onChange={e => setProjectForm({...projectForm, thumbnail: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="proj-featured" checked={projectForm.featured} onChange={e => setProjectForm({...projectForm, featured: e.target.checked})} className="w-4 h-4 rounded accent-violet-500" />
                    <label htmlFor="proj-featured" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Featured Project</label>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsProjectModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingProject}>
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT ROADMAP ─────────────────────────────────────── */}
      {isRoadmapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Map className="w-4 h-4 text-sky-500" />
                  {editingRoadmap ? `Edit Roadmap: ${editingRoadmap.title}` : 'Add New Career Roadmap Track'}
                </h3>
                <button onClick={() => setIsRoadmapModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white font-bold cursor-pointer">✕</button>
              </div>

              {/* Modal Tabs: General Info vs Stages & Topics */}
              <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <button
                  type="button"
                  onClick={() => setRoadmapModalTab('info')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    roadmapModalTab === 'info'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  1. Track Overview & SEO
                </button>
                <button
                  type="button"
                  onClick={() => setRoadmapModalTab('curriculum')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    roadmapModalTab === 'curriculum'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  2. Mind Tree Stages & Topics
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!roadmapForm.title.trim()) {
                  addToast('Validation Error', 'Roadmap title is required.', 'warning');
                  return;
                }
                const slugClean = (roadmapForm.slug || roadmapForm.title)
                  .toLowerCase()
                  .replace(/[^a-z0-9_-]+/g, '-')
                  .replace(/^-|-$/g, '');
                if (!slugClean) {
                  addToast('Validation Error', 'Roadmap URL slug is required.', 'warning');
                  return;
                }

                let parsedStages = [];
                try {
                  parsedStages = JSON.parse(roadmapStagesJson);
                  if (!Array.isArray(parsedStages)) {
                    throw new Error('Stages must be a JSON array of stages.');
                  }
                } catch (err: any) {
                  setStagesJsonError(err.message);
                  setRoadmapModalTab('curriculum');
                  addToast('Invalid Stages JSON', err.message, 'warning');
                  return;
                }

                setIsSubmittingRoadmap(true);
                try {
                  const isEditing = Boolean(editingRoadmap);
                  const payload = {
                    ...(isEditing ? { id: editingRoadmap?.id } : { id: slugClean }),
                    ...roadmapForm,
                    slug: slugClean,
                    stages: parsedStages,
                    careerRoles: roadmapForm.careerRoles.split(',').map(s => s.trim()).filter(Boolean)
                  };
                  const res = await adminFetch(isEditing ? 'update_roadmap' : 'create_roadmap', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    addToast(isEditing ? 'Roadmap Updated' : 'Roadmap Created', `${roadmapForm.title} saved to database.`, 'success');
                    setIsRoadmapModalOpen(false);
                    await fetchRoadmaps();
                  } else {
                    addToast('Error', data.error || 'Could not save roadmap.', 'warning');
                  }
                } catch {
                  addToast('Network Error', 'Failed to connect to admin API.', 'warning');
                } finally {
                  setIsSubmittingRoadmap(false);
                }
              }} className="space-y-4">
                {roadmapModalTab === 'info' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Roadmap Title *</label>
                      <input
                        type="text"
                        required
                        value={roadmapForm.title}
                        onChange={e => {
                          const title = e.target.value;
                          setRoadmapForm(prev => ({
                            ...prev,
                            title,
                            slug: prev.slug === '' || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                              ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                              : prev.slug
                          }));
                        }}
                        placeholder="Full-Stack Web Development Roadmap 2026"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        URL Slug (/roadmaps/...) *
                      </label>
                      <input
                        type="text"
                        required
                        value={roadmapForm.slug}
                        onChange={e => setRoadmapForm({...roadmapForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')})}
                        placeholder="full-stack"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                      <span className="text-[10px] text-neutral-400 mt-0.5 block truncate">
                        Live at: /roadmaps/{roadmapForm.slug || 'slug'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={roadmapForm.badge}
                        onChange={e => setRoadmapForm({...roadmapForm, badge: e.target.value})}
                        placeholder="Official Career Track"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Subtitle / Tagline</label>
                      <input
                        type="text"
                        value={roadmapForm.subtitle}
                        onChange={e => setRoadmapForm({...roadmapForm, subtitle: e.target.value, tagline: e.target.value})}
                        placeholder="Step by step guide to becoming a modern full stack developer in 2026"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Detailed Description</label>
                      <textarea
                        rows={2}
                        value={roadmapForm.description}
                        onChange={e => setRoadmapForm({...roadmapForm, description: e.target.value})}
                        placeholder="The definitive career roadmap covering foundations, client architectures, servers, databases, and deployments."
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Category</label>
                      <select
                        value={roadmapForm.category}
                        onChange={e => {
                          const val = e.target.value;
                          const labels: Record<string, string> = {
                            'full-stack': 'Full Stack Development',
                            'frontend': 'Frontend Engineering',
                            'backend': 'Backend Engineering',
                            'devops': 'DevOps & Cloud',
                            'ai': 'AI & Machine Learning',
                            'security': 'Cybersecurity'
                          };
                          setRoadmapForm({
                            ...roadmapForm,
                            category: val,
                            categoryLabel: labels[val] || val
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="full-stack">Full Stack Development</option>
                        <option value="frontend">Frontend Engineering</option>
                        <option value="backend">Backend Engineering</option>
                        <option value="devops">DevOps & Cloud</option>
                        <option value="ai">AI & Machine Learning</option>
                        <option value="security">Cybersecurity</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Publish Status</label>
                      <select
                        value={roadmapForm.status}
                        onChange={e => setRoadmapForm({...roadmapForm, status: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="published">Published (Visible on site)</option>
                        <option value="draft">Draft (Admin only)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Difficulty</label>
                      <select
                        value={roadmapForm.difficulty}
                        onChange={e => setRoadmapForm({...roadmapForm, difficulty: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        {['Beginner','Intermediate','Advanced'].map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Duration</label>
                      <input
                        type="text"
                        value={roadmapForm.duration}
                        onChange={e => setRoadmapForm({...roadmapForm, duration: e.target.value})}
                        placeholder="6 months"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Salary Benchmark</label>
                      <input
                        type="text"
                        value={roadmapForm.salaryBenchmark}
                        onChange={e => setRoadmapForm({...roadmapForm, salaryBenchmark: e.target.value})}
                        placeholder="₹8–25 LPA"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Weekly Commitment</label>
                      <input
                        type="text"
                        value={roadmapForm.weeklyCommitment}
                        onChange={e => setRoadmapForm({...roadmapForm, weeklyCommitment: e.target.value})}
                        placeholder="10–15 hrs/week"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Career Roles (comma-separated)</label>
                      <input
                        type="text"
                        value={roadmapForm.careerRoles}
                        onChange={e => setRoadmapForm({...roadmapForm, careerRoles: e.target.value})}
                        placeholder="Software Engineer, Full Stack Developer, Tech Lead"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-100 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-750 text-xs">
                      <span className="text-neutral-600 dark:text-neutral-300 font-semibold">
                        Curriculum Stages & Topics (JSON structure)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              const parsed = JSON.parse(roadmapStagesJson);
                              setRoadmapStagesJson(JSON.stringify(parsed, null, 2));
                              setStagesJsonError(null);
                              addToast('Formatted', 'Stages JSON formatted nicely.', 'info');
                            } catch (e: any) {
                              setStagesJsonError(e.message);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-[11px] font-bold cursor-pointer"
                        >
                          Format JSON
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              let current = JSON.parse(roadmapStagesJson);
                              if (!Array.isArray(current)) current = [];
                              const newStageNum = current.length + 1;
                              current.push({
                                id: `stage-${newStageNum}`,
                                stepNumber: newStageNum,
                                title: `Stage ${newStageNum}: New Skill Module`,
                                category: 'foundations',
                                tagline: 'Module tagline and core outcomes',
                                description: 'Description of what students learn in this module.',
                                topics: [
                                  {
                                    id: `topic-${newStageNum}-1`,
                                    title: 'Key Topic Name',
                                    type: 'essential',
                                    level: 'Beginner',
                                    description: 'Topic description and core purpose.',
                                    whatToLearn: ['Core theory', 'Code example', 'Best practice'],
                                    officialDocs: 'https://developer.mozilla.org',
                                    practiceChallenge: 'Build a small application testing this concept.',
                                    estimatedHours: 6
                                  }
                                ]
                              });
                              setRoadmapStagesJson(JSON.stringify(current, null, 2));
                              setStagesJsonError(null);
                              addToast('Stage Added', `Added Stage ${newStageNum} template.`, 'success');
                            } catch (e: any) {
                              setStagesJsonError(e.message);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[11px] font-bold cursor-pointer"
                        >
                          + Append Stage
                        </button>
                      </div>
                    </div>

                    {stagesJsonError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>JSON Syntax Error: {stagesJsonError}</span>
                      </div>
                    )}

                    <textarea
                      rows={14}
                      value={roadmapStagesJson}
                      onChange={e => {
                        setRoadmapStagesJson(e.target.value);
                        try {
                          JSON.parse(e.target.value);
                          setStagesJsonError(null);
                        } catch (err: any) {
                          setStagesJsonError(err.message);
                        }
                      }}
                      className="w-full p-3 font-mono text-xs rounded-xl bg-neutral-950 text-neutral-100 border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed"
                      placeholder="[ { id: 'stage-1', stepNumber: 1, title: '...', topics: [...] } ]"
                    />

                    {(() => {
                      try {
                        const parsed = JSON.parse(roadmapStagesJson);
                        if (Array.isArray(parsed)) {
                          const stagesCount = parsed.length;
                          const topicsCount = parsed.reduce((acc: number, stg: any) => acc + (Array.isArray(stg.topics) ? stg.topics.length : 0), 0);
                          return (
                            <div className="flex items-center gap-3 text-xs text-neutral-500">
                              <span className="font-semibold text-sky-600 dark:text-sky-400">✓ Valid JSON</span>
                              <span>{stagesCount} stage(s)</span>
                              <span>•</span>
                              <span>{topicsCount} topic(s) detected</span>
                            </div>
                          );
                        }
                      } catch {}
                      return null;
                    })()}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="text-[11px] text-neutral-400">
                    Changes save directly to Hostinger MySQL and render live on website.
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsRoadmapModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingRoadmap}>
                      {editingRoadmap ? 'Update Roadmap' : 'Create Roadmap'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DISCUSSION REPLIES MODERATOR ──────────────────────────── */}
      {activeDiscussionRepliesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-sky-500" />
                  Thread: {activeDiscussionRepliesModal.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Category: {activeDiscussionRepliesModal.category} • Author: {activeDiscussionRepliesModal.authorName}
                </p>
              </div>
              <button onClick={() => setActiveDiscussionRepliesModal(null)} className="text-neutral-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-xs text-neutral-800 dark:text-neutral-200">
              {activeDiscussionRepliesModal.content}
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Community Replies ({discussionReplies.length})
              </h4>
              {isLoadingReplies ? (
                <div className="text-center py-6 text-xs text-neutral-400">Loading replies...</div>
              ) : discussionReplies.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                  No replies on this thread yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {discussionReplies.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-white">{rep.authorName}</span>
                          <span className="text-[10px] text-neutral-400">{rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : ''}</span>
                          {rep.isAccepted && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                              Accepted Solution
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-300">{rep.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDiscussionReply(rep.id)}
                        className="text-rose-500 hover:text-rose-600 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ── Push Notifications Panel ─────────────────────────────────────────────────
const PushNotificationsPanel: React.FC = () => {
  const { addToast } = useLms();
  const [form, setForm] = React.useState({
    title:   '',
    body:    '',
    link:    '/',
    icon:    '/favicon.svg',
  });
  const [sending, setSending]         = React.useState(false);
  const [stats, setStats]             = React.useState<{ total: number; last_30_days: number } | null>(null);
  const [history, setHistory]         = React.useState<any[]>([]);
  const [historyLoading, setHistLoad] = React.useState(true);

  const QUICK_TEMPLATES = [
    { label: 'New Blog Post',   title: '📝 New Blog Post',        body: 'A new article just dropped — check it out!',                   link: '/blog'      },
    { label: 'New Note / PDF',  title: '📚 New Study Note',       body: 'Fresh study notes & PDFs are now available for download.',      link: '/notes'     },
    { label: 'New Tool',        title: '🛠 New Developer Tool',    body: 'A brand-new dev tool has been added. Download it now!',         link: '/tools'     },
    { label: 'New Roadmap',     title: '🗺 New Learning Roadmap',  body: 'A new engineering roadmap has been published. Start learning!', link: '/roadmaps'  },
    { label: 'Announcement',    title: '📢 Announcement',         body: 'We have an important update for you.',                          link: '/'          },
  ];

  React.useEffect(() => {
    const token = tokenStorage.get();
    if (!token) return;
    fetch('/api/notify.php?action=stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(() => {});

    fetch('/api/notify.php?action=history', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setHistory(d.data || []); })
      .catch(() => {})
      .finally(() => setHistLoad(false));
  }, []);

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      addToast('Missing fields', 'Title and message are required.', 'warning');
      return;
    }
    setSending(true);
    try {
      const token = tokenStorage.get() ?? '';
      const result = await sendPushNotification({ ...form, authToken: token });
      if (result.success) {
        addToast('Notification Sent', `Delivered to ${result.sent ?? 0} subscribers.`, 'success');
        setForm(f => ({ ...f, title: '', body: '' }));
        setHistory(h => [
          { title: form.title, body: form.body, link: form.link, sent_count: result.sent ?? 0, sent_by: 'admin', sent_at: new Date().toISOString() },
          ...h.slice(0, 19),
        ]);
        if (stats) setStats(s => s ? { ...s } : s);
      } else {
        addToast('Send Failed', result.message || 'Could not send notification.', 'warning');
      }
    } catch {
      addToast('Network Error', 'Could not reach notification API.', 'warning');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-5 text-center">
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {stats ? stats.total : '—'}
          </div>
          <div className="text-xs text-neutral-500 mt-1 font-semibold uppercase tracking-wider">Total Subscribers</div>
        </GlassCard>
        <GlassCard className="p-5 text-center">
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {stats ? stats.last_30_days : '—'}
          </div>
          <div className="text-xs text-neutral-500 mt-1 font-semibold uppercase tracking-wider">New (30 days)</div>
        </GlassCard>
      </div>

      {/* Compose */}
      <GlassCard className="p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-500" />
            Send Push Notification
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Delivered to all subscribed users instantly via Firebase Cloud Messaging.
          </p>
        </div>

        {/* Quick Templates */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Quick Templates
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map(tpl => (
              <button
                key={tpl.label}
                onClick={() => setForm(f => ({ ...f, title: tpl.title, body: tpl.body, link: tpl.link }))}
                className="text-[11px] px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. 📝 New Blog Post Just Dropped!"
              maxLength={100}
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="e.g. Check out the new article on distributed systems..."
              rows={3}
              maxLength={200}
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <div className="text-right text-[10px] text-neutral-400 mt-0.5">{form.body.length}/200</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Deep Link (optional)
            </label>
            <input
              type="text"
              value={form.link}
              onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
              placeholder="/blog or /tools"
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={sending || !form.title.trim() || !form.body.trim()}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            {sending ? 'Sending…' : `Send to ${stats?.total ?? 'all'} Subscribers`}
          </Button>
        </div>
      </GlassCard>

      {/* History */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-500" />
          Recent Notifications
        </h3>
        {historyLoading ? (
          <div className="text-xs text-neutral-400 text-center py-4">Loading history…</div>
        ) : history.length === 0 ? (
          <div className="text-xs text-neutral-400 text-center py-4">No notifications sent yet.</div>
        ) : (
          <div className="space-y-3">
            {history.map((n, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                  <Radio className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{n.title}</span>
                    <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                      {n.sent_count} sent
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{n.body}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                    {new Date(n.sent_at).toLocaleString()} · {n.sent_by || 'admin'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
