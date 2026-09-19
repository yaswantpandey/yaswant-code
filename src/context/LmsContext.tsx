import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  ActiveView, 
  RoleType, 
  Course, 
  Lesson, 
  Certificate, 
  NotificationItem 
} from '../types/lms';
import { BRAND_CONFIG, PRIMARY_INSTRUCTOR } from '../config/brand';
import { useTheme, ThemeMode, ResolvedTheme } from './ThemeContext';
import { syncCourseEnrollment, syncLessonProgress } from '../services/firebaseAuth';
import { mapApiCourseToLmsCourse } from '../services/courseMapper';
import { parseCurrentLocation, syncUrlWithView } from '../services/router';

interface Toast {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning';
}

interface LmsContextType {
  currentView: ActiveView;
  setCurrentView: (view: ActiveView, customCourse?: Course) => void;
  role: RoleType;
  setRole: (role: RoleType) => void;
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  toggleTheme: () => void;
  brandName: string;
  setBrandName: (name: string) => void;
  courses: Course[];
  selectedCourse: Course;
  setSelectedCourse: (course: Course) => void;
  selectedLesson: Lesson;
  setSelectedLesson: (lesson: Lesson) => void;
  bookmarkedCourseIds: string[];
  toggleBookmark: (courseId: string) => void;
  enrollCourse: (courseId: string) => void;
  completeLesson: (lessonId: string) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markAllNotificationsRead: () => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot' | 'verify';
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot' | 'verify') => void;
  closeAuthModal: () => void;
  certificateModal: Certificate | null;
  setCertificateModal: (cert: Certificate | null) => void;
  toasts: Toast[];
  addToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  emptyStateSimulated: boolean;
  toggleEmptyState: () => void;
  refreshCourses: () => Promise<void>;
  isLoadingCourses: boolean;
}

const LmsContext = createContext<LmsContextType | undefined>(undefined);

