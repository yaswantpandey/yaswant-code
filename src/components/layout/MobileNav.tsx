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
  Cloud
} from 'lucide-react';
import { RoleType } from '../../types/lms';
import { ThemeToggle } from '../ui/ThemeToggle';

export const MobileNav: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    role, 
    setRole, 
    setSearchModalOpen,
    userProfile 
  } = useLms();

  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

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
      id: 'workspace',
      label: 'Google Workspace',
      desc: 'Drive, Calendar, Chat, Gmail',
      icon: Cloud,
      color: 'bg-blue-600/15 text-blue-600 dark:text-blue-400',
      tag: 'Google'
    },
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
      id: role === 'instructor' ? 'instructor-dashboard' : role === 'admin' ? 'admin-dashboard' : 'student-dashboard',
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
              <div className="flex items-center gap-3">
                <img 
                  src={userProfile.avatar} 
                  alt={userProfile.name}
                  referrerPolicy="no-referrer" 
                  className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-neutral-800 shadow-xs"
                />
                <div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <span>{userProfile.name}</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 capitalize">
                      {role}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" /> 12 day streak
                    </span>
                    <span>•</span>
                    <span>Level 14</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setBottomSheetOpen(false)}
                className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 transition-colors"
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

            {/* Persona Switcher Strip */}
            <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                <span>Active Persona Role</span>
                <span className="font-mono text-[11px] text-emerald-500 capitalize">{role}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
                {(['student', 'instructor', 'admin', 'guest'] as RoleType[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      if (r === 'student') setCurrentView('student-dashboard');
                      if (r === 'instructor') setCurrentView('instructor-dashboard');
                      if (r === 'admin') setCurrentView('admin-dashboard');
                      if (r === 'guest') setCurrentView('landing');
                      setBottomSheetOpen(false);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-center capitalize transition-all ${
                      role === r
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs'
                        : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

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
