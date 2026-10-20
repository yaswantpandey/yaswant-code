import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLms } from '../../context/LmsContext';
import { safeHref } from '../../lib/safeHref';
import {
  Search,
  Bell,
  Menu,
  X,
  GraduationCap,
  ShieldCheck,
  User,
  Users,
  LogOut,
  Settings,
  ChevronDown,
  ChevronRight,
  FileText,
  BookOpen,
  Wrench,
  DownloadCloud,
  FolderGit2,
  Compass
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { BrandLogo } from '../ui/BrandLogo';
import { PushSubscribeButton } from '../ui/PushSubscribeButton';
import { RoleType } from '../../types/lms';
import { tokenStorage } from '../../services/api';

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

  // Live Announcement Banner from MariaDB site_settings (initialized synchronously to avoid CLS)
  const DEFAULT_ANNOUNCEMENT = {
    enabled: true,
    badge: 'NEW RELEASE',
    text: 'Welcome to Yaswant Code — Direct ZIP developer downloads & university study notes now available!',
    link: '#paths',
    btnText: 'Explore Roadmaps →',
  };

  const [announcement, setAnnouncement] = useState<{
    enabled: boolean;
    badge: string;
    text: string;
    link: string;
    btnText: string;
  } | null>(() => {
    try {
      const cached = localStorage.getItem('yaswant_announcement');
      return cached ? JSON.parse(cached) : DEFAULT_ANNOUNCEMENT;
    } catch {
      return DEFAULT_ANNOUNCEMENT;
    }
  });

  useEffect(() => {
    fetch('/api/settings.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const s = data.data;
          if (s.announcement_enabled === '1' && s.announcement_text) {
            const fresh = {
              enabled: true,
              badge: s.announcement_badge || 'ANNOUNCEMENT',
              text: s.announcement_text,
              link: s.announcement_link || '#paths',
              btnText: s.announcement_btn_text || 'Learn More →',
            };
            setAnnouncement(fresh);
            try { localStorage.setItem('yaswant_announcement', JSON.stringify(fresh)); } catch {}
          } else {
            setAnnouncement(null);
            try { localStorage.removeItem('yaswant_announcement'); } catch {}
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
    { id: 'learning-paths', label: 'Roadmaps', desc: 'Step-by-step career tracks', icon: Compass },
    { id: 'projects', label: 'Projects', desc: 'Hands-on capstones & repositories', icon: FolderGit2 },
    { id: 'notes', label: 'Notes', desc: 'Study notes & code snippets', icon: FileText },
    { id: 'tools', label: 'Tools', desc: 'JSON, Regex, JWT, Cron utilities', icon: Wrench },
    { id: 'blog', label: 'Blog', desc: 'Architecture & deep-dive guides', icon: BookOpen },
    { id: 'resources', label: 'Resources', desc: 'Starter templates & cheat sheets', icon: DownloadCloud },
    { id: 'community', label: 'Community', desc: 'Discussions & peer code review', icon: Users },
  ];

  // How many links fit inline at each breakpoint; the rest live in the drawer.
  const inlineVisibility = (i: number) =>
    i < 4 ? 'hidden lg:inline-flex' : i < 6 ? 'hidden xl:inline-flex' : 'hidden 2xl:inline-flex';

  const signOut = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    const { signOutUser } = await import('../../services/firebaseAuth');
    await signOutUser();
    setRole('student');
    setCurrentView('landing');
  };

  const openAdmin = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    window.location.hash = '#admin';
    setCurrentView('admin-dashboard');
  };

  const iconBtn =
    'relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors';
  const menuItem =
    'w-full text-left px-3 py-2 rounded-lg text-ink-2 hover:text-ink hover:bg-surface-2 flex items-center gap-2.5 transition-colors';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-paper/85 backdrop-blur-md border-b border-line">

        {/* ── Announcement (configured from the admin panel) ── */}
        {announcement?.enabled && (
          <aside
            aria-label="Announcement"
            className="w-full bg-neutral-950 dark:bg-neutral-900 dark:border-b dark:border-line text-neutral-50 text-[11px] sm:text-xs py-2 px-4 flex items-center justify-center gap-2 sm:gap-3 text-center"
          >
            <span className="hidden sm:inline font-mono uppercase tracking-[0.14em] text-[10px] text-brand-300 shrink-0">
              {announcement.badge}
            </span>
            <span className="truncate max-w-[220px] sm:max-w-md lg:max-w-xl text-neutral-300">
              {announcement.text}
            </span>
            {announcement.link && (
              <a
                href={safeHref(announcement.link)}
                onClick={(e) => {
                  if (announcement.link.startsWith('#')) {
                    const target = announcement.link.replace('#', '');
                    if (target === 'paths' || target === 'roadmaps') setCurrentView('learning-paths');
                    else if (target === 'notes') setCurrentView('notes');
                    else if (target === 'tools') setCurrentView('tools');
                  }
                }}
                className="font-semibold underline underline-offset-2 decoration-neutral-500 hover:decoration-neutral-50 shrink-0 text-neutral-50"
              >
                {announcement.btnText}
              </a>
            )}
          </aside>
        )}

        {/* ── Main bar ── */}
        <div className="container-page h-16 flex items-center justify-between gap-3">

          <div className="flex items-center gap-6 min-w-0">
            <BrandLogo
              size="md"
              brandName={brandName}
              onClick={() => setCurrentView('landing')}
              className="shrink-0"
            />

            <nav className="flex items-center gap-0.5" aria-label="Primary">
              {navLinks.map((link, i) => {
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setCurrentView(link.id as any)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${inlineVisibility(i)} relative items-center h-9 px-3 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'text-ink'
                        : 'text-ink-2 hover:text-ink hover:bg-surface-2'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span aria-hidden className="absolute left-3 right-3 -bottom-[13px] h-0.5 rounded-full bg-brand" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Search */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="hidden md:flex items-center gap-2 h-9 pl-3 pr-2 mr-1 rounded-lg border border-line bg-surface text-xs text-ink-3 hover:text-ink-2 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors w-44 lg:w-52"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="flex-1 text-left truncate">Search…</span>
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-line text-ink-3">⌘K</kbd>
            </button>
            <button
              id="navbar-mobile-search-btn"
              onClick={() => setSearchModalOpen(true)}
              className={`md:hidden ${iconBtn}`}
              aria-label="Search roadmaps, projects, and resources"
            >
              <Search className="w-4 h-4" />
            </button>

            <div className="hidden sm:inline-flex">
              <ThemeToggle variant="icon" size="sm" />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                id="navbar-notifications-btn"
                onClick={() => { setNotifDropdownOpen(!notifDropdownOpen); setUserMenuOpen(false); }}
                className={iconBtn}
                aria-label="Notifications"
                aria-expanded={notifDropdownOpen}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand ring-2 ring-paper" />
                )}
              </button>

              {notifDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-surface border border-line shadow-xl shadow-neutral-950/10 p-4 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-line">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-semibold bg-brand text-on-brand px-1.5 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-ink-3 hover:text-ink font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-line max-h-72 overflow-y-auto my-1">
                    {notifications.length === 0 && (
                      <p className="py-6 text-center text-xs text-ink-3">You're all caught up.</p>
                    )}
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`py-3 ${notif.read ? 'opacity-60' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-semibold text-ink">{notif.title}</h5>
                          <span className="text-[10px] text-ink-3 shrink-0 font-mono">{notif.timeAgo}</span>
                        </div>
                        <p className="text-xs text-ink-2 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-line space-y-3">
                    <PushSubscribeButton />
                    <button
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        setCurrentView('student-dashboard');
                      }}
                      className="w-full text-center text-xs font-semibold text-ink-2 hover:text-accent"
                    >
                      View all in dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Account */}
            {!isUserLoggedIn ? (
              <div className="flex items-center gap-1 ml-1">
                <div className="hidden md:block">
                  <Button variant="ghost" size="sm" icon={null} onClick={() => openAuthModal('login')}>
                    Log in
                  </Button>
                </div>
                <Button variant="primary" size="sm" icon={null} onClick={() => openAuthModal('signup')}>
                  <span className="hidden sm:inline">Sign up free</span>
                  <span className="sm:hidden">Join</span>
                </Button>
              </div>
            ) : (
              <div className="relative ml-1">
                <button
                  id="navbar-user-menu-btn"
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifDropdownOpen(false); }}
                  className="flex items-center gap-1.5 h-9 pl-1 pr-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                  aria-label="Account menu"
                  aria-expanded={userMenuOpen}
                >
                  <span className="w-7 h-7 rounded-md bg-brand text-on-brand font-semibold text-xs flex items-center justify-center">
                    {storedUser?.name ? storedUser.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-3 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 rounded-xl bg-surface border border-line shadow-xl shadow-neutral-950/10 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-2.5 border-b border-line mb-1">
                      <div className="text-sm font-semibold text-ink truncate">
                        {storedUser?.name || (activeRole === 'admin' ? 'Admin' : 'Student')}
                      </div>
                      <div className="text-xs text-ink-3 truncate">{storedUser?.email || activeRole}</div>
                    </div>

                    {activeRole === 'admin' && (
                      <button onClick={openAdmin} className={`${menuItem} text-accent font-semibold`}>
                        <ShieldCheck className="w-4 h-4" /> Admin portal
                      </button>
                    )}
                    <button onClick={() => { setUserMenuOpen(false); setCurrentView('student-dashboard'); }} className={menuItem}>
                      <GraduationCap className="w-4 h-4" /> Dashboard
                    </button>
                    <button onClick={() => { setUserMenuOpen(false); setCurrentView('student-profile'); }} className={menuItem}>
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button onClick={() => { setUserMenuOpen(false); setCurrentView('settings'); }} className={menuItem}>
                      <Settings className="w-4 h-4" /> Settings
                    </button>

                    <div className="pt-1 mt-1 border-t border-line">
                      <button onClick={signOut} className={`${menuItem} text-rose-600 dark:text-rose-400 hover:text-rose-600`}>
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Drawer toggle — below 2xl not every link fits inline */}
            <button
              id="mobile-main-menu-toggle-btn"
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className={`2xl:hidden ml-1 ${iconBtn} border border-line`}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Slide-over drawer ── */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div
          id="mobile-tablet-nav-drawer"
          className="fixed inset-0 z-50 flex justify-end bg-neutral-950/50 backdrop-blur-[2px] 2xl:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="w-full max-w-sm h-full bg-paper border-l border-line shadow-2xl flex flex-col animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 px-5 border-b border-line flex items-center justify-between shrink-0">
              <BrandLogo size="sm" brandName={brandName} onClick={() => { setCurrentView('landing'); setMobileMenuOpen(false); }} />
              <button onClick={() => setMobileMenuOpen(false)} className={iconBtn} aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 pb-32">
              <button
                onClick={() => { setMobileMenuOpen(false); setSearchModalOpen(true); }}
                className="w-full flex items-center gap-2.5 h-11 px-3.5 rounded-lg border border-line bg-surface text-sm text-ink-3 hover:text-ink-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search roadmaps, notes, tools…</span>
              </button>

              <nav aria-label="All sections">
                <p className="eyebrow mb-3">Explore</p>
                <ul className="divide-y divide-line border-y border-line">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = currentView === link.id;
                    return (
                      <li key={link.id}>
                        <button
                          onClick={() => { setCurrentView(link.id as any); setMobileMenuOpen(false); }}
                          aria-current={isActive ? 'page' : undefined}
                          className="w-full flex items-center gap-3.5 py-3.5 text-left group"
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : 'text-ink-3 group-hover:text-ink-2'}`} />
                          <span className="flex-1 min-w-0">
                            <span className={`block text-sm font-semibold ${isActive ? 'text-accent' : 'text-ink'}`}>{link.label}</span>
                            <span className="block text-xs text-ink-3 truncate">{link.desc}</span>
                          </span>
                          <ChevronRight className="w-4 h-4 text-ink-3 shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {isUserLoggedIn ? (
                <div>
                  <p className="eyebrow mb-3">Your account</p>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-lg bg-brand text-on-brand font-semibold flex items-center justify-center shrink-0">
                      {storedUser?.name ? storedUser.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{storedUser?.name || 'Engineer'}</p>
                      <p className="text-xs text-ink-3 truncate">{storedUser?.email || ''}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" icon={<GraduationCap className="w-4 h-4" />} className="justify-start" onClick={() => { setCurrentView('student-dashboard'); setMobileMenuOpen(false); }}>
                      Dashboard
                    </Button>
                    <Button variant="outline" size="sm" icon={<User className="w-4 h-4" />} className="justify-start" onClick={() => { setCurrentView('student-profile'); setMobileMenuOpen(false); }}>
                      Profile
                    </Button>
                    {activeRole === 'admin' && (
                      <Button variant="outline" size="sm" icon={<ShieldCheck className="w-4 h-4" />} className="justify-start" onClick={openAdmin}>
                        Admin
                      </Button>
                    )}
                    <Button variant="danger" size="sm" icon={<LogOut className="w-4 h-4" />} className="justify-start" onClick={signOut}>
                      Sign out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-line bg-surface p-4">
                  <p className="text-sm font-semibold text-ink">Learn production engineering</p>
                  <p className="text-xs text-ink-2 mt-1">Free roadmaps, notes and developer tools.</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" icon={null} className="flex-1" onClick={() => { setMobileMenuOpen(false); openAuthModal('login'); }}>
                      Log in
                    </Button>
                    <Button variant="primary" size="sm" icon={null} className="flex-1" onClick={() => { setMobileMenuOpen(false); openAuthModal('signup'); }}>
                      Sign up free
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-2">Theme</span>
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
