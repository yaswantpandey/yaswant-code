import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { 
  Star, 
  Clock, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Calendar, 
  Globe, 
  Play, 
  CheckCircle2, 
  Lock, 
  ChevronDown, 
  ChevronRight, 
  Bookmark, 
  Share2, 
  Code2, 
  HelpCircle, 
  FileText, 
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const CourseDetailsPage: React.FC = () => {
  const { 
    selectedCourse, 
    setCurrentView, 
    setSelectedLesson, 
    enrollCourse, 
    bookmarkedCourseIds, 
    toggleBookmark,
    addToast 
  } = useLms();

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-1': true,
    'mod-2': false
  });
  const [activeTab, setActiveTab] = useState<'curriculum' | 'instructor' | 'reviews' | 'faq'>('curriculum');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const isBookmarked = bookmarkedCourseIds.includes(selectedCourse.id);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePreviewLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setCurrentView('learning-interface');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <button onClick={() => setCurrentView('courses')} className="hover:text-neutral-900 dark:hover:text-white">
          Courses
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-500">{selectedCourse.category}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 dark:text-white font-medium truncate max-w-xs sm:max-w-md">
          {selectedCourse.title}
        </span>
      </div>

      {/* Hero / Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Cols: Course Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" size="sm">{selectedCourse.difficulty}</Badge>
            <Badge variant="neutral" size="sm">{selectedCourse.category}</Badge>
            {selectedCourse.isBestseller && (
              <Badge variant="warning" size="sm">Bestseller</Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
            {selectedCourse.title}
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {selectedCourse.description}
          </p>

          {/* Instructor & Meta row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <div 
              onClick={() => setCurrentView('instructor-profile')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <img
                src={selectedCourse.instructor.avatar}
                alt={selectedCourse.instructor.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-700"
              />
              <div>
                <span className="block font-semibold text-neutral-900 dark:text-white group-hover:underline">
                  {selectedCourse.instructor.name}
                </span>
                <span className="text-[10px] text-neutral-400">{selectedCourse.instructor.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span>{selectedCourse.rating}</span>
              <span className="text-neutral-400 font-normal">({selectedCourse.reviewsCount} reviews)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-neutral-400" />
              <span>{selectedCourse.studentsCount.toLocaleString()} enrolled</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span>Updated {selectedCourse.lastUpdated}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-neutral-400" />
              <span>{selectedCourse.language}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Video Preview & Enrollment Sticky Card */}
        <div className="lg:col-span-1">
          <GlassCard className="p-5 overflow-hidden sticky top-24 shadow-xl">
            {/* Video Player Preview Box */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-950 mb-5 group">
              <img
                src={selectedCourse.thumbnail}
                alt={selectedCourse.title}
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-neutral-950/40 flex items-center justify-center">
                <button
                  onClick={() => setIsPlayingPreview(true)}
                  className="w-14 h-14 rounded-2xl bg-white/90 text-neutral-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform"
                  title="Watch 2-minute syllabus preview"
                >
                  <Play className="w-6 h-6 fill-current ml-1" />
                </button>
              </div>
              <div className="absolute bottom-2.5 left-2.5 bg-neutral-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                Course Trailer (2:45)
              </div>
            </div>

            {/* Pricing Area */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-extrabold text-neutral-950 dark:text-white">
                ${selectedCourse.price}
              </span>
              {selectedCourse.originalPrice && (
                <span className="text-sm text-neutral-400 line-through font-mono">
                  ${selectedCourse.originalPrice}
                </span>
              )}
              {selectedCourse.discountPercentage && (
                <Badge variant="success" size="sm">
                  {selectedCourse.discountPercentage}% OFF
                </Badge>
              )}
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 mb-6">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md"
                onClick={() => enrollCourse(selectedCourse.id)}
              >
                {selectedCourse.enrolled ? 'Resume Learning' : 'Enroll in Course'}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1"
                  icon={<Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />}
                  onClick={() => toggleBookmark(selectedCourse.id)}
                >
                  {isBookmarked ? 'Saved' : 'Wishlist'}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  icon={<Share2 className="w-4 h-4" />}
                  onClick={() => addToast("Share Link Copied", "Course URL copied to clipboard.", "info")}
                >
                  Share
                </Button>
              </div>
            </div>

            {/* Guarantee and Features */}
            <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="font-semibold text-neutral-900 dark:text-white mb-2">
                This comprehensive masterclass includes:
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span>{selectedCourse.durationHours} hours of on-demand HD video</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-neutral-400" />
                <span>{selectedCourse.lessonsCount} modular lessons & quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-neutral-400" />
                <span>{selectedCourse.projectsCount} full GitHub production repositories</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Official verifiable digital certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Direct Q&A thread with instructor</span>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6 text-xs sm:text-sm font-semibold">
        {(['curriculum', 'instructor', 'reviews', 'faq'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition-colors relative ${
              activeTab === tab
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Curriculum & Syllabus Content */}
      {activeTab === 'curriculum' && (
        <div className="space-y-8">
          
          {/* What You'll Learn Bento */}
          <GlassCard className="p-6">
            <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-4">
              What You&apos;ll Learn in This Course
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {selectedCourse.whatYouWillLearn.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Requirements */}
          <div>
            <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-3">
              Prerequisites & Requirements
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 list-disc list-inside">
              {selectedCourse.requirements.map((req, idx) => (
                <li key={idx} className="leading-relaxed">{req}</li>
              ))}
            </ul>
          </div>

          {/* Curriculum Hierarchy Accordion */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
                  Course Curriculum
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {selectedCourse.modules.length} Modules • {selectedCourse.lessonsCount} Lessons • {selectedCourse.durationHours} Hours Total
                </p>
              </div>
              <button
                onClick={() => {
                  const allExpanded = Object.values(expandedModules).every(Boolean);
                  const next: Record<string, boolean> = {};
                  selectedCourse.modules.forEach(m => next[m.id] = !allExpanded);
                  setExpandedModules(next);
                }}
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                Expand/Collapse All
              </button>
            </div>

            <div className="space-y-3">
              {selectedCourse.modules.map((module) => {
                const isExpanded = !!expandedModules[module.id];

                return (
                  <GlassCard key={module.id} className="overflow-hidden">
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 bg-neutral-50/50 dark:bg-neutral-850/40 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                          {module.title}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {module.chapters.length} Chapters • {module.duration}
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Chapters and Lessons */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 space-y-4 border-t border-neutral-100 dark:border-neutral-800">
                        {module.chapters.map((chapter) => (
                          <div key={chapter.id} className="space-y-2">
                            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                              {chapter.title}
                            </div>
                            <div className="space-y-1.5">
                              {chapter.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/50 dark:border-neutral-800 text-xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    {lesson.completed ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    ) : lesson.type === 'quiz' ? (
                                      <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                    ) : lesson.type === 'assignment' ? (
                                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                    ) : (
                                      <Play className="w-3.5 h-3.5 text-neutral-400 shrink-0 fill-current" />
                                    )}

                                    <div className="min-w-0">
                                      <div className="font-medium text-neutral-900 dark:text-white truncate">
                                        {lesson.title}
                                      </div>
                                      <div className="text-[10px] text-neutral-400 font-mono">
                                        {lesson.duration} • {lesson.type.toUpperCase()}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {lesson.previewAvailable ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-[11px] py-1 px-2.5"
                                        onClick={() => handlePreviewLesson(lesson)}
                                      >
                                        Free Preview
                                      </Button>
                                    ) : lesson.locked ? (
                                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                                    ) : (
                                      <button
                                        onClick={() => handlePreviewLesson(lesson)}
                                        className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                                      >
                                        Start
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Instructor */}
      {activeTab === 'instructor' && (
        <GlassCard className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={selectedCourse.instructor.avatar}
              alt={selectedCourse.instructor.name}
              className="w-24 h-24 rounded-2xl object-cover ring-2 ring-neutral-300 dark:ring-neutral-700 shrink-0"
            />
            <div className="space-y-3 flex-1">
              <div>
                <h3 className="text-xl font-bold text-neutral-950 dark:text-white">
                  {selectedCourse.instructor.name}
                </h3>
                <p className="text-xs text-neutral-500 font-medium">{selectedCourse.instructor.role}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                <span className="text-amber-500 font-bold">★ {selectedCourse.instructor.rating} Instructor Rating</span>
                <span>•</span>
                <span>{selectedCourse.instructor.studentsCount.toLocaleString()} Students</span>
                <span>•</span>
                <span>{selectedCourse.instructor.coursesCount} Courses</span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {selectedCourse.instructor.bio}
              </p>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentView('instructor-profile')}
                >
                  View Full Instructor Profile & Research
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab 3: Student Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <div className="text-4xl font-extrabold text-neutral-950 dark:text-white mb-1">
                {selectedCourse.rating}
              </div>
              <div className="flex justify-center text-amber-500 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <div className="text-xs text-neutral-400">Course Average Rating</div>
            </GlassCard>

            <GlassCard className="sm:col-span-2 p-6 flex flex-col justify-center space-y-2 text-xs">
              {[
                { stars: '5 Stars', pct: '88%' },
                { stars: '4 Stars', pct: '10%' },
                { stars: '3 Stars', pct: '2%' }
              ].map((r) => (
                <div key={r.stars} className="flex items-center gap-3">
                  <span className="w-14 text-neutral-500">{r.stars}</span>
                  <div className="flex-1 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: r.pct }} />
                  </div>
                  <span className="w-8 text-neutral-400 text-right">{r.pct}</span>
                </div>
              ))}
            </GlassCard>
          </div>

          <div className="space-y-3">
            {[
              {
                author: "Danielle Wright",
                role: "Senior Full Stack Dev at Stripe",
                date: "3 days ago",
                comment: "Easily the highest caliber React 19 / RSC masterclass available anywhere. The optimistic mutations chapter alone saved our team weeks of architectural deliberation."
              },
              {
                author: "Tobias Schmidt",
                role: "Lead Platform Engineer",
                date: "2 weeks ago",
                comment: "Zero fluff. Real git repositories, strict typescript types, and clear performance benchmarks. Worth every penny."
              }
            ].map((rev, i) => (
              <GlassCard key={i} className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">{rev.author}</div>
                    <div className="text-[11px] text-neutral-400">{rev.role}</div>
                  </div>
                  <span className="text-xs text-neutral-400">{rev.date}</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: FAQs */}
      {activeTab === 'faq' && (
        <div className="space-y-3">
          {[
            {
              q: "Will I receive lifetime access to course updates and code repos?",
              a: "Yes. Once enrolled, you receive lifetime access to all future lesson additions, Next.js version bumps, and community discussion threads."
            },
            {
              q: "How does the certificate verification work?",
              a: "Upon completing all modules and passing the final Kanban capstone assignment, your certificate is cryptographically minted and viewable at a public verification URL."
            }
          ].map((f, idx) => (
            <GlassCard key={idx} className="p-5">
              <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mb-1.5">{f.q}</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{f.a}</p>
            </GlassCard>
          ))}
        </div>
      )}

    </div>
  );
};
