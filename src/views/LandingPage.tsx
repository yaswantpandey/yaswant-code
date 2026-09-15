import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { MOCK_COURSES, MOCK_LEARNING_PATHS, MOCK_INSTRUCTORS } from '../data/mockData';
import { 
  ArrowRight, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
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
  Award
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { GlassCard } from '../components/ui/GlassCard';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setSelectedCourse, brandName, openAuthModal } = useLms();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
            <Button
              size="lg"
              variant="primary"
              className="w-full sm:w-auto"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => openAuthModal('signup')}
            >
              Start Learning Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              icon={<Play className="w-4 h-4 fill-current" />}
              onClick={() => setCurrentView('courses')}
            >
              Explore Course Catalog
            </Button>
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
        </div>

        {/* Hero Interactive Bento Showcase Preview */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 mt-12 sm:mt-16">
          <GlassCard className="p-3.5 sm:p-6 shadow-2xl border border-neutral-300/80 dark:border-neutral-750">
            {/* Top Bar of Preview Window */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-neutral-200 dark:border-neutral-800 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80 shrink-0" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80 shrink-0" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80 shrink-0" />
                <span className="text-[11px] sm:text-xs font-mono text-neutral-400 ml-1 truncate">apex-lms.studio/workbench</span>
              </div>
              <Badge variant="success" size="sm" className="shrink-0 text-[10px] sm:text-xs">Live Environment</Badge>
            </div>

            {/* Bento Grid Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Active Lesson Preview */}
              <div className="md:col-span-2 rounded-2xl bg-neutral-900 text-white p-4 sm:p-6 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                    <Badge variant="purple" size="sm">Course In Progress</Badge>
                    <span className="text-[11px] sm:text-xs text-neutral-400 font-mono truncate">Module 1 • Lesson 3 of 64</span>
                  </div>
                  <h3 className="text-base sm:text-xl font-bold mb-2">Next.js 15 & React 19: Full-Stack Architecture</h3>
                  <p className="text-xs text-neutral-400 max-w-lg mb-4 leading-relaxed">
                    Optimistic UI Updates with useOptimistic & Server Action rollback boundaries.
                  </p>
                  <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800 font-mono text-[11px] sm:text-xs text-neutral-300 overflow-x-auto max-w-full">
                    <code className="whitespace-nowrap sm:whitespace-normal">const [optimisticState, setOptimistic] = useOptimistic(state, updateFn);</code>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 sm:pt-6 mt-4 border-t border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">21:30 Video Lecture</div>
                      <div className="text-[11px] text-neutral-400">Sarah Chen • Lead Frontend</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setSelectedCourse(MOCK_COURSES[0]);
                      setCurrentView('learning-interface');
                    }}
                  >
                    Resume Lesson
                  </Button>
                </div>
              </div>

              {/* Learning Stats Preview */}
              <div className="space-y-4">
                <GlassCard intensity="subtle" className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase">Learning Streak</span>
                    <Flame className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">19 Days Active</div>
                  <div className="text-xs text-neutral-500 mt-1">Top 3% consistency this month</div>
                  <div className="flex gap-1 mt-3">
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <div key={d} className="flex-1 h-2 rounded-full bg-emerald-500" />
                    ))}
                  </div>
                </GlassCard>

                <GlassCard intensity="subtle" className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase">Verified Credentials</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">2 Certificates</div>
                  <div className="text-xs text-neutral-500 mt-1">Design Systems & TypeScript Generics</div>
                  <button 
                    onClick={() => setCurrentView('certificate')}
                    className="text-xs font-semibold text-neutral-900 dark:text-white hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    View Credential Wallet <ChevronRight className="w-3 h-3" />
                  </button>
                </GlassCard>
              </div>

            </div>
          </GlassCard>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
              Explore Disciplines
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Curated masterclasses mapped to engineering career levels.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            onClick={() => setCurrentView('courses')}
          >
            All 64 Disciplines
          </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_COURSES.slice(0, 3).map((course) => (
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {course.isBestseller && (
                    <Badge variant="primary" size="sm">Bestseller</Badge>
                  )}
                  <Badge variant="neutral" size="sm">{course.difficulty}</Badge>
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
                    {course.tagline}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {course.instructor.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-neutral-950 dark:text-white">
                      ${course.price}
                    </span>
                    {course.originalPrice && (
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {MOCK_LEARNING_PATHS.map((path) => (
              <div
                key={path.id}
                onClick={() => setCurrentView('learning-paths')}
                className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="purple" size="sm">{path.difficulty}</Badge>
                    <span className="text-xs text-neutral-400 font-mono">{path.estimatedDuration}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2 group-hover:text-neutral-300 transition-colors">
                    {path.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-3 mb-4 leading-relaxed">
                    {path.description}
                  </p>
                </div>

                <div>
                  <div className="text-[11px] text-neutral-400 font-medium mb-2">Key Skills:</div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {path.skillsCovered.slice(0, 4).map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-neutral-400">{path.coursesCount} Specialized Courses</span>
                    <span className="font-semibold text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View Roadmap <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">World-Class Mentors</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
              Learn From Principal Engineers & Researchers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_INSTRUCTORS.map((inst) => (
            <GlassCard
              key={inst.id}
              hoverEffect
              className="p-6 text-center cursor-pointer group"
              onClick={() => setCurrentView('instructor-profile')}
            >
              <img
                src={inst.avatar}
                alt={inst.name}
                className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 ring-2 ring-neutral-200 dark:ring-neutral-800 group-hover:scale-105 transition-transform"
              />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                {inst.name}
              </h3>
              <p className="text-[11px] text-neutral-500 line-clamp-2 mb-3 leading-relaxed">
                {inst.role}
              </p>
              <div className="flex items-center justify-center gap-3 text-xs text-neutral-400 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="font-semibold text-amber-500">★ {inst.rating}</span>
                <span>•</span>
                <span>{inst.studentsCount.toLocaleString()} Students</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
