import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LmsProvider, useLms } from './context/LmsContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { RoleSwitcher } from './components/ui/RoleSwitcher';
import { SearchModal } from './components/ui/SearchModal';
import { CertificateModal } from './components/ui/CertificateModal';
import { AuthModal } from './components/ui/AuthModal';
import { ToastContainer } from './components/ui/ToastContainer';

// Views
import { LandingPage } from './views/LandingPage';
import { CourseDiscoveryPage } from './views/CourseDiscoveryPage';
import { CourseDetailsPage } from './views/CourseDetailsPage';
import { StudentDashboardPage } from './views/StudentDashboardPage';
import { CourseLearningPage } from './views/CourseLearningPage';
import { QuizPage } from './views/QuizPage';
import { AssignmentPage } from './views/AssignmentPage';
import { CertificatePage } from './views/CertificatePage';
import { LearningPathsPage } from './views/LearningPathsPage';
import { InstructorProfilePage } from './views/InstructorProfilePage';
import { CommunityPage } from './views/CommunityPage';
import { StudentProfilePage } from './views/StudentProfilePage';
import { InstructorDashboardPage } from './views/InstructorDashboardPage';
import { CourseCreationWizard } from './views/CourseCreationWizard';
import { AdminDashboardPage } from './views/AdminDashboardPage';
import { SettingsPage } from './views/SettingsPage';
import { BlogPage } from './views/BlogPage';
import { FreeResourcesPage } from './views/FreeResourcesPage';
import { NotesPage } from './views/NotesPage';
import { ToolsPage } from './views/ToolsPage';
import { ProjectsPage } from './views/ProjectsPage';
import { GoogleWorkspaceHub } from './components/workspace/GoogleWorkspaceHub';
import { WorkspaceProvider } from './context/WorkspaceContext';

const AppShell: React.FC = () => {
  const { currentView } = useLms();

  const renderActiveView = () => {
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
      case 'instructor-profile':
        return <InstructorProfilePage />;
      case 'community':
        return <CommunityPage />;
      case 'student-profile':
        return <StudentProfilePage />;
      case 'instructor-dashboard':
        return <InstructorDashboardPage />;
      case 'course-creation':
        return <CourseCreationWizard />;
      case 'admin-dashboard':
        return <AdminDashboardPage />;
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
      case 'workspace':
        return <GoogleWorkspaceHub />;
      default:
        return <LandingPage />;
    }
  };

  const isLearningInterface = currentView === 'learning-interface';

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-950">
      {/* Sticky Global Navigation */}
      <Navbar />

      {/* Main View Area */}
      <main className={`flex-1 ${isLearningInterface ? 'overflow-hidden' : 'pb-28 md:pb-12'}`}>
        {renderActiveView()}
      </main>

      {/* Global Footer (hidden on learning player for immersion) */}
      {!isLearningInterface && <Footer />}

      {/* Mobile-Friendly Thumb Navigation */}
      {!isLearningInterface && <MobileNav />}

      {/* Prototype Role & View Switcher Bar (Bottom Floating Controller) */}
      <RoleSwitcher />

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
        <WorkspaceProvider>
          <AppShell />
        </WorkspaceProvider>
      </LmsProvider>
    </ThemeProvider>
  );
}
