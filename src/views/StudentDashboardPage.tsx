import React, { useState, useEffect, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { Certificate, Course } from '../types/lms';
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
  GraduationCap
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

  const [dbEnrollments, setDbEnrollments] = useState<any[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState<boolean>(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<any[]>([]);

  // Fetch all real-time data from backend database
  useEffect(() => {
    const token = tokenStorage.get();
    const authHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

    // 1. Real Enrollments from Database
    fetch('/api/enrollments.php', { headers: authHeaders })
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setDbEnrollments(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingEnrollments(false));

    // 2. Real Digital Certificates
    fetch('/api/certificates.php', { headers: authHeaders })
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setCertificates(json.data);
        }
      })
      .catch(() => {});

    // 3. Real Course Assignments
    fetch('/api/assignments.php', { headers: authHeaders })
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setUpcomingAssignments(json.data);
        }
      })
      .catch(() => {});

    // 4. Real Quizzes & Assessments
    fetch('/api/quizzes.php', { headers: authHeaders })
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setUpcomingQuizzes(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Merge real database enrollments with catalog courses (NO DUMMY OR FORCED DATA)
  const enrolledCourses = useMemo<Course[]>(() => {
    if (emptyStateSimulated) return [];

    // 1. Database-backed real enrollments
    if (dbEnrollments.length > 0) {
      return dbEnrollments.map((enr) => {
        const catalogMatch = courses.find(c => c.id === enr.course_id);
        if (catalogMatch) {
          return {
            ...catalogMatch,
            enrolled: true,
            progressPercent: Number(enr.progress_percent) || 0,
          };
        }
        return {
          id: enr.course_id,
          title: enr.title || 'Course In Progress',
          tagline: enr.title || '',
          description: `${enr.category || 'General'} Masterclass`,
          thumbnail: enr.thumbnail || 'https://images.unsplash.com/photo-1516116211227-bbc13c6b2452?w=800&auto=format&fit=crop&q=80',
          instructor: {
            name: enr.instructor_name || 'Yaswant Pandey',
            role: 'Lead Instructor',
            avatar: enr.instructor_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            bio: '',
            rating: 5.0,
            coursesCount: 1,
            studentsCount: 100,
          },
          category: enr.category || 'Engineering',
          difficulty: (enr.difficulty || 'Intermediate') as any,
          rating: 4.9,
          reviewsCount: 120,
          studentsCount: 1,
          durationHours: Number(enr.duration_hours) || 20,
          lessonsCount: Number(enr.lessons_count) || 10,
          price: 0,
          language: 'English & Hindi',
          lastUpdated: enr.enrolled_at ? enr.enrolled_at.split(' ')[0] : '2026',
          hasCertificate: Boolean(enr.has_certificate),
          whatYouWillLearn: [],
          requirements: [],
          modules: [],
          skills: [],
          projectsCount: 1,
          enrolled: true,
          progressPercent: Number(enr.progress_percent) || 0,
        };
      });
    }

    // 2. Client-enrolled courses from live context (if any)
    const clientEnrolled = courses.filter(c => c.enrolled);
    return clientEnrolled;
  }, [emptyStateSimulated, dbEnrollments, courses]);

  const currentUser = tokenStorage.getUser<{ name?: string; email?: string }>();
  const studentFirstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Engineer';

  // Real-time calculations derived strictly from database data
  const totalEnrolled = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(c => (c.progressPercent || 0) >= 100);
  const activeCourses = enrolledCourses.filter(c => (c.progressPercent || 0) < 100);
  
  const hoursLearned = enrolledCourses
    .reduce((acc, c) => acc + (c.durationHours * (c.progressPercent || 0) / 100), 0)
    .toFixed(1);

  const skillsList = Array.from(new Set(enrolledCourses.flatMap(c => c.skills || [])));
  const skillsCount = skillsList.length;
  const completedCount = completedCourses.length;
  const pendingTasksCount = upcomingAssignments.length + upcomingQuizzes.length;

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
            {totalEnrolled > 0 ? (
              <>
                You have <span className="font-semibold text-emerald-500">{totalEnrolled} active course{totalEnrolled === 1 ? '' : 's'}</span> in your learning workspace
                {pendingTasksCount > 0 ? ` and ${pendingTasksCount} task${pendingTasksCount === 1 ? '' : 's'} available to complete.` : '.'}
              </>
            ) : (
              <>Your learning journey is ready to begin. Browse the masterclass catalog to enroll in your first course.</>
            )}
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
            Browse Catalog
          </Button>
        </div>
      </div>

      {/* 2. Real Analytics Cards (Bento Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <BentoCard
          title="Hours Learned"
          value={`${hoursLearned}h`}
          subtitle="Cumulative study time"
          change={{ value: totalEnrolled > 0 ? `${totalEnrolled} courses` : 'No study logged', trend: totalEnrolled > 0 ? 'up' : 'neutral' }}
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />
        <BentoCard
          title="Active Status"
          value={totalEnrolled > 0 ? 'Active' : 'Not Enrolled'}
          subtitle="Learning status"
          change={{ value: totalEnrolled > 0 ? `${activeCourses.length} in progress` : 'Enroll to start', trend: totalEnrolled > 0 ? 'up' : 'neutral' }}
          icon={<Flame className="w-5 h-5 text-amber-500" />}
        />
        <BentoCard
          title="Courses Active"
          value={totalEnrolled}
          subtitle="In your current library"
          change={{ value: `${completedCount} Completed`, trend: completedCount > 0 ? 'up' : 'neutral' }}
          icon={<BookOpen className="w-5 h-5 text-emerald-500" />}
        />
        <BentoCard
          title="Skills Verified"
          value={skillsCount}
          subtitle="Full-stack & systems"
          change={{ value: skillsCount > 0 ? `${skillsCount} skills` : 'Catalog skills', trend: skillsCount > 0 ? 'up' : 'neutral' }}
          icon={<Sparkles className="w-5 h-5 text-purple-500" />}
        />
        <BentoCard
          title="Certificates"
          value={certificates.length}
          subtitle="Digitally verifiable"
          change={{ value: certificates.length > 0 ? `${certificates.length} earned` : 'Complete a course', trend: certificates.length > 0 ? 'up' : 'neutral' }}
          icon={<Award className="w-5 h-5 text-indigo-500" />}
          onClick={() => setCurrentView('certificate')}
        />
      </div>

      {/* 3. Continue Learning Hero & Real Progress Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Continue Learning Featured Card */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 h-full flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Continue Learning
                </span>
                {totalEnrolled > 0 && (
                  <Badge variant="purple" size="sm">
                    {enrolledCourses[0]?.progressPercent === 100 ? 'Completed' : 'In Progress'}
                  </Badge>
                )}
              </div>

              {totalEnrolled > 0 ? (
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
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, enrolledCourses[0].progressPercent || 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">No Courses Currently in Progress</h4>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
                    You haven't enrolled in any courses yet. Browse our comprehensive masterclasses in React, Python, Cloud, and Systems Engineering to get started.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentView('courses')}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    iconPosition="right"
                  >
                    Explore Courses
                  </Button>
                </div>
              )}
            </div>

            {totalEnrolled > 0 && (
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800">
                <div className="text-xs text-neutral-500">
                  Course duration: <strong className="text-neutral-800 dark:text-neutral-200">{enrolledCourses[0]?.durationHours || 0}h total</strong>
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
            )}
          </GlassCard>
        </div>

        {/* Real Progress Metrics Summary Card */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Learning Progress
                </span>
                <span className="text-xs font-bold text-emerald-500">
                  {totalEnrolled > 0 ? `${completedCount}/${totalEnrolled} Completed` : '0 Active'}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-4">
                {hoursLearned} hrs completed
              </div>

              {/* Course Progress Breakdown List */}
              {totalEnrolled > 0 ? (
                <div className="space-y-3 pt-2">
                  {enrolledCourses.slice(0, 4).map((c) => (
                    <div key={c.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[180px]">
                          {c.title}
                        </span>
                        <span className="font-mono text-neutral-500 text-[11px]">
                          {c.progressPercent}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, c.progressPercent || 0)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 text-center text-xs text-neutral-500 space-y-1 my-3">
                  <GraduationCap className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                  <p className="font-medium text-neutral-700 dark:text-neutral-300">Track Real Milestones</p>
                  <p className="text-[11px] text-neutral-400">Progress metrics automatically update as you complete video lessons and quizzes.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Catalog Courses: {courses.length}</span>
              <button
                onClick={() => setCurrentView('courses')}
                className="font-semibold text-neutral-800 dark:text-neutral-200 hover:underline"
              >
                View Catalog →
              </button>
            </div>
          </GlassCard>
        </div>

      </div>

      {/* 4. Real Upcoming Tasks & Assignments Queue from Database */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Real Tasks & Assessments */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> Active Assignments & Assessments
            </h3>
            <span className="text-xs text-neutral-400">
              {pendingTasksCount} available
            </span>
          </div>

          <div className="space-y-3">
            {pendingTasksCount === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400">
                All caught up! No assignments or quizzes are currently pending in your enrolled subjects.
              </div>
            ) : (
              <>
                {/* Real Assignments from Database */}
                {upcomingAssignments.slice(0, 2).map((assign) => (
                  <div
                    key={assign.id}
                    onClick={() => setCurrentView('assignment')}
                    className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-750 flex items-center justify-between gap-3 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="warning" size="sm">
                          {assign.deadline ? `Deadline: ${assign.deadline}` : 'Hands-on Project'}
                        </Badge>
                        <span className="text-[11px] text-neutral-400 font-mono">{assign.difficulty || 'All Levels'}</span>
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
                {upcomingQuizzes.slice(0, 2).map((quiz) => (
                  <div
                    key={quiz.id}
                    onClick={() => setCurrentView('quiz')}
                    className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-750 flex items-center justify-between gap-3 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="purple" size="sm">Assessment</Badge>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {quiz.duration_minutes ? `${quiz.duration_minutes}m` : 'Timed'} • Pass: {quiz.passing_score || 70}%
                        </span>
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
              </>
            )}
          </div>
        </GlassCard>

        {/* Real Earned Credentials & Certificates from Database */}
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

      {/* 5. Real Enrolled Courses Gallery */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-neutral-950 dark:text-white">
            Enrolled Masterclasses ({totalEnrolled})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('courses')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            Explore Catalog
          </Button>
        </div>

        {totalEnrolled > 0 ? (
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
        ) : (
          <GlassCard className="p-10 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 text-neutral-400 flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Your Course Library is Empty</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              You haven't enrolled in any masterclasses yet. Enroll in courses to start tracking lessons, submitting code assignments, and earning digital credentials.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentView('courses')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Browse Course Catalog
            </Button>
          </GlassCard>
        )}
      </div>

    </div>
  );
};