export const LmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, resolvedTheme, isDark, setTheme, toggleTheme } = useTheme();
  const setIsDark = (dark: boolean) => setTheme(dark ? 'dark' : 'light');

  // Parse initial view and course from browser URL / hash
  const initialLocation = parseCurrentLocation();
  const [currentView, setCurrentViewInternal] = useState<ActiveView>(initialLocation.view);
  const [pendingCourseId, setPendingCourseId] = useState<string | undefined>(initialLocation.courseId);

  const EMPTY_COURSE: Course = {
    id: '',
    title: 'Loading Course Catalog...',
    tagline: '',
    description: '',
    thumbnail: '',
    instructor: PRIMARY_INSTRUCTOR,
    category: 'General',
    difficulty: 'All Levels',
    rating: 5.0,
    reviewsCount: 0,
    studentsCount: 0,
    durationHours: 0,
    lessonsCount: 0,
    price: 0,
    language: 'English & Hindi',
    lastUpdated: new Date().toISOString().split('T')[0],
    hasCertificate: true,
    whatYouWillLearn: [],
    requirements: [],
    modules: [],
    skills: [],
    projectsCount: 0,
  };

  const EMPTY_LESSON: Lesson = {
    id: '',
    title: 'No Lesson Selected',
    duration: '0:00',
    type: 'video',
    completed: false,
    locked: false,
  };

  const [role, setRole] = useState<RoleType>('student');
  const [brandName, setBrandName] = useState<string>(BRAND_CONFIG.name);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(true);
  const [selectedCourse, setSelectedCourseState] = useState<Course>(EMPTY_COURSE);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(EMPTY_LESSON);
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Synchronize view changes with browser URL and update window history
  const setCurrentView = useCallback((view: ActiveView, customCourse?: Course) => {
    setCurrentViewInternal(view);
    const course = customCourse || selectedCourse;
    syncUrlWithView(view, course);
    if (typeof window !== 'undefined' && window.scrollY > 80) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedCourse]);

  // Wrapped setSelectedCourse that syncs URL if currently in course-detail or learn
  const setSelectedCourse = useCallback((course: Course) => {
    setSelectedCourseState(course);
    setCurrentViewInternal(prev => {
      if (prev === 'course-detail' || prev === 'learning-interface') {
        syncUrlWithView(prev, course, true);
      }
      return prev;
    });
  }, []);

  // Handle browser Back / Forward buttons (popstate event)
  useEffect(() => {
    const handlePopState = () => {
      const loc = parseCurrentLocation();
      setCurrentViewInternal(loc.view);
      if (loc.courseId) {
        setPendingCourseId(loc.courseId);
      }
      syncUrlWithView(loc.view, selectedCourse, true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedCourse]);

  // Initial canonical URL normalization (e.g. converting #notes to /notes)
  useEffect(() => {
    syncUrlWithView(initialLocation.view, selectedCourse, true);
  }, []);
  
  // Refresh live courses from Hostinger MySQL /api/courses.php
  const refreshCourses = useCallback(async () => {
    try {
      setIsLoadingCourses(true);
      const res = await fetch('/api/courses.php?per_page=100');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const rawCourses = Array.isArray(json.data)
            ? json.data
            : (Array.isArray(json.data.courses) ? json.data.courses : []);

          const mappedCourses = rawCourses.map(mapApiCourseToLmsCourse);
          setCourses(mappedCourses);

          if (mappedCourses.length > 0) {
            setSelectedCourseState(prev => {
              if (pendingCourseId) {
                const matched = mappedCourses.find(c => 
                  c.id === pendingCourseId || 
                  c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === pendingCourseId
                );
                if (matched) {
                  setPendingCourseId(undefined);
                  syncUrlWithView(initialLocation.view, matched, true);
                  return matched;
                }
              }
              const existing = mappedCourses.find(c => c.id === prev?.id);
              return existing || mappedCourses[0];
            });
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch live courses from API, maintaining fallback:', err);
    } finally {
      setIsLoadingCourses(false);
    }
  }, [pendingCourseId, initialLocation.view]);

  // Fetch live courses on platform initial mount
  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  // Selected lesson updates when course changes
  useEffect(() => {
    if (selectedCourse?.modules?.[0]?.chapters?.[0]?.lessons?.[0]) {
      setSelectedLesson(selectedCourse.modules[0].chapters[0].lessons[0]);
    }
  }, [selectedCourse]);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot' | 'verify'>('login');
  const [certificateModal, setCertificateModal] = useState<Certificate | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [emptyStateSimulated, setEmptyStateSimulated] = useState<boolean>(false);

  const addToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleBookmark = (courseId: string) => {
    setBookmarkedCourseIds(prev => {
      const exists = prev.includes(courseId);
      if (exists) {
        addToast("Removed from Bookmarks", undefined, "info");
        return prev.filter(id => id !== courseId);
      } else {
        addToast("Saved to Bookmarks", "You can easily review this course in your library.", "success");
        return [...prev, courseId];
      }
    });
  };

  const enrollCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return { ...c, enrolled: true, progressPercent: c.progressPercent || 5 };
      }
      return c;
    }));
    if (course) {
      syncCourseEnrollment(courseId, course.title);
    }
    addToast("Enrollment Successful!", "Course added to your learning dashboard.", "success");
    setCurrentView('learning-interface');
  };

  const completeLesson = (lessonId: string) => {
    setSelectedLesson(prev => ({ ...prev, completed: true }));
    let updatedProgress = 0;
    setCourses(prev => prev.map(c => {
      if (c.id === selectedCourse.id) {
        const newProgress = Math.min(100, (c.progressPercent || 0) + 8);
        updatedProgress = newProgress;
        return { ...c, progressPercent: newProgress };
      }
      return c;
    }));
    if (selectedCourse?.id) {
      syncLessonProgress(selectedCourse.id, updatedProgress);
    }
    addToast("Lesson Completed!", "+25 XP added to your daily streak.", "success");
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast("Notifications Cleared", "All alerts marked as read.", "info");
  };

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot' | 'verify' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const toggleEmptyState = () => {
    setEmptyStateSimulated(prev => !prev);
    addToast("Toggled Empty States", emptyStateSimulated ? "Normal preview content restored" : "Simulating zero-data/empty state", "info");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <LmsContext.Provider
      value={{
        currentView,
        setCurrentView,
        role,
        setRole,
        theme,
        resolvedTheme,
        setTheme,
        isDark,
        setIsDark,
        toggleTheme,
        brandName,
        setBrandName,
        courses,
        selectedCourse,
        setSelectedCourse,
        selectedLesson,
        setSelectedLesson,
        bookmarkedCourseIds,
        toggleBookmark,
        enrollCourse,
        completeLesson,
        notifications,
        unreadCount,
        markAllNotificationsRead,
        searchModalOpen,
        setSearchModalOpen,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        certificateModal,
        setCertificateModal,
        toasts,
        addToast,
        removeToast,
        emptyStateSimulated,
        toggleEmptyState,
        refreshCourses,
        isLoadingCourses,
      }}
    >
      {children}
    </LmsContext.Provider>
  );
};

export const useLms = () => {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error('useLms must be used within an LmsProvider');
  }
  return context;
};
