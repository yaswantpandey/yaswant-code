import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { MOCK_INSTRUCTORS, MOCK_COURSES } from '../data/mockData';
import { 
  Star, 
  Users, 
  BookOpen, 
  Award, 
  Globe, 
  Github, 
  Twitter, 
  Linkedin, 
  CheckCircle2, 
  ArrowRight,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const InstructorProfilePage: React.FC = () => {
  const { setCurrentView, setSelectedCourse, addToast } = useLms();
  const instructor = MOCK_INSTRUCTORS[0]; // Sarah Chen
  const [activeTab, setActiveTab] = useState<'courses' | 'about' | 'reviews'>('courses');

  const instructorCourses = MOCK_COURSES.filter(c => c.instructor.id === instructor.id || c.id === 'course-1');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Bio Card */}
      <GlassCard className="p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
          <img
            src={instructor.avatar}
            alt={instructor.name}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover ring-2 ring-neutral-300 dark:ring-neutral-700 shadow-xl"
          />

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="purple" size="sm">Staff Instructor</Badge>
              <Badge variant="success" size="sm">
                <ShieldCheck className="w-3 h-3 mr-1 inline" /> Verified Mentor
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              {instructor.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              {instructor.role}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-600 dark:text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5 font-bold text-amber-500">
                <Star className="w-4 h-4 fill-current" /> {instructor.rating} Rating
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-neutral-400" /> {instructor.studentsCount.toLocaleString()} Students
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-neutral-400" /> {instructor.coursesCount} Masterclasses
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={<MessageSquare className="w-3.5 h-3.5" />}
              onClick={() => addToast("Message Sent", "Direct message inquiry forwarded to instructor.", "info")}
            >
              Contact
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => addToast("Following Instructor", "You will receive notifications for new courses.", "success")}
            >
              Follow
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-8 text-xs sm:text-sm font-semibold">
        {(['courses', 'about', 'reviews'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition-colors relative ${
              activeTab === tab
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {tab} ({tab === 'courses' ? instructorCourses.length : tab === 'reviews' ? 142 : 'Bio'})
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab: Authored Courses */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructorCourses.map((c) => (
            <GlassCard
              key={c.id}
              hoverEffect
              className="overflow-hidden flex flex-col justify-between cursor-pointer"
              onClick={() => {
                setSelectedCourse(c);
                setCurrentView('course-detail');
              }}
            >
              <div>
                <img src={c.thumbnail} alt={c.title} className="w-full aspect-video object-cover" />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>{c.category}</span>
                    <span className="text-amber-500 font-bold">★ {c.rating}</span>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2">{c.tagline}</p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900 dark:text-white">${c.price}</span>
                <span className="text-neutral-500">{c.studentsCount.toLocaleString()} learners</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Tab: About & Skills */}
      {activeTab === 'about' && (
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-2">
              Teaching Philosophy & Background
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {instructor.bio}
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Verified Technical Domain Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {['React 19 Server Components', 'Next.js 15 Canary', 'Distributed Micro-Frontends', 'Tailwind CSS v4', 'Web Workers & Off-Thread Canvas', 'TypeScript Strict Mode', 'GraphQL Schema Stitching'].map((skill) => (
                <span key={skill} className="px-3 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-mono text-neutral-800 dark:text-neutral-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {[
            {
              author: "Kevin Patel",
              role: "Principal Architect",
              comment: "Sarah has a rare ability to explain nuanced React Fiber reconciliation dynamics with crystal clarity. The production codebase examples were impeccable."
            },
            {
              author: "Elena Rostova",
              role: "Frontend Lead",
              comment: "Best investment in our engineering team's training this quarter. Highly recommended."
            }
          ].map((r, i) => (
            <GlassCard key={i} className="p-5">
              <div className="flex items-center justify-between mb-2">
                <strong className="text-xs font-bold text-neutral-900 dark:text-white">{r.author}</strong>
                <span className="text-[11px] text-neutral-400">{r.role}</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                &ldquo;{r.comment}&rdquo;
              </p>
            </GlassCard>
          ))}
        </div>
      )}

    </div>
  );
};
