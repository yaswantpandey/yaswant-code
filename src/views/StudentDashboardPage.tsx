import React from 'react';
import { useLms } from '../context/LmsContext';
import { MOCK_STUDENT_STATS, MOCK_CERTIFICATES, MOCK_ASSIGNMENT } from '../data/mockData';
import { 
  Flame, 
  Clock, 
  BookOpen, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  FileText, 
  HelpCircle,
  ExternalLink,
  FolderOpen,
  MessageSquare,
  Mail,
  Cloud
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { GlassCard } from '../components/ui/GlassCard';
import { BentoCard } from '../components/ui/BentoCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const StudentDashboardPage: React.FC = () => {
  const { 
    courses, 
    setCurrentView, 
    setSelectedCourse, 
    setCertificateModal,
    emptyStateSimulated 
  } = useLms();

  const { calendarEvents, driveFiles, isConnected: isWorkspaceConnected } = useWorkspace();

  const enrolledCourses = emptyStateSimulated ? [] : courses.filter(c => c.enrolled);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* 1. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
            Student Productivity Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Welcome back, Alex
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            You are currently on a <span className="font-semibold text-amber-500">19-day learning streak</span>. 2 tasks require your attention today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('learning-paths')}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            My Career Roadmap
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentView('courses')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            Browse New Skills
          </Button>
        </div>
      </div>

      {/* 2. Analytics Cards (Bento Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <BentoCard
          title="Hours Learned"
          value={emptyStateSimulated ? '0.0' : `${MOCK_STUDENT_STATS.hoursLearned}h`}
          subtitle="Lifetime study time"
          change={{ value: '+14.2h this week', trend: 'up' }}
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />
        <BentoCard
          title="Active Streak"
          value={emptyStateSimulated ? '0 Days' : `${MOCK_STUDENT_STATS.currentStreakDays} Days`}
          subtitle="Top 3% consistency"
          change={{ value: 'Personal Best', trend: 'up' }}
          icon={<Flame className="w-5 h-5 text-amber-500" />}
        />
        <BentoCard
          title="Courses Active"
          value={enrolledCourses.length}
          subtitle="In your current library"
          change={{ value: '2 Completed', trend: 'neutral' }}
          icon={<BookOpen className="w-5 h-5 text-emerald-500" />}
        />
        <BentoCard
          title="Skills Verified"
          value={emptyStateSimulated ? '0' : MOCK_STUDENT_STATS.skillsAcquired}
          subtitle="React, PyTorch, Go"
          change={{ value: '+4 this month', trend: 'up' }}
          icon={<Sparkles className="w-5 h-5 text-purple-500" />}
        />
        <BentoCard
          title="Certificates"
          value={emptyStateSimulated ? '0' : MOCK_STUDENT_STATS.certificatesEarned}
          subtitle="Digitally verifiable"
          change={{ value: 'Distinction', trend: 'up' }}
          icon={<Award className="w-5 h-5 text-indigo-500" />}
          onClick={() => setCurrentView('certificate')}
        />
      </div>

      {/* 3. Continue Learning Hero & Weekly Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Continue Learning Featured Card */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 h-full flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Continue Learning
                </span>
                <Badge variant="purple" size="sm">Last active 2 hours ago</Badge>
              </div>

              {enrolledCourses.length > 0 ? (
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <img
                    src={enrolledCourses[0].thumbnail}
                    alt={enrolledCourses[0].title}
                    className="w-full sm:w-48 aspect-video rounded-xl object-cover ring-1 ring-neutral-200 dark:ring-neutral-800 shrink-0"
                  />
                  <div className="space-y-2 flex-1">
                    <span className="text-[11px] font-mono text-neutral-400">
                      Module 1 • Lesson 3
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                      {enrolledCourses[0].title}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Current: Optimistic UI Updates with useOptimistic & Safe Rollback Handling.
                    </p>

                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        <span>Overall Progress</span>
                        <span>{enrolledCourses[0].progressPercent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${enrolledCourses[0].progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No courses currently in progress. Browse the catalog to start learning!
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800">
              <div className="text-xs text-neutral-500">
                Next lesson duration: <strong className="text-neutral-800 dark:text-neutral-200">21:30</strong>
              </div>
              <Button
                variant="primary"
                size="md"
                icon={<Play className="w-4 h-4 fill-current" />}
                onClick={() => {
                  if (enrolledCourses[0]) {
                    setSelectedCourse(enrolledCourses[0]);
                    setCurrentView('learning-interface');
                  }
                }}
              >
                Resume Course Player
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Visual Weekly Learning Chart */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Weekly Study Hours
                </span>
                <span className="text-xs font-bold text-emerald-500">+18% vs goal</span>
              </div>
              <div className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-4">
                24.5 / 20 hrs
              </div>

              {/* Weekly bar graph */}
              <div className="flex items-end justify-between gap-2 h-36 pt-4 px-1">
                {MOCK_STUDENT_STATS.weeklyLearningHours.map((item) => {
                  const maxH = 6;
                  const heightPercent = Math.min(100, Math.round((item.hours / maxH) * 100));

                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t-lg h-full flex items-end relative overflow-hidden">
                        <div
                          className="w-full bg-neutral-900 dark:bg-white rounded-t-lg transition-all group-hover:bg-emerald-500"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Daily Target: 3.0 hrs</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">Goal achieved 5 of 7 days</span>
            </div>
          </GlassCard>
        </div>

      </div>

      {/* 4. Upcoming Tasks & Assignments Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Urgent Tasks */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> Upcoming Deadlines & Tasks
            </h3>
            <span className="text-xs text-neutral-400">2 pending</span>
          </div>

          <div className="space-y-3">
            {/* Task 1 */}
            <div 
              onClick={() => setCurrentView('assignment')}
              className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-750 flex items-center justify-between gap-3 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="warning" size="sm">Due in 4 Days</Badge>
                  <span className="text-[11px] text-neutral-400 font-mono">Next.js 15 Mastery</span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  Build an Optimistic Kanban Board with Server Actions
                </h4>
              </div>
              <Button variant="outline" size="sm">
                Submit
              </Button>
            </div>

            {/* Task 2 */}
            <div 
              onClick={() => setCurrentView('quiz')}
              className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-750 flex items-center justify-between gap-3 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="purple" size="sm">Assessment</Badge>
                  <span className="text-[11px] text-neutral-400 font-mono">Module 1 Check</span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  React 19 & Next.js 15 Core Principles Quiz
                </h4>
              </div>
              <Button variant="outline" size="sm">
                Take Quiz
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Earned Credentials Quick Preview */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" /> Digital Credentials & Licenses
            </h3>
            <button
              onClick={() => setCurrentView('certificate')}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium flex items-center gap-1"
            >
              View Wallet <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_CERTIFICATES.map((cert) => (
              <div
                key={cert.id}
                onClick={() => setCertificateModal(cert)}
                className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-750 flex items-center justify-between gap-3 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {cert.courseTitle}
                    </h4>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Issued {cert.issueDate} • {cert.credentialId}
                    </span>
                  </div>
                </div>

                <Button variant="ghost" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                  Inspect
                </Button>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>

      {/* 4.5. Google Workspace & Live Schedule Quick Strip */}
      <GlassCard className="p-6 bg-gradient-to-r from-blue-900/10 via-neutral-900/20 to-neutral-900/40 border border-blue-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-neutral-200/60 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-500 rounded-xl border border-blue-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white">Google Workspace & Live Sync</h3>
                <Badge variant={isWorkspaceConnected ? 'emerald' : 'blue'} size="sm">
                  {isWorkspaceConnected ? 'Live Synced' : 'Ready'}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Direct integration with Google Drive, Google Calendar, Google Chat, and Gmail.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('workspace')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            Open Workspace Hub
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upcoming Event Snippet */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-neutral-850/70 border border-neutral-200/80 dark:border-neutral-750 flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                Next Calendar Session
              </div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white truncate mt-0.5">
                {calendarEvents[0]?.summary || 'Cohort Live Q&A Session'}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                {calendarEvents[0]?.start.dateTime ? new Date(calendarEvents[0].start.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Scheduled'}
              </div>
            </div>
          </div>

          {/* Drive Materials Snippet */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-neutral-850/70 border border-neutral-200/80 dark:border-neutral-750 flex items-start gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                Google Drive Materials ({driveFiles.length} files)
              </div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white truncate mt-0.5">
                {driveFiles[0]?.name || 'Course-Syllabus.pdf'}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                {driveFiles[0]?.size || 'Synced to Google Cloud'}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 5. Enrolled Courses Gallery */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-neutral-950 dark:text-white">
            Enrolled Masterclasses ({enrolledCourses.length})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('courses')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            Explore More
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <GlassCard
              key={course.id}
              hoverEffect
              className="overflow-hidden flex flex-col justify-between cursor-pointer"
              onClick={() => {
                setSelectedCourse(course);
                setCurrentView('learning-interface');
              }}
            >
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-neutral-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                    {course.progressPercent}% Complete
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-[11px] text-neutral-400 mb-1">{course.category}</div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1 mb-2">
                    {course.title}
                  </h3>

                  <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden mb-3">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800">
                <span>{course.instructor.name}</span>
                <span className="font-semibold text-neutral-900 dark:text-white hover:underline inline-flex items-center gap-1">
                  Resume <Play className="w-3 h-3 fill-current ml-0.5" />
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

    </div>
  );
};
