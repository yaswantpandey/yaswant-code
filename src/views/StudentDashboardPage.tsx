import React, { useState, useEffect } from 'react';
import { useLms } from '../context/LmsContext';
import { Certificate } from '../types/lms';
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
  Mail
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { BentoCard } from '../components/ui/BentoCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

import { tokenStorage } from '../services/api';

export const StudentDashboardPage: React.FC = () => {
  const {
    courses,
    setCurrentView,
    setSelectedCourse,
    setCertificateModal,
    emptyStateSimulated
  } = useLms();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/certificates.php')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setCertificates(json.data);
        }
      })
      .catch(() => {});

    fetch('/api/assignments.php')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setUpcomingAssignments(json.data);
        }
      })
      .catch(() => {});

    fetch('/api/quizzes.php')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setUpcomingQuizzes(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const enrolledCourses = emptyStateSimulated
    ? []
    : (courses.filter(c => c.enrolled).length > 0
        ? courses.filter(c => c.enrolled)
        : courses.slice(0, 2).map((c, idx) => ({ ...c, enrolled: true, progressPercent: idx === 0 ? 35 : 15 })));
  const currentUser = tokenStorage.getUser<{ name?: string; email?: string }>();
  const studentFirstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Engineer';

  const hoursLearned = enrolledCourses.reduce((acc, c) => acc + (c.durationHours * (c.progressPercent || 0) / 100), 0).toFixed(1);
  const skillsCount = Array.from(new Set(enrolledCourses.flatMap(c => c.skills || []))).length;
  const completedCount = enrolledCourses.filter(c => (c.progressPercent || 0) >= 100).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* 1. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
            Student Productivity Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Welcome back, {studentFirstName}
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
          value={emptyStateSimulated ? '0.0' : `${hoursLearned}h`}
          subtitle="Lifetime study time"
          change={{ value: `${enrolledCourses.length} active`, trend: 'up' }}
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />
        <BentoCard
          title="Active Streak"
          value={emptyStateSimulated ? '0 Days' : `${enrolledCourses.length > 0 ? '5' : '0'} Days`}
          subtitle="Platform consistency"
          change={{ value: 'Consistency', trend: 'up' }}
          icon={<Flame className="w-5 h-5 text-amber-500" />}
        />
        <BentoCard
          title="Courses Active"
          value={enrolledCourses.length}
          subtitle="In your current library"
          change={{ value: `${completedCount} Completed`, trend: 'neutral' }}
          icon={<BookOpen className="w-5 h-5 text-emerald-500" />}
        />
        <BentoCard
          title="Skills Verified"
          value={emptyStateSimulated ? '0' : skillsCount}
          subtitle="Full-stack & systems"
          change={{ value: 'Technical skills', trend: 'up' }}
          icon={<Sparkles className="w-5 h-5 text-purple-500" />}
        />
        <BentoCard
          title="Certificates"
          value={emptyStateSimulated ? '0' : certificates.length}
          subtitle="Digitally verifiable"
          change={{ value: 'Verifiable credentials', trend: 'up' }}
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
                      {enrolledCourses[0].category} • {enrolledCourses[0].difficulty}
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                      {enrolledCourses[0].title}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2">
                      {enrolledCourses[0].tagline || enrolledCourses[0].description}
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
                Course duration: <strong className="text-neutral-800 dark:text-neutral-200">{enrolledCourses[0]?.durationHours || 40}h total</strong>
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
                {[
                  { day: 'Mon', hours: enrolledCourses.length > 0 ? 3.5 : 0 },
                  { day: 'Tue', hours: enrolledCourses.length > 0 ? 4.2 : 0 },
                  { day: 'Wed', hours: enrolledCourses.length > 0 ? 2.8 : 0 },
                  { day: 'Thu', hours: enrolledCourses.length > 0 ? 5.1 : 0 },
                  { day: 'Fri', hours: enrolledCourses.length > 0 ? 3.9 : 0 },
                  { day: 'Sat', hours: enrolledCourses.length > 0 ? 4.0 : 0 },
                  { day: 'Sun', hours: enrolledCourses.length > 0 ? 1.0 : 0 }
                ].map((item) => {
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
            <span className="text-xs text-neutral-400">
              {(upcomingAssignments.length + upcomingQuizzes.length)} available
            </span>
          </div>

          <div className="space-y-3">
            {/* Real Assignments from Database */}
            {upcomingAssignments.slice(0, 2).map((assign) => (
              <div
                key={assign.id}
                onClick={() => setCurrentView('assignment')}
                className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-750 flex items-center justify-between gap-3 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="warning" size="sm">Deadline: {assign.deadline}</Badge>
                    <span className="text-[11px] text-neutral-400 font-mono">{assign.difficulty}</span>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {assign.title}
                  </h4>
                </div>
                <Button variant="outline" size="sm">
                  Submit
                </Button>
              </div>
            ))}

            {/* Real Quizzes from Database */}
            {upcomingQuizzes.slice(0, 1).map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => setCurrentView('quiz')}
                className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-750 flex items-center justify-between gap-3 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="purple" size="sm">Assessment</Badge>
                    <span className="text-[11px] text-neutral-400 font-mono">{quiz.duration_minutes}m • Pass: {quiz.passing_score}%</span>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {quiz.title}
                  </h4>
                </div>
                <Button variant="outline" size="sm">
                  Take Quiz
                </Button>
              </div>
            ))}
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
            {certificates.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400">
                No digital certificates earned yet. Complete all lessons of an enrolled course to unlock your verifiable diploma.
              </div>
            ) : (
              certificates.map((cert) => (
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
              ))
            )}
          </div>
        </GlassCard>

      </div>

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
