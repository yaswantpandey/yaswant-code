import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LmsProvider, useLms } from './context/LmsContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/ui/ToastContainer';
import { tokenStorage } from './services/api';
import { setRobotsDirective } from './services/seo';
import { isPrivateView } from './services/router';

// LandingPage is eager — it is the first thing every visitor sees, so it must
// be in the initial bundle. Making it lazy creates a Navbar+spinner mismatch
// and a 3-hop waterfall (index → LandingPage → vendor-motion) before anything renders.
import { LandingPage } from './views/LandingPage';

// Lazy-loaded Views — pages users may never visit on a given session
const AdminDashboardPage   = React.lazy(() => import('./views/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminAuthGate        = React.lazy(() => import('./views/AdminAuthGate').then(m => ({ default: m.AdminAuthGate })));
const StudentDashboardPage = React.lazy(() => import('./views/StudentDashboardPage').then(m => ({ default: m.StudentDashboardPage })));
const LearningPathsPage    = React.lazy(() => import('./views/LearningPathsPage').then(m => ({ default: m.LearningPathsPage })));
const CommunityPage        = React.lazy(() => import('./views/CommunityPage').then(m => ({ default: m.CommunityPage })));
const StudentProfilePage   = React.lazy(() => import('./views/StudentProfilePage').then(m => ({ default: m.StudentProfilePage })));
const SettingsPage         = React.lazy(() => import('./views/SettingsPage').then(m => ({ default: m.SettingsPage })));
const BlogPage             = React.lazy(() => import('./views/BlogPage').then(m => ({ default: m.BlogPage })));
const FreeResourcesPage    = React.lazy(() => import('./views/FreeResourcesPage').then(m => ({ default: m.FreeResourcesPage })));
const NotesPage            = React.lazy(() => import('./views/NotesPage').then(m => ({ default: m.NotesPage })));
const ToolsPage            = React.lazy(() => import('./views/ToolsPage').then(m => ({ default: m.ToolsPage })));
const ProjectsPage         = React.lazy(() => import('./views/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const SearchModal          = React.lazy(() => import('./components/ui/SearchModal').then(m => ({ default: m.SearchModal })));
const AuthModal            = React.lazy(() => import('./components/ui/AuthModal').then(m => ({ default: m.AuthModal })));

const ViewLoadingFallback: React.FC = () => (
  <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-neutral-200 dark:border-neutral-800" />
      <div className="absolute inset-0 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
    <p className="mt-3 text-xs font-mono text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">Loading experience...</p>
  </div>
);

const isPathOrHashAdmin = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
};

const AppShell: React.FC = () => {
  const { currentView, setCurrentView, searchModalOpen, authModalOpen } = useLms();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const user = tokenStorage.getUser<{ role?: string }>();
    const hasToken = Boolean(tokenStorage.get());
    return hasToken && user?.role === 'admin';
  });

  // Keep admin authentication status in sync with stored token
  useEffect(() => {
    const user = tokenStorage.getUser<{ role?: string }>();
    const hasToken = Boolean(tokenStorage.get());
    setIsAdminAuthenticated(hasToken && user?.role === 'admin');
  }, [currentView]);

  // Apply SEO robots directive based on current view
  useEffect(() => {
    if (isPrivateView(currentView)) {
      setRobotsDirective('noindex, nofollow');
    } else {
      setRobotsDirective('index, follow');
    }
  }, [currentView]);

  const isAdminRoute = currentView === 'admin-dashboard' || isPathOrHashAdmin();

  // ── 1. ISOLATED ADMIN ROUTE (/admin or #admin) ────────────────────────────
  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return (
        <React.Suspense fallback={<ViewLoadingFallback />}>
          <AdminAuthGate 
            onAuthenticated={() => setIsAdminAuthenticated(true)}
            onExit={() => {
              setCurrentView('landing');
            }}
          />
          <ToastContainer />
        </React.Suspense>
      );
    }

    return (
      <div className="min-h-screen bg-paper text-ink transition-colors duration-200">
        <React.Suspense fallback={<ViewLoadingFallback />}>
          <AdminDashboardPage />
        </React.Suspense>
        <ToastContainer />
      </div>
    );
  }

  // ── 2. ISOLATED STUDENT PLATFORM & PUBLIC VIEWS ───────────────────────────
  const renderStudentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'student-dashboard':
        return <StudentDashboardPage />;
      case 'learning-paths':
        return <LearningPathsPage />;
      case 'community':
        return <CommunityPage />;
      case 'student-profile':
        return <StudentProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'blog':
        return <BlogPage />;
      case 'resources':
        return <FreeResourcesPage />;
      case 'notes':
        return <NotesPage />;
      case 'tools':
        return <ToolsPage />;
      case 'projects':
        return <ProjectsPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink transition-colors duration-200">
      {/* Sticky Global Student Navigation */}
      <Navbar />

      {/* Main Student Experience Area */}
      <main className="flex-1 pb-28 md:pb-12">
        <React.Suspense fallback={<ViewLoadingFallback />}>
          {renderStudentView()}
          <Footer />
        </React.Suspense>
      </main>

      {/* Mobile-Friendly Thumb Navigation */}
      <MobileNav />

      {/* Modals & Notifications (Lazy-loaded on demand) */}
      <React.Suspense fallback={null}>
        {searchModalOpen && <SearchModal />}
        {authModalOpen && <AuthModal />}
      </React.Suspense>
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LmsProvider>
        <AppShell />
      </LmsProvider>
    </ThemeProvider>
  );
}
