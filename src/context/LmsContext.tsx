import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ActiveView, 
  RoleType, 
  Course, 
  Lesson, 
  Certificate, 
  NotificationItem 
} from '../types/lms';
import { 
  MOCK_COURSES, 
  MOCK_NOTIFICATIONS, 
  BRAND_CONFIG 
} from '../data/mockData';
import { useTheme, ThemeMode, ResolvedTheme } from './ThemeContext';

interface Toast {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning';
}

interface LmsContextType {
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
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
}

const LmsContext = createContext<LmsContextType | undefined>(undefined);

export const LmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, resolvedTheme, isDark, setTheme, toggleTheme } = useTheme();
  const setIsDark = (dark: boolean) => setTheme(dark ? 'dark' : 'light');

  const [currentView, setCurrentView] = useState<ActiveView>('landing');
  const [role, setRole] = useState<RoleType>('student');
  const [brandName, setBrandName] = useState<string>(BRAND_CONFIG.name);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course>(MOCK_COURSES[0]);
  
  // Default selected lesson from course 1
  const defaultLesson = MOCK_COURSES[0].modules[0]?.chapters[0]?.lessons[2] || {
    id: "lesson-1-3",
    title: "Optimistic UI Updates with useOptimistic",
    duration: "21:30",
    type: "video",
    completed: false,
    locked: false,
    previewAvailable: false,
    description: "Deep dive into instant state feedback with safety rollbacks."
  };
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(defaultLesson);

  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState<string[]>(['course-1', 'course-2']);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
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
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return { ...c, enrolled: true, progressPercent: c.progressPercent || 5 };
      }
      return c;
    }));
    addToast("Enrollment Successful!", "Course added to your learning dashboard.", "success");
    setCurrentView('learning-interface');
  };

  const completeLesson = (lessonId: string) => {
    setSelectedLesson(prev => ({ ...prev, completed: true }));
    setCourses(prev => prev.map(c => {
      if (c.id === selectedCourse.id) {
        const newProgress = Math.min(100, (c.progressPercent || 0) + 8);
        return { ...c, progressPercent: newProgress };
      }
      return c;
    }));
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
