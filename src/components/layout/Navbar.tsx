import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLms } from '../../context/LmsContext';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  BookOpen, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  User, 
  LogOut, 
  Check, 
  Layers, 
  CheckCircle2, 
  Flame,
  Settings,
  ChevronDown,
  FileText,
  Wrench,
  DownloadCloud,
  FolderGit2,
  Cloud,
  ChevronRight,
  Compass
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';
import { BrandLogo } from '../ui/BrandLogo';
import { RoleType } from '../../types/lms';
import { tokenStorage } from '../../services/api';
import { signOutUser } from '../../services/firebaseAuth';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    role,
    setRole,
    brandName,
    setSearchModalOpen,
    openAuthModal,
    notifications,
    unreadCount,
    markAllNotificationsRead,
  } = useLms();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Live Announcement Banner from MariaDB site_settings
  const [announcement, setAnnouncement] = useState<{
    enabled: boolean;
    badge: string;
    text: string;
    link: string;
    btnText: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/settings.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const s = data.data;
          if (s.announcement_enabled === '1' && s.announcement_text) {
            setAnnouncement({
              enabled: true,
              badge: s.announcement_badge || 'ANNOUNCEMENT',
              text: s.announcement_text,
              link: s.announcement_link || '#paths',
              btnText: s.announcement_btn_text || 'Learn More →',
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  const storedToken = tokenStorage.get();
  const storedUser = tokenStorage.getUser<{ name?: string; email?: string; role?: string; avatar?: string }>();
  const isUserLoggedIn = Boolean(storedToken);
  const activeRole: RoleType = role === 'admin' || storedUser?.role === 'admin' ? 'admin' : 'student';

  // Close mobile drawer on escape key or view navigation
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setNotifDropdownOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { id: 'courses', label: 'Courses', desc: 'Interactive full-stack masterclasses', icon: BookOpen },
    { id: 'projects', label: 'Projects', desc: 'Hands-on capstones & repositories', icon: FolderGit2 },
    { id: 'learning-paths', label: 'Roadmaps', desc: 'Tech upskilling & mindtree roadmaps', icon: Sparkles },
    { id: 'notes', label: 'Notes', desc: 'Study notes & code snippets', icon: FileText },
    { id: 'tools', label: 'Tools', desc: 'JSON, Regex, JWT, Cron utilities', icon: Wrench },
    { id: 'blog', label: 'Blog', desc: 'Architecture & deep-dive guides', icon: FileText },
    { id: 'resources', label: 'Resources', desc: 'Starter templates & cheat sheets', icon: DownloadCloud },
    { id: 'community', label: 'Community', desc: 'Discussions & peer code review', icon: User },
  ];

  return (
    <>
      {/* ── Sticky Navigation Header Container (Wraps Announcement + Main Nav to prevent any misalignment) ── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
        
        {/* ── Global Announcement Banner Configured via Admin ── */}
        {announcement?.enabled && (
          <aside aria-label="Global Announcement" className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 flex items-center justify-center gap-2 sm:gap-3 text-center transition-all">
            <span className="px-2 py-0.5 rounded-full bg-white/20 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider shrink-0">
              {announcement.badge}
            </span>
            <span className="font-medium truncate max-w-[200px] xs:max-w-xs sm:max-w-md lg:max-w-xl">
              {announcement.text}
            </span>
            {announcement.link && (
              <a
                href={announcement.link}
                onClick={(e) => {
                  if (announcement.link.startsWith('#')) {
                    const target = announcement.link.replace('#', '');
                    if (target === 'paths' || target === 'roadmaps') setCurrentView('learning-paths');
                    else if (target === 'notes') setCurrentView('notes');
                    else if (target === 'tools') setCurrentView('tools');
                    else if (target === 'courses') setCurrentView('courses');
                  }
                }}
                className="inline-flex items-center gap-1 font-bold underline hover:opacity-90 shrink-0 text-[10px] sm:text-[11px]"
              >
                {announcement.btnText}
              </a>
            )}
          </aside>
        )}

        {/* ── Main Navigation Bar ── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand Logo & Adaptive Desktop Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 shrink-0 min-w-0">
            {/* Logo Area */}
            <BrandLogo
              size="md"
              brandName={brandName}
              onClick={() => setCurrentView('landing')}
              className="shrink-0"
            />

            {/* Large Desktop Navigation Links (xl+: all 9 links) */}
            <nav className="hidden 2xl:flex items-center gap-1" aria-label="Primary Desktop Navigation">
              {navLinks.map((link) => {
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setCurrentView(link.id as any)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive 
                        ? 'text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-850 font-semibold shadow-2xs' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Standard Desktop Navigation Links (xl to 2xl: top 6 core links) */}
            <nav className="hidden xl:flex 2xl:hidden items-center gap-1" aria-label="Desktop Navigation">
              {navLinks.slice(0, 6).map((link) => {
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setCurrentView(link.id as any)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive 
                        ? 'text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-850 font-semibold shadow-2xs' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Laptop Navigation Links (lg to xl: top 4 primary links) */}
            <nav className="hidden lg:flex xl:hidden items-center gap-1" aria-label="Laptop Navigation">
              {navLinks.slice(0, 4).map((link) => {
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setCurrentView(link.id as any)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive 
                        ? 'text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-850 font-semibold' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Tablet Navigation Links (sm to lg: 3 essential links) */}
            <nav className="hidden sm:flex lg:hidden items-center gap-1" aria-label="Tablet Navigation">
              {navLinks.slice(0, 3).map((link) => {
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setCurrentView(link.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      isActive 
                        ? 'text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-850 font-semibold' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Center: Global Search Bar (Visible on lg+ screens with keyboard shortcut) */}
          <div className="hidden lg:flex flex-1 max-w-xs mx-2 xl:mx-4">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-500 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-neutral-400" />
                <span className="truncate">Search courses, paths...</span>
              </div>
              <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-200 dark:bg-neutral-800 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action Controls: Search Icon (on < lg), Theme, Bell, User Profile & Hamburger */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Quick Search Button (Visible on screens < lg) */}
            <button
              id="navbar-mobile-search-btn"
              onClick={() => setSearchModalOpen(true)}
              className="lg:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors"
              aria-label="Search courses, skills, and paths"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme Toggle Button - clean icon on tablet/mobile, segmented on xl+ */}
            <div className="hidden xl:inline-flex">
              <ThemeToggle variant="segmented" size="sm" />
            </div>
            <div className="hidden sm:inline-flex xl:hidden">
              <ThemeToggle variant="icon" size="sm" />
            </div>

            {/* Notifications Bell with Dropdown */}
            <div className="relative">
              <button
                id="navbar-notifications-btn"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-neutral-950" />
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notifDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-1.5 py-0.2 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-neutral-100 dark:divide-neutral-850 max-h-72 overflow-y-auto my-1">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`py-2.5 px-1 transition-colors ${notif.read ? 'opacity-70' : 'opacity-100'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-semibold text-neutral-900 dark:text-white">
                            {notif.title}
                          </h5>
                          <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                            {notif.timeAgo}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-center">
                    <button
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        setCurrentView('student-dashboard');
                      }}
                      className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white"
                    >
                      View All in Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Auth Action */}
            {!isUserLoggedIn ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex text-xs px-2.5 py-1.5"
                  onClick={() => openAuthModal('login')}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs px-2.5 sm:px-3 py-1.5 font-bold"
                  onClick={() => openAuthModal('signup')}
                >
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Join</span>
                </Button>
              </div>
            ) : (
              <div className="relative">
                <button
                  id="navbar-user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-neutral-100/70 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer"
                  aria-label="User profile menu"
                >
                  <div className="text-right hidden md:block max-w-[100px] truncate">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white leading-none truncate">
                      {activeRole === 'admin' ? (storedUser?.name || 'Platform Admin') : (storedUser?.name || 'Student')}
                    </div>
                    <div className="text-[10px] text-neutral-500 capitalize leading-none mt-1">
                      {activeRole}
                    </div>
                  </div>
                  
                  {/* User Avatar Circle */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 ring-1 ring-neutral-300 dark:ring-neutral-700 shadow-xs">
                    {storedUser?.name ? storedUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>

                  <ChevronDown className="w-3 h-3 text-neutral-400 hidden sm:block" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-2 z-50 animate-in fade-in duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {activeRole === 'admin' ? (storedUser?.name || 'Admin Controller') : (storedUser?.name || 'Student')}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {storedUser?.email || ''}
                      </div>
                    </div>

                    <div className="space-y-0.5 text-xs">
                      {activeRole === 'admin' ? (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            window.location.hash = '#admin';
                            setCurrentView('admin-dashboard');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 font-semibold"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Open Admin Portal
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              setCurrentView('student-dashboard');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                          >
                            <GraduationCap className="w-3.5 h-3.5" /> Student Dashboard
                          </button>

                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              setCurrentView('student-profile');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                          >
                            <User className="w-3.5 h-3.5" /> Public Profile
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setCurrentView('notes');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5" /> Study Notes
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setCurrentView('tools');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                      >
                        <Wrench className="w-3.5 h-3.5" /> Developer Tools
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setCurrentView('settings');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5" /> Settings
                      </button>
                    </div>

                    <div className="pt-1 mt-1 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await signOutUser();
                          setRole('student');
                          setCurrentView('landing');
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile & Tablet Hamburger Button - Visible on all screens < xl */}
            <button
              id="mobile-main-menu-toggle-btn"
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className={`xl:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all cursor-pointer ${
                mobileMenuOpen 
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-md ring-2 ring-neutral-400/40' 
                  : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-850 active:scale-95 bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800'
              }`}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile & Tablet Full-Screen Slide-over Drawer via Portal ── */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div 
          id="mobile-tablet-nav-drawer"
          className="fixed inset-0 z-50 flex justify-end bg-neutral-950/70 backdrop-blur-xs xl:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Drawer Panel Container */}
          <div 
            className="w-full max-w-lg h-full bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Header Bar */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-850 flex items-center justify-between shrink-0">
              <BrandLogo size="sm" brandName={brandName} onClick={() => { setCurrentView('landing'); setMobileMenuOpen(false); }} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 pb-32">
              
              {/* Quick Search Action */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-100/90 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs sm:text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-neutral-400" />
                  <span>Search courses, tools, roadmaps...</span>
                </div>
                <span className="font-mono text-[10px] bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-500">⌘K</span>
              </button>

              {/* User Profile Card / Auth CTA */}
              {isUserLoggedIn ? (
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {storedUser?.name ? storedUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {storedUser?.name || 'Engineer'}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {storedUser?.email || ''}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 shrink-0"
                    icon={<LogOut className="w-3.5 h-3.5" />}
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await signOutUser();
                      setRole('student');
                      setCurrentView('landing');
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                    Master Production Software Architecture
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Join 140,000+ engineers building next-gen systems.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs justify-center"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal('login');
                      }}
                    >
                      Log In
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs justify-center font-bold"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal('signup');
                      }}
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Links Grid (1 col on small phones, 2 cols on tablet) */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1 flex items-center justify-between">
                  <span>Curriculum & Utilities</span>
                  <span className="text-[10px] font-normal text-neutral-500">9 Modules</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = currentView === link.id;
                    return (
                      <button
                        key={link.id}
                        onClick={() => {
                          setCurrentView(link.id as any);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-start gap-3 p-2.5 sm:p-3 rounded-xl text-left text-xs transition-all ${
                          isActive
                            ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs ring-1 ring-neutral-900 dark:ring-white'
                            : 'bg-neutral-50 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-800'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${
                          isActive
                            ? 'bg-white/20 dark:bg-neutral-950/20 text-white dark:text-neutral-950'
                            : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shadow-2xs'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold truncate">{link.label}</span>
                            {isActive && (
                              <span className="text-[9px] uppercase tracking-wider font-bold bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded">Active</span>
                            )}
                          </div>
                          <p className={`text-[11px] line-clamp-1 mt-0.5 ${isActive ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400'}`}>
                            {link.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Portals & Dashboards (2 cols on mobile/tablet) */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-850">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
                  Portals & Workspaces
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs h-10 px-3"
                    icon={<GraduationCap className="w-4 h-4 text-emerald-500" />}
                    onClick={() => {
                      setCurrentView('student-dashboard');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="truncate">Student Dashboard</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs h-10 px-3"
                    icon={<User className="w-4 h-4 text-cyan-500" />}
                    onClick={() => {
                      setCurrentView('student-profile');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="truncate">Public Profile</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs h-10 px-3 text-amber-600 dark:text-amber-400"
                    icon={<ShieldCheck className="w-4 h-4 text-amber-500" />}
                    onClick={() => {
                      window.location.hash = '#admin';
                      setCurrentView('admin-dashboard');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="truncate">Admin Portal</span>
                  </Button>
                </div>
              </div>

              {/* Appearance Theme Selector */}
              <div className="pt-2 pb-1 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Appearance Theme</span>
                <ThemeToggle variant="segmented" size="sm" showLabels />
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
