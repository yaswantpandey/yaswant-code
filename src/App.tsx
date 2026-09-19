import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LmsProvider, useLms } from './context/LmsContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { SearchModal } from './components/ui/SearchModal';
import { CertificateModal } from './components/ui/CertificateModal';
import { AuthModal } from './components/ui/AuthModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { tokenStorage } from './services/api';
import { setRobotsDirective } from './services/seo';
import { isPrivateView } from './services/router';

// Admin Views
import { AdminDashboardPage } from './views/AdminDashboardPage';
import { AdminAuthGate } from './views/AdminAuthGate';

// Student & Public Views
import { LandingPage } from './views/LandingPage';
import { CourseDiscoveryPage } from './views/CourseDiscoveryPage';
import { CourseDetailsPage } from './views/CourseDetailsPage';
import { StudentDashboardPage } from './views/StudentDashboardPage';
import { CourseLearningPage } from './views/CourseLearningPage';
import { QuizPage } from './views/QuizPage';
import { AssignmentPage } from './views/AssignmentPage';
import { CertificatePage } from './views/CertificatePage';
import { LearningPathsPage } from './views/LearningPathsPage';
import { CommunityPage } from './views/CommunityPage';
import { StudentProfilePage } from './views/StudentProfilePage';
import { SettingsPage } from './views/SettingsPage';
import { BlogPage } from './views/BlogPage';
import { FreeResourcesPage } from './views/FreeResourcesPage';
import { NotesPage } from './views/NotesPage';
import { ToolsPage } from './views/ToolsPage';
import { ProjectsPage } from './views/ProjectsPage';

const isPathOrHashAdmin = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
};

const AppShell: React.FC = () => {
  const { currentView, setCurrentView } = useLms();

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
        <>
          <AdminAuthGate 
            onAuthenticated={() => setIsAdminAuthenticated(true)}
            onExit={() => {
              setCurrentView('landing');
            }}
          />
          <ToastContainer />
        </>
      );
    }

    return (
      <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
        <AdminDashboardPage />
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
        {renderStudentView()}
      </main>

      {/* Global Footer (hidden on learning player for immersion) */}
      {!isLearningInterface && <Footer />}

      {/* Mobile-Friendly Thumb Navigation */}
      {!isLearningInterface && <MobileNav />}

      {/* Modals & Notifications */}
      <SearchModal />
      <CertificateModal />
      <AuthModal />
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
