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

// Lazy-loaded Views for High-Performance Code-Splitting
const AdminDashboardPage   = React.lazy(() => import('./views/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminAuthGate        = React.lazy(() => import('./views/AdminAuthGate').then(m => ({ default: m.AdminAuthGate })));
const LandingPage          = React.lazy(() => import('./views/LandingPage').then(m => ({ default: m.LandingPage })));
const CourseDiscoveryPage  = React.lazy(() => import('./views/CourseDiscoveryPage').then(m => ({ default: m.CourseDiscoveryPage })));
const CourseDetailsPage    = React.lazy(() => import('./views/CourseDetailsPage').then(m => ({ default: m.CourseDetailsPage })));
const StudentDashboardPage = React.lazy(() => import('./views/StudentDashboardPage').then(m => ({ default: m.StudentDashboardPage })));
const CourseLearningPage   = React.lazy(() => import('./views/CourseLearningPage').then(m => ({ default: m.CourseLearningPage })));
const QuizPage             = React.lazy(() => import('./views/QuizPage').then(m => ({ default: m.QuizPage })));
const AssignmentPage       = React.lazy(() => import('./views/AssignmentPage').then(m => ({ default: m.AssignmentPage })));
const CertificatePage      = React.lazy(() => import('./views/CertificatePage').then(m => ({ default: m.CertificatePage })));
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
const CertificateModal     = React.lazy(() => import('./components/ui/CertificateModal').then(m => ({ default: m.CertificateModal })));
const AuthModal            = React.lazy(() => import('./components/ui/AuthModal').then(m => ({ default: m.AuthModal })));

const ViewLoadingFallback: React.FC = () => (
  <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-neutral-200 dark:border-neutral-800" />
      <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
    <p className="mt-3 text-xs font-mono text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">Loading experience...</p>
  </div>
);

const isPathOrHashAdmin = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
};

const AppShell: React.FC = () => {
  const { currentView, setCurrentView, searchModalOpen, authModalOpen, certificateModal } = useLms();

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
      <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
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
      case 'courses':
        return <CourseDiscoveryPage />;
      case 'course-detail':
        return <CourseDetailsPage />;
      case 'student-dashboard':
        return <StudentDashboardPage />;
      case 'learning-interface':
        return <CourseLearningPage />;
      case 'quiz':
        return <QuizPage />;
      case 'assignment':
        return <AssignmentPage />;
      case 'certificate':
        return <CertificatePage />;
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

  const isLearningInterface = currentView === 'learning-interface';

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-950">
      {/* Sticky Global Student Navigation */}
      <Navbar />

      {/* Main Student Experience Area */}
      <main className={`flex-1 ${isLearningInterface ? 'overflow-hidden' : 'pb-28 md:pb-12'}`}>
        <React.Suspense fallback={<ViewLoadingFallback />}>
          {renderStudentView()}
        </React.Suspense>
      </main>

      {/* Global Footer (hidden only on learning player for immersion) */}
      {!isLearningInterface && <Footer />}

      {/* Mobile-Friendly Thumb Navigation */}
      {!isLearningInterface && <MobileNav />}

      {/* Modals & Notifications (Lazy-loaded on demand) */}
      <React.Suspense fallback={null}>
        {searchModalOpen && <SearchModal />}
        {certificateModal && <CertificateModal />}
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
