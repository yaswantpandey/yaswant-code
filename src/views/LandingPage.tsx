import React, { useState, useEffect } from 'react';
import { useLms } from '../context/LmsContext';
import { PRIMARY_INSTRUCTOR } from '../config/brand';
import { ALL_ROADMAP_TRACKS } from '../data/fullstackRoadmap';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  Code2,
  Cpu,
  Globe,
  ChevronRight,
  Star,
  Users,
  Clock,
  Layers,
  HelpCircle,
  ChevronDown,
  BookOpen,
  Award,
  Play,
  FolderOpen
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { GlassCard } from '../components/ui/GlassCard';
import { injectSchema, buildFAQSchema } from '../services/seo';

export const LandingPage: React.FC = () => {
  const { setCurrentView, brandName, openAuthModal, courses, setSelectedCourse } = useLms();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/roadmaps.php')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) setRoadmaps(json.data);
      })
      .catch(() => { });
  }, []);

  const categories = [
    { name: 'Full-Stack Architecture', count: '48 Courses', icon: Layers },
    { name: 'AI & Machine Learning', count: '36 Courses', icon: Cpu },
    { name: 'Distributed Systems', count: '29 Courses', icon: Terminal },
    { name: 'Cloud Native & DevOps', count: '42 Courses', icon: Globe },
    { name: 'Systems & Security', count: '24 Courses', icon: ShieldCheck },
    { name: 'Modern Design Systems', count: '18 Courses', icon: Code2 }
  ];

  const faqs = [
    {
      q: "How does this curriculum differ from generic coding tutorials?",
      a: "Every course is authored by principal architects, staff engineers, and AI researchers from top tech companies. You build real-world distributed architectures, write zero-waterfall React 19 apps, and fine-tune transformer weights—not toy todo lists."
    },
    {
      q: "Are the digital certificates verifiable on LinkedIn and resumes?",
      a: "Yes. Every credential contains an immutable cryptographic verification ID, syllabus transcript, and grading honors (Distinction or Honors) that can be verified directly by hiring managers."
    },
    {
      q: "Can I switch between independent learning and structured career paths?",
      a: "Absolutely. You can enroll in individual deep-dive masterclasses or follow our end-to-end curated Career Roadmaps (such as Full-Stack Architect or AI/LLM Systems Engineer)."
    },
    {
      q: "Do assignments include automated and instructor feedback?",
      a: "Yes. Projects require GitHub repository submissions, test suite passes, and code reviews from designated industry instructors."
    }
  ];

  // Inject FAQ schema on mount for AEO / People Also Ask eligibility
  useEffect(() => {
    injectSchema(buildFAQSchema(faqs));
    return () => { /* schema is cleaned up by router on navigation */ };
  }, []);

  return (
    <div className="space-y-24 sm:space-y-32">

      {/* 1. Hero Section */}
      <section className="relative pt-6 sm:pt-16 pb-10 sm:pb-12 overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[350px] bg-neutral-200/40 dark:bg-neutral-800/20 blur-[100px] sm:blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-6 sm:mb-8 animate-in fade-in duration-300 max-w-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">React 19, Next.js 15 & LLM Engineering Masterclasses</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          </div>

          <h1 className="text-3xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.12] mb-5 sm:mb-6 break-words">
            Architect the Future of <br className="hidden sm:inline" />
            <span className="text-neutral-500 dark:text-neutral-400">Software & AI Engineering.</span>
          </h1>

          <p className="text-sm sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2 sm:px-0">
            A developer-first learning management platform engineered for serious practitioners. Master production systems, verify skills with cryptographically backed credentials, and learn directly from staff architects.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none mx-auto">
            {/* Real <a href> for crawler discoverability — SPA nav via onClick */}
            <a
              href="/courses"
              onClick={(e) => { e.preventDefault(); openAuthModal('signup'); }}
              className="w-full sm:w-auto"
              aria-label="Start learning full-stack engineering for free"
            >
              <Button
                size="lg"
                variant="primary"
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Start Learning Free
              </Button>
            </a>
            <a
              href="/courses"
              onClick={(e) => { e.preventDefault(); setCurrentView('courses'); }}
              className="w-full sm:w-auto"
              aria-label="Browse the full engineering course catalog"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                icon={<Play className="w-4 h-4 fill-current" />}
              >
                Explore Course Catalog
              </Button>
            </a>
          </div>

          {/* Trust Meta */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 sm:mt-12 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 140k+ Active Engineers
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verifiable Certifications
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Interactive In-Browser Labs
            </span>
          </div>

          {/* E-E-A-T: Founder / About signal — visible to crawlers & AI engines */}
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-6 max-w-xl mx-auto leading-relaxed">
            Founded by <strong className="text-neutral-500 dark:text-neutral-500">Yaswant Pandey</strong>, a software engineer and educator, Yaswant Code was built in 2024 to bridge the gap between academic tutorials and production-grade engineering.
            Every course is designed around real-world systems used by top technology companies.
          </p>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Course disciplines and categories">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
              Explore Disciplines
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Curated masterclasses mapped to engineering career levels.
            </p>
          </div>
          <a
            href="/courses"
            onClick={(e) => { e.preventDefault(); setCurrentView('courses'); }}
            aria-label="Browse all engineering disciplines and courses"
          >
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              All 64 Disciplines
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <GlassCard
                key={cat.name}
                hoverEffect
                className="p-4 cursor-pointer text-center flex flex-col items-center justify-center group"
                onClick={() => setCurrentView('courses')}
              >
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-center text-neutral-800 dark:text-neutral-200 mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight mb-1">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {cat.count}
                </span>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* 3. Popular Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Curated Excellence</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
              Popular Engineering Courses
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('courses')}
          >
            Browse Full Marketplace
          </Button>
        </div>

        {courses.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/30">
            <BookOpen className="w-8 h-8 text-neutral-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">No courses published yet</p>
            <p className="text-xs text-neutral-500 mt-1">Check back soon or explore our learning roadmaps.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course) => (
              <GlassCard
                key={course.id}
                hoverEffect
                className="overflow-hidden flex flex-col cursor-pointer group"
                onClick={() => {
                  setSelectedCourse(course);
                  setCurrentView('course-detail');
                }}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    width={640}
                    height={360}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {course.isBestseller && (
                      <Badge variant="primary" size="sm">Bestseller</Badge>
                    )}
                    <Badge variant="neutral" size="sm">{course.difficulty}</Badge>
                    {course.driveUrl && (
                      <Badge variant="purple" size="sm" icon={<FolderOpen className="w-2.5 h-2.5 text-indigo-400" />}>
                        Drive
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-neutral-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px] font-mono text-white">
                    {course.durationHours}h • {course.lessonsCount} lessons
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                      <span>{course.category}</span>
                      <span className="flex items-center gap-1 font-semibold text-amber-500">
                        ★ {course.rating} <span className="text-neutral-400 font-normal">({course.reviewsCount})</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-neutral-950 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors line-clamp-2 mb-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-neutral-500 line-clamp-2 mb-4 leading-relaxed">
                      {course.tagline || course.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={course.instructor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor?.name || 'Yaswant Pandey')}&background=6366f1&color=fff`}
                        alt={course.instructor?.name || 'Instructor'}
                        width={24}
                        height={24}
                        loading="lazy"
                        decoding="async"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        {course.instructor?.name || 'Yaswant Pandey'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-neutral-950 dark:text-white">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <span className="text-xs text-neutral-400 line-through ml-1.5 font-mono">
                          ${course.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {/* 4. Trending Learning Paths */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 sm:p-12 rounded-2xl sm:rounded-3xl bg-neutral-950 text-white border border-neutral-800 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Structured Career Roadmaps
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Go From Mid-Level to Staff Engineer.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Step-by-step sequential learning roadmaps vetted by Silicon Valley hiring managers. Master theoretical computer science and production execution.
            </p>
          </div>

          {(() => {
            const tracksToShow = roadmaps.length > 0 ? roadmaps : ALL_ROADMAP_TRACKS.slice(0, 3);
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {tracksToShow.map((path) => (
                  <div
                    key={path.id}
                    onClick={() => setCurrentView('learning-paths')}
                    className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-yellow-400/60 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="purple" size="sm">{path.badge || '2026 Edition'}</Badge>
                        <span className="text-xs text-yellow-400 font-mono font-bold">roadmap.sh style</span>
                      </div>
                      <h3 className="text-base font-bold mb-2 group-hover:text-yellow-400 transition-colors">
                        {path.title}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-3 mb-4 leading-relaxed">
                        {path.subtitle || path.description}
                      </p>
                    </div>

                    <div>
                      <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                        <span className="text-neutral-400">{path.stages ? `${path.stages.length} Sequential Stages` : 'Curated Track'}</span>
                        <span className="font-semibold text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 group-hover:text-yellow-400">
                          View Roadmap <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* 5. Why Learn With Us (Bento Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">The Pedagogy</div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Designed for Real Production Demands
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            No shallow summaries. Rigorous engineering instruction built around actual production code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
              Production Codebases, Zero Fluff
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Every course provides GitHub monorepos, automated CI test suites, and Docker compose files so you can build and debug in realistic environments.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
              Verifiable Digital Credentials
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Earn shareable digital certificates with unique credential IDs and public verification pages that can be added to your LinkedIn licenses with one click.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
              Private Staff Engineer Community
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Engage directly in thread discussions with instructors and fellow senior engineers. Solve architecture questions and review system designs together.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* 6. Instructor Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Lead Instructor</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
              Learn Directly From Yaswant Pandey
            </h2>
          </div>
        </div>

        <div className="max-w-xl mx-auto">
          <GlassCard
            hoverEffect
            className="p-8 text-center cursor-pointer group"
            onClick={() => setCurrentView('courses')}
          >
            <div className="w-24 h-24 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-extrabold text-2xl mx-auto mb-4 ring-2 ring-neutral-200 dark:ring-neutral-800 shadow-md">
              YP
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
              {PRIMARY_INSTRUCTOR.name}
            </h3>
            <p className="text-xs text-neutral-500 font-medium mb-3 leading-relaxed">
              {PRIMARY_INSTRUCTOR.role}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 max-w-md mx-auto mb-4 leading-relaxed">
              {PRIMARY_INSTRUCTOR.bio}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-neutral-400 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <span className="font-semibold text-amber-500">★ {PRIMARY_INSTRUCTOR.rating}</span>
              <span>•</span>
              <span>{PRIMARY_INSTRUCTOR.studentsCount.toLocaleString()}+ Engineers Mentored</span>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Frequently asked questions about Yaswant Code">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Everything you need to know about the platform and certification process.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <GlassCard
                key={idx}
                className="overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-neutral-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-850">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="p-6 sm:p-14 rounded-2xl sm:rounded-3xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-center relative overflow-hidden shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Begin Your Engineering Upskilling Today.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-600 max-w-lg mx-auto leading-relaxed mb-8 px-2">
            Access complete interactive video lessons, quizzes, GitHub assignments, and verified certificates.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
            <Button
              size="lg"
              variant="primary"
              className="w-full sm:w-auto bg-white text-neutral-950 hover:bg-neutral-100 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-850 font-bold"
              onClick={() => openAuthModal('signup')}
            >
              Get Started for Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-neutral-700 text-white dark:border-neutral-300 dark:text-neutral-950"
              onClick={() => setCurrentView('courses')}
            >
              Browse 64 Courses
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};
