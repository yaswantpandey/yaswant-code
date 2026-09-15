import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { MOCK_INSTRUCTOR_STATS, MOCK_COURSES } from '../data/mockData';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Star, 
  FileText, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { BentoCard } from '../components/ui/BentoCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const InstructorDashboardPage: React.FC = () => {
  const { setCurrentView, addToast } = useLms();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'grading' | 'analytics'>('overview');

  const stats = MOCK_INSTRUCTOR_STATS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header with Course Creation CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
            Instructor Studio & Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Instructor Control Center
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Monitor curriculum engagement, student submissions, and revenue across your published masterclasses.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCurrentView('course-creation')}
        >
          Create New Masterclass
        </Button>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <BentoCard
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          subtitle="Enrolled worldwide"
          change={{ value: '+420 this month', trend: 'up' }}
          icon={<Users className="w-5 h-5 text-blue-500" />}
        />
        <BentoCard
          title="Active Courses"
          value={MOCK_COURSES.length}
          subtitle="Published masterclasses"
          change={{ value: '1 Draft', trend: 'neutral' }}
          icon={<BookOpen className="w-5 h-5 text-emerald-500" />}
        />
        <BentoCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          subtitle="Direct earnings (85% cut)"
          change={{ value: '+14% vs last mo', trend: 'up' }}
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
        />
        <BentoCard
          title="Average Rating"
          value={`★ ${stats.averageRating}`}
          subtitle="From 1,890 reviews"
          change={{ value: 'Top 1% Mentor', trend: 'up' }}
          icon={<Star className="w-5 h-5 text-amber-500" />}
        />
        <BentoCard
          title="Grading Queue"
          value={stats.pendingAssignments}
          subtitle="Assignments pending"
          change={{ value: '2 Urgent', trend: 'down' }}
          icon={<FileText className="w-5 h-5 text-indigo-500" />}
          onClick={() => setActiveTab('grading')}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-8 text-xs sm:text-sm font-semibold">
        {(['overview', 'courses', 'grading', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition-colors relative ${
              activeTab === tab
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {tab === 'grading' ? `Grading Queue (${stats.pendingAssignments})` : tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Revenue Bar Chart Simulation & Published Courses */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Monthly Revenue Progression ($)
                  </h3>
                  <p className="text-xs text-neutral-400">Past 6 months payout volume</p>
                </div>
                <Badge variant="success" size="sm">+22% Year over Year</Badge>
              </div>

              {/* Bar visualization */}
              <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
                {[
                  { month: 'Apr', val: 7800 },
                  { month: 'May', val: 9100 },
                  { month: 'Jun', val: 8900 },
                  { month: 'Jul', val: 11400 },
                  { month: 'Aug', val: 12900 },
                  { month: 'Sep', val: 14850 }
                ].map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t-xl h-full flex items-end">
                      <div
                        className="w-full bg-neutral-900 dark:bg-white rounded-t-xl transition-all group-hover:bg-emerald-500"
                        style={{ height: `${(item.val / 16000) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">{item.month}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Quick Courses List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                  Active Published Masterclasses
                </h3>
                <button
                  onClick={() => setActiveTab('courses')}
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  Manage All
                </button>
              </div>

              {MOCK_COURSES.slice(0, 2).map((c) => (
                <GlassCard key={c.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 truncate">
                    <img src={c.thumbnail} alt={c.title} className="w-14 h-10 rounded-lg object-cover" />
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">{c.title}</h4>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {c.studentsCount} Students • ${c.price} • ★ {c.rating}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentView('course-creation')}>
                    Edit Syllabus
                  </Button>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Right Col: Grading Queue & Quick Announcements */}
          <div className="space-y-6">
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Submissions To Review ({stats.pendingAssignments})
                </h3>
                <Badge variant="warning" size="sm">Action Needed</Badge>
              </div>

              <div className="space-y-3">
                {[
                  { student: "Marcus Vance", project: "Optimistic Kanban Server Actions", time: "30m ago" },
                  { student: "Elena Rostova", project: "PyTorch Quantization Pipeline", time: "2h ago" },
                  { student: "Liam O'Connor", project: "PostgreSQL Multi-Tenant Schema", time: "5h ago" }
                ].map((item, idx) => (
                  <div key={idx} className="contrast-card p-3.5 rounded-xl text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <strong className="contrast-heading font-semibold">{item.student}</strong>
                      <span className="contrast-subtle text-[11px] font-mono">{item.time}</span>
                    </div>
                    <p className="contrast-muted text-xs font-medium truncate mb-3">{item.project}</p>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-[11px] py-1 px-3"
                        onClick={() => addToast("Grading Modal", `Reviewing ${item.student}'s code.`, "info")}
                      >
                        Review Code
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

        </div>
      )}

      {/* Tab: Courses */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Showing 3 authored masterclasses</span>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setCurrentView('course-creation')}
            >
              New Course
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_COURSES.map((c) => (
              <GlassCard key={c.id} className="overflow-hidden flex flex-col justify-between">
                <div>
                  <img src={c.thumbnail} alt={c.title} className="w-full aspect-video object-cover" />
                  <div className="p-4 space-y-1.5">
                    <div className="text-[10px] font-mono text-neutral-400">{c.category}</div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">{c.title}</h4>
                    <div className="text-xs text-neutral-500 font-mono pt-1">
                      {c.studentsCount} Enrolled • ${c.price}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-neutral-100 dark:border-neutral-800 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setCurrentView('course-creation')}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => addToast("Analytics", `Viewing detailed metrics for ${c.title}`, "info")}
                  >
                    Analytics
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Grading Queue */}
      {activeTab === 'grading' && (
        <GlassCard className="p-6">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4">
            Capstone Submissions Awaiting Code Review
          </h3>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {[
              { name: "Marcus Vance", course: "Next.js 15 & React 19 Architecture", repo: "github.com/marcus/kanban", submitted: "Today at 08:30" },
              { name: "Elena Rostova", course: "PyTorch LLM Fine-Tuning", repo: "github.com/elena/lora-finetune", submitted: "Yesterday" }
            ].map((sub, i) => (
              <div key={i} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">{sub.name}</h4>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">{sub.course}</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">{sub.repo} • {sub.submitted}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => addToast("Inspection", "Opening GitHub repository in new window", "info")}>
                    Inspect Repo
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => addToast("Graded", "Grade 98/100 and comments submitted to student.", "success")}>
                    Submit Grade & Rubric
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <GlassCard className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 mx-auto flex items-center justify-center text-neutral-500">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Comprehensive Course Telemetry
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Average completion rate across all 3 masterclasses is <strong className="text-emerald-500">78.4%</strong> (industry average is 12.8%). Video drop-off occurs primarily at Chapter 4 (Database transactions).
          </p>
        </GlassCard>
      )}

    </div>
  );
};
