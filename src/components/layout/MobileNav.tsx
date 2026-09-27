import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { 
  Home, 
  BookOpen, 
  FolderGit2, 
  StickyNote, 
  LayoutGrid, 
  X, 
  Search, 
  Sparkles, 
  Wrench, 
  FileText, 
  DownloadCloud, 
  GraduationCap, 
  Settings, 
  User, 
  ShieldCheck, 
  Sliders, 
  ChevronRight,
  Flame,
  Award,
  Sun,
  Moon,
  Cloud,
  LogOut
} from 'lucide-react';
import { RoleType } from '../../types/lms';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { tokenStorage } from '../../services/api';
import { signOutUser } from '../../services/firebaseAuth';

export const MobileNav: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    role, 
    setRole, 
    setSearchModalOpen,
    openAuthModal,
  } = useLms();

  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  const storedToken = tokenStorage.get();
  const storedUser = tokenStorage.getUser<{ name?: string; email?: string; role?: string; avatar?: string }>();
  const isUserLoggedIn = Boolean(storedToken);
  const activeRole: RoleType = role === 'admin' || storedUser?.role === 'admin' ? 'admin' : 'student';

  // 5 primary Material Design 3 Bottom Navigation items
  const mainNavItems = [
    { 
      id: 'landing', 
      label: 'Home', 
      icon: Home,
      isActive: currentView === 'landing'
    },
    { 
      id: 'courses', 
      label: 'Courses', 
      icon: BookOpen,
      isActive: currentView === 'courses' || currentView === 'course-detail' || currentView === 'learning-interface'
    },
    { 
      id: 'projects', 
      label: 'Projects', 
      icon: FolderGit2,
      badge: 'New',
      isActive: currentView === 'projects' || currentView === 'assignment'
    },
    { 
      id: 'notes', 
      label: 'Notes', 
      icon: StickyNote,
      isActive: currentView === 'notes'
    },
    { 
      id: 'menu', 
      label: 'Menu', 
      icon: LayoutGrid,
      isActive: bottomSheetOpen || ['tools', 'blog', 'resources', 'student-dashboard', 'learning-paths', 'community', 'certificate', 'settings', 'student-profile'].includes(currentView)
    },
  ];

  // Material Bottom Sheet Grid Apps
  const sheetApps = [
    {
      id: 'projects',
      label: 'Projects & Capstones',
      desc: 'Hands-on repositories & reviews',
      icon: FolderGit2,
      color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      tag: 'Portfolio'
    },
    {
      id: 'tools',
      label: 'Developer Tools',
      desc: 'JSON, Regex, JWT, Cron, UUID',
      icon: Wrench,
      color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
      tag: 'Utilities'
    },
    {
      id: 'blog',
      label: 'Engineering Blog',
      desc: 'Architecture & deep dives',
      icon: FileText,
      color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      tag: 'Read'
    },
    {
      id: 'resources',
      label: 'Free Resources',
      desc: 'Blueprints, roadmaps, cheat sheets',
      icon: DownloadCloud,
      color: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
      tag: 'Free'
    },
    {
      id: 'learning-paths',
      label: 'Learning Paths',
      desc: 'Curated multi-course tracks',
      icon: Sparkles,
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'student-dashboard',
      label: 'Learning Dashboard',
      desc: 'Enrolled courses & metrics',
      icon: GraduationCap,
      color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'community',
      label: 'Community Q&A',
      desc: 'Discussions & peer review',
      icon: User,
      color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'certificate',
      label: 'Certificates',
      desc: 'Verified graduation credentials',
      icon: Award,
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'student-profile',
      label: 'My Profile',
      desc: 'Badges, stats & activity',
      icon: ShieldCheck,
      color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    },
    {
      id: 'settings',
      label: 'Preferences',
      desc: 'Account & notification settings',
      icon: Settings,
      color: 'bg-neutral-500/15 text-neutral-600 dark:text-neutral-400',
    },
  ];

  const handleNavClick = (item: typeof mainNavItems[0]) => {
    if (item.id === 'menu') {
      setBottomSheetOpen(prev => !prev);
    } else {
      setBottomSheetOpen(false);
      setCurrentView(item.id as any);
    }
  };

  const navigateFromSheet = (viewId: string) => {
    setCurrentView(viewId as any);
    setBottomSheetOpen(false);
  };

  return (
    <>
      {/* Material UI Style Bottom Sheet Drawer for Mobile */}
      {bottomSheetOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setBottomSheetOpen(false)}
        >
          <div 
            className="w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-t-[28px] shadow-2xl p-5 space-y-5 animate-slideUp pb-24"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Material Drag Handle */}
            <div className="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto -mt-1 mb-2" />

            {/* Profile & Quick Bar */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              {isUserLoggedIn ? (
                <div className="flex items-center gap-3 min-w-0">
                  {storedUser?.avatar ? (
                    <img 
                      src={storedUser.avatar} 
                      alt={storedUser.name || 'User'}
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer" 
                      className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {storedUser?.name ? storedUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 truncate">
                      <span className="truncate">{storedUser?.name || 'Engineer'}</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 capitalize shrink-0">
                        {activeRole}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 truncate mt-0.5">
                      {storedUser?.email || 'Logged In Student'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      YC
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white">Welcome Guest</div>
                      <div className="text-[10px] text-neutral-500">Sign in to track progress</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs px-2.5 py-1"
                      onClick={() => {
                        setBottomSheetOpen(false);
                        openAuthModal('login');
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs px-2.5 py-1 font-bold"
                      onClick={() => {
                        setBottomSheetOpen(false);
                        openAuthModal('signup');
                      }}
                    >
                      Join
                    </Button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setBottomSheetOpen(false)}
                className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 transition-colors shrink-0"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Strip */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setBottomSheetOpen(false);
                  setSearchModalOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-750 transition-colors"
              >
                <Search className="w-4 h-4 text-neutral-500" />
                <span>Quick Search (⌘K)</span>
              </button>

              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Theme</span>
                <ThemeToggle variant="segmented" size="sm" />
              </div>
            </div>

            {/* Material App Grid */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-1">
                Apps & Workspaces
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {sheetApps.map((app) => {
                  const Icon = app.icon;
                  const isCurrent = currentView === app.id;
                  return (
                    <button
                      key={app.id}
                      onClick={() => navigateFromSheet(app.id)}
                      className={`flex items-start gap-3 p-3 rounded-2xl text-left border transition-all ${
                        isCurrent
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-xs'
                          : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200/80 dark:border-neutral-750/70 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isCurrent ? 'bg-white/20 text-white dark:bg-black/20 dark:text-neutral-950' : app.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold truncate">{app.label}</span>
                        </div>
                        <p className={`text-[10px] line-clamp-1 mt-0.5 ${isCurrent ? 'opacity-80' : 'text-neutral-500 dark:text-neutral-400'}`}>
                          {app.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logout & Admin Action for Logged In User */}
            {isUserLoggedIn && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <button
                  onClick={async () => {
                    setBottomSheetOpen(false);
                    await signOutUser();
                    setRole('student');
                    setCurrentView('landing');
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:opacity-80 py-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
                {activeRole === 'admin' && (
                  <button
                    onClick={() => {
                      setBottomSheetOpen(false);
                      window.location.hash = '#admin';
                      setCurrentView('admin-dashboard');
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline py-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Fixed Material Design 3 Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Bottom Navigation" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl border-t border-neutral-200/80 dark:border-neutral-800 px-3 pt-1.5 pb-2 flex items-center justify-around shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]"
      >
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="flex flex-col items-center gap-1 py-0.5 px-1 min-w-[56px] focus:outline-hidden transition-transform active:scale-95"
            >
              {/* Material Design 3 Active Indicator Pill */}
              <div 
                className={`relative w-14 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105' : ''}`} />
                
                {/* Optional Badge on icon pill */}
                {item.badge && !isActive && (
                  <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-950" />
                )}
              </div>

              {/* Material Bottom Tab Label */}
              <span className={`text-[10px] tracking-tight transition-colors leading-none ${
                isActive
                  ? 'text-neutral-950 dark:text-white font-bold'
                  : 'text-neutral-500 dark:text-neutral-400 font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
