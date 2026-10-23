import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ActiveView, RoleType, NotificationItem } from '../types/lms';
import { BRAND_CONFIG } from '../config/brand';
import { useTheme, ThemeMode, ResolvedTheme } from './ThemeContext';
import { parseCurrentLocation, syncUrlWithView } from '../services/router';

interface Toast {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning';
}

interface LmsContextType {
  currentView: ActiveView;
  /** `slug` selects the roadmap track or blog article for views that take one */
  setCurrentView: (view: ActiveView, slug?: string) => void;
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
  notifications: NotificationItem[];
  unreadCount: number;
  markAllNotificationsRead: () => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot' | 'verify';
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot' | 'verify') => void;
  closeAuthModal: () => void;
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

  // Parse initial view from browser URL / hash
  const initialLocation = parseCurrentLocation();
  const [currentView, setCurrentViewInternal] = useState<ActiveView>(initialLocation.view);

  const [role, setRole] = useState<RoleType>('student');
  const [brandName, setBrandName] = useState<string>(BRAND_CONFIG.name);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Synchronize view changes with browser URL and update window history
  const setCurrentView = useCallback((view: ActiveView, slug?: string) => {
    setCurrentViewInternal(view);
    syncUrlWithView(view, false, slug);
    if (typeof window !== 'undefined' && window.scrollY > 80) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Handle browser Back / Forward buttons (popstate event)
  useEffect(() => {
    const handlePopState = () => {
      const loc = parseCurrentLocation();
      setCurrentViewInternal(loc.view);
      syncUrlWithView(loc.view, true, loc.roadmapSlug);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial canonical URL normalization (e.g. converting #notes to /notes)
  useEffect(() => {
    syncUrlWithView(initialLocation.view, true, initialLocation.roadmapSlug);
  }, []);
  
  // Fetch real notifications from database
  useEffect(() => {
    fetch('/api/notifications.php')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data?.notifications && Array.isArray(json.data.notifications)) {
          setNotifications(json.data.notifications.map((n: any) => ({
            id: String(n.id),
            title: n.title,
            message: n.message,
            timeAgo: n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now',
            type: n.type || 'announcement',
            read: Boolean(n.is_read),
            link: n.link || undefined
          })));
        }
      })
      .catch(() => {});
  }, []);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot' | 'verify'>('login');
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
        notifications,
        unreadCount,
        markAllNotificationsRead,
        searchModalOpen,
        setSearchModalOpen,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
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
