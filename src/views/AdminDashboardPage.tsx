import React, { useState, useEffect, useCallback } from 'react';
import { useLms } from '../context/LmsContext';
import { tokenStorage } from '../services/api';
import { 
  Users, 
  BookOpen, 
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
  Layers
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { BentoCard } from '../components/ui/BentoCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

// ── Types for Complete Website Administration ────────────────────────────────
interface AdminOverview {
  users: {
    total: number;
    students: number;
    admins: number;
    active: number;
  };
  courses: {
    total: number;
    published: number;
    featured: number;
    bestseller: number;
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
  enrollments: {
    total: number;
    completed: number;
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
  enrolledCount: number;
}

interface AdminCourse {
  id: string;
  title: string;
  tagline: string;
  description?: string;
  thumbnail: string;
  category: string;
  difficulty: string;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  durationHours: number;
  lessonsCount: number;
  price: number;
  originalPrice: number | null;
  isBestseller: boolean;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
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
  title: string;
  category: string;
  categoryLabel: string;
  tagline: string;
  description: string;
  difficulty: string;
  duration: string;
  weeklyCommitment: string;
  totalTopics: number;
  salaryBenchmark: string;
  careerRoles: string[];
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
  const { addToast, setCurrentView, refreshCourses } = useLms();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'notes' | 'tools' | 'projects' | 'roadmaps' | 'users' | 'settings' | 'inquiries' | 'subscribers' | 'database'>('overview');
  
  // Loading & sync state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>('Just now');
  const [copiedEmails, setCopiedEmails] = useState<boolean>(false);

  // Live Data States
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [coursesList, setCoursesList] = useState<AdminCourse[]>([]);
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
  
  const [courseSearch, setCourseSearch] = useState<string>('');
  const [noteSearch, setNoteSearch] = useState<string>('');
  const [selectedNoteCategory, setSelectedNoteCategory] = useState<string>('All');
  
  const [toolSearch, setToolSearch] = useState<string>('');
  const [selectedToolCategory, setSelectedToolCategory] = useState<string>('All');

  const [projectSearch, setProjectSearch] = useState<string>('');
  const [roadmapSearch, setRoadmapSearch] = useState<string>('');

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

  // Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'Full Stack',
    difficulty: 'Intermediate',
    price: '49',
    originalPrice: '99',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
    durationHours: 25,
    lessonsCount: 30,
    isFeatured: true,
    isBestseller: false,
  });
  const [isSubmittingCourse, setIsSubmittingCourse] = useState<boolean>(false);

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
  const [roadmapForm, setRoadmapForm] = useState({
    title: '',
    category: 'web',
    categoryLabel: 'Web Development',
    tagline: '',
    description: '',
    difficulty: 'Intermediate',
    duration: '6 months',
    weeklyCommitment: '10–15 hrs/week',
    totalTopics: 50,
    salaryBenchmark: '₹8–20 LPA',
    careerRoles: 'Frontend Developer, Full-Stack Engineer',
  });
  const [isSubmittingRoadmap, setIsSubmittingRoadmap] = useState<boolean>(false);

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

  // Fetch Courses List
  const fetchCourses = useCallback(async () => {
    try {
      const res = await adminFetch('courses');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setCoursesList(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin courses:', err);
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

  // Refresh all data
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchOverview(),
      fetchUsers(),
      fetchCourses(),
      fetchNotes(),
      fetchTools(),
      fetchProjects(),
      fetchRoadmaps(),
      fetchSettings(),
      fetchInquiries(),
      fetchSubscribers(),
      fetchDbStats(),
      refreshCourses()
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
        fetchCourses(),
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
  }, [fetchOverview, fetchUsers, fetchCourses, fetchNotes, fetchTools, fetchProjects, fetchRoadmaps, fetchSettings, fetchInquiries, fetchSubscribers, fetchDbStats]);

  // ── COURSE ACTIONS ────────────────────────────────────────────────────────
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      addToast('Validation Error', 'Course title is required.', 'warning');
      return;
    }
    setIsSubmittingCourse(true);
    try {
      const isEditing = Boolean(editingCourse);
      const action = isEditing ? 'update_course' : 'create_course';
      const payload = {
        ...(isEditing ? { id: editingCourse?.id } : {}),
        title: courseForm.title,
        tagline: courseForm.tagline,
        description: courseForm.description,
        category: courseForm.category,
        difficulty: courseForm.difficulty,
        price: parseFloat(courseForm.price) || 0,
        original_price: parseFloat(courseForm.originalPrice) || null,
        thumbnail: courseForm.thumbnail,
        duration_hours: Number(courseForm.durationHours) || 10,
        lessons_count: Number(courseForm.lessonsCount) || 15,
        is_featured: courseForm.isFeatured,
        is_bestseller: courseForm.isBestseller
      };

      const res = await adminFetch(action, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(isEditing ? 'Course Updated' : 'Course Created', `${courseForm.title} successfully saved.`, 'success');
        setIsCourseModalOpen(false);
        setEditingCourse(null);
        fetchCourses();
        fetchOverview();
        refreshCourses();
      } else {
        addToast('Action Failed', data.error || 'Could not save course.', 'warning');
      }
    } catch {
      addToast('Network Error', 'Failed to connect to API.', 'warning');
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleOpenEditCourse = (c: AdminCourse) => {
    setEditingCourse(c);
    setCourseForm({
      title: c.title,
      tagline: c.tagline,
      description: c.description || '',
      category: c.category,
      difficulty: c.difficulty,
      price: c.price.toString(),
      originalPrice: c.originalPrice?.toString() || '',
      thumbnail: c.thumbnail,
      durationHours: c.durationHours,
      lessonsCount: c.lessonsCount,
      isFeatured: c.isFeatured,
      isBestseller: c.isBestseller
    });
    setIsCourseModalOpen(true);
  };

  const handleToggleCourse = async (courseId: string, field: 'featured' | 'bestseller' | 'deleted', currentValue: boolean) => {
    const nextVal = !currentValue;
    try {
      const res = await adminFetch('toggle_course', {
        method: 'POST',
        body: JSON.stringify({ id: courseId, field, value: nextVal })
      });
      if (res.ok) {
        setCoursesList(prev => prev.map(c => {
          if (c.id === courseId) {
            if (field === 'featured') return { ...c, isFeatured: nextVal };
            if (field === 'bestseller') return { ...c, isBestseller: nextVal };
            if (field === 'deleted') return { ...c, isDeleted: nextVal };
          }
          return c;
        }));
        addToast('Course Status Updated', `Course ${field} changed.`, 'success');
        fetchOverview();
        refreshCourses();
      }
    } catch {
      addToast('Error', 'Failed to update course.', 'warning');
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!window.confirm(`Permanently delete course "${courseTitle}" from MySQL?`)) return;
    try {
      const res = await adminFetch('delete_course', {
        method: 'POST',
        body: JSON.stringify({ id: courseId, hard: true })
      });
      if (res.ok) {
        setCoursesList(prev => prev.filter(c => c.id !== courseId));
        addToast('Course Deleted', `Course "${courseTitle}" permanently removed.`, 'info');
        fetchOverview();
        refreshCourses();
      }
    } catch {
      addToast('Error', 'Failed to delete course.', 'warning');
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

  const filteredCourses = coursesList.filter(c => {
    if (courseSearch.trim()) {
      const q = courseSearch.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.instructor.name.toLowerCase().includes(q);
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
      return r.title.toLowerCase().includes(q) || r.categoryLabel.toLowerCase().includes(q) || r.tagline.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredWorkspaceLinks = workspaceLinksList.filter(w => {
    if (workspaceSearch.trim()) {
      const q = workspaceSearch.toLowerCase();
      return w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q) || w.category.toLowerCase().includes(q);
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
            Directly govern all aspects of Yaswant Code: Courses, Study Notes, Developer Tools, Projects, Roadmaps, Google Hub, Users, Announcements, and Telemetry.
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
            {isRefreshing ? 'Syncing...' : 'Sync DB'}
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <BentoCard
          title="Total Users"
          value={overview?.users?.total ?? usersList.length}
          subtitle={`${overview?.users?.active ?? usersList.filter(u=>u.isActive).length} active`}
          change={{ value: `${overview?.users?.students ?? 0} students`, trend: 'up' }}
          icon={<Users className="w-5 h-5 text-blue-500" />}
          onClick={() => setActiveTab('users')}
        />
        <BentoCard
          title="Catalog Courses"
          value={overview?.courses?.total ?? coursesList.length}
          subtitle={`${overview?.courses?.published ?? coursesList.filter(c=>!c.isDeleted).length} published`}
          change={{ value: `${overview?.courses?.featured ?? 0} featured`, trend: 'up' }}
          icon={<BookOpen className="w-5 h-5 text-purple-500" />}
          onClick={() => setActiveTab('courses')}
        />
        <BentoCard
          title="Study Notes"
          value={overview?.notes?.total ?? notesList.length}
          subtitle={`${overview?.notes?.pdf ?? 0} PDFs`}
          change={{ value: `${overview?.notes?.drive ?? 0} Drive`, trend: 'up' }}
          icon={<FileText className="w-5 h-5 text-emerald-500" />}
          onClick={() => setActiveTab('notes')}
        />
        <BentoCard
          title="Developer Tools"
          value={overview?.tools?.total ?? toolsList.length}
          subtitle={`${overview?.tools?.zip ?? 0} ZIP files`}
          change={{ value: `${overview?.tools?.drive ?? 0} Drive`, trend: 'up' }}
          icon={<Wrench className="w-5 h-5 text-amber-500" />}
          onClick={() => setActiveTab('tools')}
        />
        <BentoCard
          title="Inquiries"
          value={overview?.inquiries?.total ?? inquiriesList.length}
          subtitle="Messages inbox"
          change={{ value: inquiriesList.length > 0 ? `${inquiriesList.length} leads` : 'Clear', trend: inquiriesList.length > 0 ? 'up' : 'neutral' }}
          icon={<MessageSquare className="w-5 h-5 text-rose-500" />}
          onClick={() => setActiveTab('inquiries')}
        />
        <BentoCard
          title="Subscribers"
          value={overview?.subscribers?.total ?? subscribersList.length}
          subtitle="Newsletter"
          change={{ value: `${overview?.subscribers?.active ?? 0} active`, trend: 'up' }}
          icon={<Mail className="w-5 h-5 text-indigo-500" />}
          onClick={() => setActiveTab('subscribers')}
        />
      </div>

      {/* ── Tabs Navigation ─────────────────────────────────────────────── */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-4 sm:gap-7 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: Activity, count: null },
          { id: 'courses', label: 'Courses', icon: BookOpen, count: coursesList.length },
          { id: 'notes', label: 'Study Notes', icon: FileText, count: notesList.length },
          { id: 'tools', label: 'Dev Tools', icon: Wrench, count: toolsList.length },
          { id: 'projects', label: 'Projects', icon: FolderGit2, count: projectsList.length },
          { id: 'roadmaps', label: 'Roadmaps', icon: Map, count: roadmapsList.length },
          { id: 'users', label: 'Users', icon: Users, count: usersList.length },
          { id: 'settings', label: 'Settings', icon: SettingsIcon, count: null },
          { id: 'inquiries', label: 'Inquiries', icon: MessageSquare, count: inquiriesList.length },
          { id: 'subscribers', label: 'Newsletter', icon: Mail, count: subscribersList.length },
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
                  Hostinger MariaDB connected with schemas for users, courses, chapters, lessons, study notes, developer tools, site settings, and subscribers.
                </p>
              </div>

              {/* Quick Action Launchers */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseForm({
                      title: '',
                      tagline: '',
                      description: '',
                      category: 'Full Stack',
                      difficulty: 'Intermediate',
                      price: '49',
                      originalPrice: '99',
                      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
                      durationHours: 25,
                      lessonsCount: 30,
                      isFeatured: true,
                      isBestseller: false,
                    });
                    setIsCourseModalOpen(true);
                  }}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Course
                </Button>

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
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Students Enrolled</span>
                <div className="text-2xl font-black text-neutral-900 dark:text-white">
                  {overview?.users?.students ?? 0}
                </div>
                <span className="text-[11px] text-neutral-400">Student accounts</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Courses Active</span>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  {overview?.courses?.published ?? coursesList.length}
                </div>
                <span className="text-[11px] text-neutral-400">Published curricula</span>
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

      {/* ── TAB 2: COURSE CATALOG & GOVERNANCE ───────────────────────────── */}
      {activeTab === 'courses' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Search courses by title, category, or instructor..."
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingCourse(null);
                setCourseForm({
                  title: '',
                  tagline: '',
                  description: '',
                  category: 'Full Stack',
                  difficulty: 'Intermediate',
                  price: '49',
                  originalPrice: '99',
                  thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
                  durationHours: 25,
                  lessonsCount: 30,
                  isFeatured: true,
                  isBestseller: false,
                });
                setIsCourseModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Add New Course
            </Button>
          </div>

          <div className="space-y-4">
            {filteredCourses.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No courses match the search filter.
              </div>
            ) : (
              filteredCourses.map((c) => (
                <div
                  key={c.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                    c.isDeleted 
                      ? 'bg-neutral-100/60 dark:bg-neutral-900/60 border-dashed border-neutral-300 dark:border-neutral-800 opacity-60' 
                      : 'bg-neutral-50 dark:bg-neutral-850/70 border-neutral-200 dark:border-neutral-750'
                  }`}
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-20 h-14 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="purple" size="sm">{c.category}</Badge>
                        <Badge variant="outline" size="sm">{c.difficulty}</Badge>
                        {c.isFeatured && (
                          <Badge variant="primary" size="sm" icon={<Sparkles className="w-3 h-3 text-amber-400" />}>
                            Featured
                          </Badge>
                        )}
                        {c.isBestseller && (
                          <Badge variant="warning" size="sm">Bestseller</Badge>
                        )}
                        {c.isDeleted && (
                          <Badge variant="neutral" size="sm" className="bg-rose-500/10 text-rose-500">
                            Archived
                          </Badge>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {c.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                        <span>Instructor: <strong className="text-neutral-800 dark:text-neutral-200">{c.instructor.name}</strong></span>
                        <span>•</span>
                        <span>{c.lessonsCount} lessons ({c.durationHours}h)</span>
                        <span>•</span>
                        <span className="font-bold text-neutral-900 dark:text-white">${c.price}</span>
                        <span>•</span>
                        <span>{c.studentsCount.toLocaleString()} enrolled</span>
                      </div>
                    </div>
                  </div>

                  {/* Course Controls */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditCourse(c)}
                      icon={<Edit3 className="w-3 h-3" />}
                    >
                      Edit
                    </Button>

                    <Button
                      variant={c.isFeatured ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleCourse(c.id, 'featured', c.isFeatured)}
                      title="Toggle visibility on landing page featured grid"
                    >
                      {c.isFeatured ? '★ Featured' : '☆ Feature'}
                    </Button>

                    <Button
                      variant={c.isBestseller ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleCourse(c.id, 'bestseller', c.isBestseller)}
                    >
                      {c.isBestseller ? 'Bestseller ✓' : 'Mark Bestseller'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleCourse(c.id, 'deleted', c.isDeleted)}
                      className={c.isDeleted ? 'text-emerald-500' : 'text-neutral-400'}
                    >
                      {c.isDeleted ? 'Restore' : 'Archive'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCourse(c.id, c.title)}
                      className="text-rose-500 hover:text-rose-600"
                      title="Permanently delete from database"
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
                          <span className="font-mono text-[11px]">{u.enrolledCount} enrolled</span>
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

              <Button
                variant="primary"
                size="sm"
                onClick={fetchDbStats}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Refresh Schemas
              </Button>
            </div>

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

      {/* ── MODAL: ADD / EDIT COURSE ─────────────────────────────────────── */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                {editingCourse ? 'Edit Course Details' : 'Create New Course'}
              </h3>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Distributed Systems & High-Throughput Microservices"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={courseForm.tagline}
                  onChange={(e) => setCourseForm({ ...courseForm, tagline: e.target.value })}
                  placeholder="e.g. Master Raft consensus, gRPC, and Kafka stream processing"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  >
                    {['Full Stack', 'Frontend', 'Backend', 'Cloud & DevOps', 'Cybersecurity', 'AI & Machine Learning', 'System Design'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={courseForm.difficulty}
                    onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  >
                    {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Original Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.originalPrice}
                    onChange={(e) => setCourseForm({ ...courseForm, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  value={courseForm.thumbnail}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Duration Hours
                  </label>
                  <input
                    type="number"
                    value={courseForm.durationHours}
                    onChange={(e) => setCourseForm({ ...courseForm, durationHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Total Lessons
                  </label>
                  <input
                    type="number"
                    value={courseForm.lessonsCount}
                    onChange={(e) => setCourseForm({ ...courseForm, lessonsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseForm.isFeatured}
                    onChange={(e) => setCourseForm({ ...courseForm, isFeatured: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Show in Featured Courses</span>
                </label>

                <label className="flex items-center gap-2 font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseForm.isBestseller}
                    onChange={(e) => setCourseForm({ ...courseForm, isBestseller: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Bestseller Badge</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCourseModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingCourse}
                >
                  {editingCourse ? 'Save Changes' : 'Publish Course'}
                </Button>
              </div>
            </form>
          </div>
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
                <Map className="w-5 h-5 text-sky-500" /> Tech Roadmaps & Learning Paths
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">{roadmapsList.length} roadmaps in catalog</p>
            </div>
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => { setEditingRoadmap(null); setRoadmapForm({ title:'', category:'web', categoryLabel:'Web Development', tagline:'', description:'', difficulty:'Intermediate', duration:'6 months', weeklyCommitment:'10–15 hrs/week', totalTopics:50, salaryBenchmark:'₹8–20 LPA', careerRoles:'Frontend Developer, Full-Stack Engineer' }); setIsRoadmapModalOpen(true); }}>
              Add Roadmap
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" placeholder="Search roadmaps…" value={roadmapSearch} onChange={e => setRoadmapSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
          </div>

          {filteredRoadmaps.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Map className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 font-medium">No roadmaps yet.</p>
              <p className="text-xs text-neutral-400 mt-1">Click "Add Roadmap" to create a learning path.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRoadmaps.map(rm => (
                <GlassCard key={rm.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500">{rm.categoryLabel}</span>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white mt-0.5 leading-tight">{rm.title}</h3>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${rm.difficulty === 'Advanced' ? 'bg-rose-100 text-rose-700' : rm.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{rm.difficulty}</span>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2">{rm.tagline}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2">
                      <div className="text-sm font-bold text-neutral-900 dark:text-white">{rm.totalTopics}</div>
                      <div className="text-[10px] text-neutral-400">Topics</div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">{rm.duration}</div>
                      <div className="text-[10px] text-neutral-400">Duration</div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2">
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">{rm.salaryBenchmark}</div>
                      <div className="text-[10px] text-neutral-400">Salary</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <Button variant="outline" size="sm" icon={<Edit3 className="w-3 h-3" />}
                      onClick={() => { setEditingRoadmap(rm); setRoadmapForm({ title: rm.title, category: rm.category, categoryLabel: rm.categoryLabel, tagline: rm.tagline, description: rm.description, difficulty: rm.difficulty, duration: rm.duration, weeklyCommitment: rm.weeklyCommitment, totalTopics: rm.totalTopics, salaryBenchmark: rm.salaryBenchmark, careerRoles: rm.careerRoles.join(', ') }); setIsRoadmapModalOpen(true); }}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" icon={<Trash2 className="w-3 h-3" />}
                      onClick={async () => { if (!window.confirm(`Delete roadmap "${rm.title}"?`)) return; const res = await adminFetch('delete_roadmap', { method: 'POST', body: JSON.stringify({ id: rm.id }) }); if (res.ok) { setRoadmapsList(prev => prev.filter(r => r.id !== rm.id)); addToast('Roadmap Deleted', `"${rm.title}" removed.`, 'info'); } }}>
                      Delete
                    </Button>
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
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Map className="w-4 h-4 text-sky-500" />
                  {editingRoadmap ? 'Edit Roadmap' : 'Add New Roadmap'}
                </h3>
                <button onClick={() => setIsRoadmapModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white font-bold">✕</button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!roadmapForm.title.trim()) { addToast('Validation Error', 'Roadmap title is required.', 'warning'); return; }
                setIsSubmittingRoadmap(true);
                try {
                  const isEditing = Boolean(editingRoadmap);
                  const payload = { ...(isEditing ? { id: editingRoadmap?.id } : {}), ...roadmapForm, careerRoles: roadmapForm.careerRoles.split(',').map(s => s.trim()).filter(Boolean) };
                  const res = await adminFetch(isEditing ? 'update_roadmap' : 'create_roadmap', { method: 'POST', body: JSON.stringify(payload) });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    addToast(isEditing ? 'Roadmap Updated' : 'Roadmap Created', `${roadmapForm.title} saved.`, 'success');
                    setIsRoadmapModalOpen(false); fetchRoadmaps();
                  } else { addToast('Error', data.error || 'Could not save roadmap.', 'warning'); }
                } catch { addToast('Network Error', 'Failed to connect.', 'warning'); }
                finally { setIsSubmittingRoadmap(false); }
              }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Roadmap Title *</label>
                    <input type="text" required value={roadmapForm.title} onChange={e => setRoadmapForm({...roadmapForm, title: e.target.value})} placeholder="Full-Stack Web Development Roadmap"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Category</label>
                    <select value={roadmapForm.category} onChange={e => setRoadmapForm({...roadmapForm, category: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500">
                      {['web','security','cloud','automation','ai','data'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Category Label</label>
                    <input type="text" value={roadmapForm.categoryLabel} onChange={e => setRoadmapForm({...roadmapForm, categoryLabel: e.target.value})} placeholder="Web Development"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Tagline</label>
                    <input type="text" value={roadmapForm.tagline} onChange={e => setRoadmapForm({...roadmapForm, tagline: e.target.value})} placeholder="Master modern web development from zero to production"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Difficulty</label>
                    <select value={roadmapForm.difficulty} onChange={e => setRoadmapForm({...roadmapForm, difficulty: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500">
                      {['Beginner','Intermediate','Advanced'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Total Topics</label>
                    <input type="number" min={1} value={roadmapForm.totalTopics} onChange={e => setRoadmapForm({...roadmapForm, totalTopics: Number(e.target.value)})}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Duration</label>
                    <input type="text" value={roadmapForm.duration} onChange={e => setRoadmapForm({...roadmapForm, duration: e.target.value})} placeholder="6 months"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Weekly Commitment</label>
                    <input type="text" value={roadmapForm.weeklyCommitment} onChange={e => setRoadmapForm({...roadmapForm, weeklyCommitment: e.target.value})} placeholder="10–15 hrs/week"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Salary Benchmark</label>
                    <input type="text" value={roadmapForm.salaryBenchmark} onChange={e => setRoadmapForm({...roadmapForm, salaryBenchmark: e.target.value})} placeholder="₹8–20 LPA"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Career Roles (comma-separated)</label>
                    <input type="text" value={roadmapForm.careerRoles} onChange={e => setRoadmapForm({...roadmapForm, careerRoles: e.target.value})} placeholder="Frontend Developer, Full-Stack Engineer, React Developer"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsRoadmapModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingRoadmap}>
                    {editingRoadmap ? 'Update Roadmap' : 'Create Roadmap'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
