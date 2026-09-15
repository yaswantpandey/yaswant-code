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
    { id: 'learning-paths', label: 'Paths', desc: 'Sequential career roadmaps', icon: Sparkles },
    { id: 'workspace', label: 'Google Hub', desc: 'Drive, Calendar, Chat, Gmail', icon: Cloud },
    { id: 'notes', label: 'Notes', desc: 'Study notes & code snippets', icon: FileText },
    { id: 'tools', label: 'Tools', desc: 'JSON, Regex, JWT, Cron utilities', icon: Wrench },
    { id: 'blog', label: 'Blog', desc: 'Architecture & deep-dive guides', icon: FileText },
    { id: 'resources', label: 'Resources', desc: 'Starter templates & cheat sheets', icon: DownloadCloud },
    { id: 'community', label: 'Community', desc: 'Discussions & peer code review', icon: User },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Logo Area */}
            <BrandLogo
              size="md"
              brandName={brandName}
              onClick={() => setCurrentView('landing')}
              className="shrink-0"
            />

            {/* Desktop Navigation Links (xl+: all 9 links) */}
            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setCurrentView(link.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
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

            {/* Tablet Navigation Links (lg to xl: top 4 primary links) */}
            <nav className="hidden lg:flex xl:hidden items-center gap-1">
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
          </div>

          {/* Center/Right: Global Search Bar Trigger (Visible on Tablet md+ and Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xs mx-2 lg:mx-4">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-500 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-neutral-400" />
                <span className="truncate">Search courses, skills, paths...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-200 dark:bg-neutral-800 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Actions, Notifications, Theme, User Profile & Mobile/Tablet Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Mobile Search Button (only on small screens < md where input is hidden) */}
            <button
              id="navbar-mobile-search-btn"
              onClick={() => setSearchModalOpen(true)}
              className="md:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors"
              aria-label="Search courses, skills, and paths"
            >
              <Search className="w-4 h-4" />
            </button>

          {/* Theme Toggle (Light / Dark / System) - hidden on mobile to avoid overflow, shown on sm+ */}
          <div className="hidden sm:inline-flex">
            <ThemeToggle variant="segmented" size="sm" />
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
                className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
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
                      className={`py-3 px-1 transition-colors ${notif.read ? 'opacity-70' : 'opacity-100'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {notif.title}
                        </h5>
                        <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                          {notif.timeAgo}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
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
          {role === 'guest' ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => openAuthModal('login')}
              >
                Log In
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs px-2.5 sm:px-3.5 py-1.5 font-bold"
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
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-2 rounded-xl bg-neutral-100/70 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                aria-label="User profile menu"
              >
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white leading-none">
                    {role === 'instructor' ? 'Sarah Chen' : role === 'admin' ? 'Platform Admin' : 'Alex Mercer'}
                  </div>
                  <div className="text-[10px] text-neutral-500 capitalize leading-none mt-1">
                    {role}
                  </div>
                </div>
                <img
                  src={
                    role === 'instructor'
                      ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80'
                      : role === 'admin'
                      ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                  }
                  alt="Avatar"
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-neutral-300 dark:ring-neutral-700"
                />
                <ChevronDown className="w-3 h-3 text-neutral-400 hidden sm:block mr-1" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-2 z-50 animate-in fade-in duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      {role === 'instructor' ? 'Sarah Chen' : role === 'admin' ? 'Admin Controller' : 'Alex Mercer'}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate">
                      {role === 'instructor' ? 'sarah.chen@tech.org' : role === 'admin' ? 'admin@apex.system' : 'alex.mercer@dev.io'}
                    </div>
                  </div>

                  <div className="space-y-0.5 text-xs">
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
                        setCurrentView('instructor-dashboard');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5" /> Instructor Studio
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setCurrentView('admin-dashboard');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
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
                      onClick={() => {
                        setUserMenuOpen(false);
                        setRole('guest');
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

          {/* Mobile & Tablet Menu Hamburger Button - Visible on all screens below xl (tablets and phones) */}
          <button
            id="mobile-main-menu-toggle-btn"
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className={`xl:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
              mobileMenuOpen 
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-md ring-2 ring-neutral-400/40' 
                : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-850 active:scale-95 bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800'
            }`}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>

    {/* Mobile & Tablet Full-Screen Navigation Drawer via Portal (Escapes header stacking context) */}
    {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
      <div 
        id="mobile-tablet-nav-drawer"
        className="fixed inset-0 top-16 z-50 flex flex-col xl:hidden"
      >
        {/* Backdrop click-to-close */}
        <div 
          className="fixed inset-0 top-16 bg-neutral-950/70 backdrop-blur-xs transition-opacity cursor-pointer"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
        
        {/* Drawer Panel */}
        <div 
          className="relative w-full max-h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 shadow-2xl p-4 sm:p-6 lg:p-8 space-y-5 z-10 animate-in slide-in-from-top-2 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-4xl mx-auto space-y-5">
            
            {/* Quick Search Action */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-100/90 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs sm:text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-neutral-400" />
                <span>Search all courses, tools, roadmaps, tutorials...</span>
              </div>
              <span className="font-mono text-[10px] bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-500">⌘K</span>
            </button>

            {/* Navigation Links Grid (Responsive: 1 col on mobile, 2 cols on small tablet, 3 cols on regular tablet) */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5 px-1 flex items-center justify-between">
                <span>Explore Curriculum & Tools</span>
                <span className="text-[10px] font-normal text-neutral-500">9 Modules</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
                      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left text-xs transition-all ${
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

            {/* Quick Portals & Dashboards (2 cols on mobile, 4 cols on tablet) */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-850">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5 px-1">
                Portals & Workspaces
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  icon={<Cloud className="w-4 h-4 text-blue-500" />}
                  onClick={() => {
                    setCurrentView('workspace');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="truncate">Google Workspace</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs h-10 px-3"
                  icon={<Layers className="w-4 h-4 text-purple-500" />}
                  onClick={() => {
                    setCurrentView('instructor-dashboard');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="truncate">Instructor Studio</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs h-10 px-3"
                  icon={<ShieldCheck className="w-4 h-4 text-amber-500" />}
                  onClick={() => {
                    setCurrentView('admin-dashboard');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="truncate">Admin SaaS Portal</span>
                </Button>
              </div>
            </div>

            {/* Role & Persona Switcher */}
            <div className="p-3 sm:p-4 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                <span>Active Persona Role</span>
                <Badge variant={role === 'guest' ? 'neutral' : 'emerald'} size="sm">
                  {role}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-medium">
                {(['student', 'instructor', 'admin', 'guest'] as RoleType[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      if (r === 'student') setCurrentView('student-dashboard');
                      if (r === 'instructor') setCurrentView('instructor-dashboard');
                      if (r === 'admin') setCurrentView('admin-dashboard');
                      if (r === 'guest') setCurrentView('landing');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-center capitalize text-xs font-medium transition-all cursor-pointer ${
                      role === r
                        ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs'
                        : 'bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Appearance Theme Selector */}
            <div className="pt-2 pb-1 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Appearance Theme</span>
              <ThemeToggle variant="segmented" size="sm" showLabels />
            </div>

            {/* Guest Sign In Strip (if not logged in) */}
            {role === 'guest' && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-850 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full sm:flex-1 justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:flex-1 justify-center font-bold"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                >
                  Sign Up Free
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body
    )}
  </>
  );
};
