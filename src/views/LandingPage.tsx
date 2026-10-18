import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
} from 'framer-motion';
import { useLms } from '../context/LmsContext';
import { PRIMARY_INSTRUCTOR } from '../config/brand';
import { ALL_ROADMAP_TRACKS } from '../data/fullstackRoadmap';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Users,
  ChevronDown,
  Play,
  GitBranch,
  BadgeCheck,
  MousePointer2,
  Rocket,
  Route,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { injectSchema, buildFAQSchema } from '../services/seo';
import { Reveal, TiltCard, Magnetic, CountUp, Marquee, AnimatedCta, fadeUp, stagger, EASE_OUT } from '../components/landing/motion';

// three.js is heavy — load the hero scene in its own chunk so it never blocks first paint
const HeroScene = React.lazy(() => import('../components/landing/HeroScene'));

const HEADLINE_TOP = ['Architect', 'the', 'Future'];
const HEADLINE_BOTTOM = ['of', 'Software', '&', 'AI', 'Engineering.'];

const TECH_STACK = [
  'React 19', 'Next.js 15', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker',
  'Kubernetes', 'AWS', 'Go', 'GraphQL', 'PyTorch', 'LLM Agents', 'Kafka',
];

const SectionHeading: React.FC<{ eyebrow: string; title: React.ReactNode; sub?: string; center?: boolean }> = ({
  eyebrow,
  title,
  sub,
  center,
}) => (
  <Reveal className={center ? 'text-center max-w-2xl mx-auto' : ''}>
    <div className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F5C451] mb-3`}>
      <span className="h-px w-6 bg-[#F5C451]/60" />
      {eyebrow}
    </div>
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">{title}</h2>
    {sub && <p className="text-sm sm:text-base text-[#F0EDE4]/70 mt-3 leading-relaxed">{sub}</p>}
  </Reveal>
);

export const LandingPage: React.FC = () => {
  const { setCurrentView, openAuthModal } = useLms();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    fetch('/api/roadmaps.php')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) setRoadmaps(json.data);
      })
      .catch(() => { });
  }, []);

  // Defer the WebGL scene until the browser is idle so it never competes with LCP
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) {
      w.requestIdleCallback(() => setSceneReady(true), { timeout: 1200 });
    } else {
      const id = window.setTimeout(() => setSceneReady(true), 400);
      return () => window.clearTimeout(id);
    }
  }, []);

  const faqs = [
    {
      q: "How does this curriculum differ from generic coding tutorials?",
      a: "Every roadmap and project is built around real production systems. You build real-world distributed architectures, write zero-waterfall React 19 apps, and fine-tune transformer weights—not toy todo lists."
    },
    {
      q: "Can I switch between independent learning and structured career paths?",
      a: "Absolutely. Follow an end-to-end Career Roadmap (Full Stack, Frontend, Backend or DevOps), or jump straight into individual projects, study notes and developer tools."
    },
    {
      q: "Do projects include automated and instructor feedback?",
      a: "Yes. Projects require GitHub repository submissions, test suite passes, and code reviews from designated industry instructors."
    }
  ];

  // Inject FAQ schema on mount for AEO / People Also Ask eligibility
  useEffect(() => {
    injectSchema(buildFAQSchema(faqs));
    return () => { /* schema is cleaned up by router on navigation */ };
  }, []);

  // Page scroll progress bar + hero parallax
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroProgress, [0, 1], [0, 140]);
  const heroFade = useTransform(heroProgress, [0, 0.8], [1, 0]);
  const sceneScale = useTransform(heroProgress, [0, 1], [1, 1.15]);

  // Spotlight that follows the cursor in the final CTA
  const ctaX = useMotionValue(50);
  const ctaY = useMotionValue(50);
  const ctaGlow = useMotionTemplate`radial-gradient(600px circle at ${ctaX}% ${ctaY}%, rgba(245,196,81,0.22), transparent 55%)`;

  const tracksToShow = roadmaps.length > 0 ? roadmaps : ALL_ROADMAP_TRACKS.slice(0, 3);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left bg-gradient-to-r from-[#5EEAD4] via-[#F5C451] to-[#F0EDE4]"
        style={{ scaleX: progress }}
      />

      <div className="space-y-24 sm:space-y-32 overflow-x-clip">

        {/* 1. Hero — WebGL scene + kinetic type */}
        <section ref={heroRef} className="relative isolate min-h-[calc(100svh-4rem)] flex items-center pt-10 pb-20 sm:py-16">
          {/* Static gradient fallback (also the WebGL backdrop) */}
          <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_70%_45%,#006158_0%,#004741_45%,#00302b_100%)]" />
          <div aria-hidden className="absolute inset-0 -z-20 grid-backdrop [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

          <motion.div aria-hidden className="absolute inset-0 -z-10" style={{ scale: sceneScale }}>
            {sceneReady && (
              <React.Suspense fallback={null}>
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.6, ease: 'easeOut' }}
                >
                  <HeroScene className="absolute inset-0 opacity-45 lg:opacity-100" />
                </motion.div>
              </React.Suspense>
            )}
          </motion.div>
          {/* Legibility veil on the text side */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b lg:bg-gradient-to-r from-[#004741]/85 via-[#004741]/40 to-transparent pointer-events-none" />
          <div aria-hidden className="absolute bottom-0 inset-x-0 h-40 -z-10 bg-gradient-to-t from-[#004741] to-transparent pointer-events-none" />

          <motion.div style={{ y: heroY, opacity: heroFade }} className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger(0.08, 0.1)}
              className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0"
            >
              <motion.a
                variants={fadeUp}
                href="/roadmaps"
                onClick={(e) => { e.preventDefault(); setCurrentView('learning-paths'); }}
                className="group inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-[#F0EDE4]/[0.06] border border-[#F0EDE4]/15 backdrop-blur-md text-xs font-semibold mb-7 max-w-full hover:border-[#F0EDE4]/35 transition-colors"
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F5C451] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#004741]">
                  <Sparkles className="w-3 h-3 text-[#004741] transition-transform duration-500 group-hover:rotate-180 group-hover:scale-125" /> New
                </span>
                <span className="truncate text-[#F0EDE4]/90">2026 Roadmaps: Full Stack, Frontend, Backend & DevOps</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#F0EDE4]/60 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </motion.a>

              <h1 className="text-[2.6rem] sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.04] mb-6 break-words">
                <span className="lg:block">
                  {HEADLINE_TOP.map((w, i) => (
                    <React.Fragment key={w}>
                    <span className="inline-block overflow-hidden align-bottom pb-1">
                      <motion.span
                        className="inline-block"
                        initial={{ y: '110%', rotate: 4 }}
                        animate={{ y: 0, rotate: 0 }}
                        transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 + i * 0.07 }}
                      >
                        {w}
                      </motion.span>
                    </span>{' '}
                    </React.Fragment>
                  ))}
                </span>
                <span className="lg:block">
                  {HEADLINE_BOTTOM.map((w, i) => (
                    <React.Fragment key={w}>
                    <span className="inline-block overflow-hidden align-bottom pb-1">
                      <motion.span
                        className={`inline-block ${w === 'of' ? '' : 'text-gradient-sand'}`}
                        initial={{ y: '110%', rotate: 4 }}
                        animate={{ y: 0, rotate: 0 }}
                        transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.45 + i * 0.07 }}
                      >
                        {w}
                      </motion.span>
                    </span>{' '}
                    </React.Fragment>
                  ))}
                </span>
              </h1>

              <motion.p
                initial={{ y: 16 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.6 }}
                className="text-base sm:text-lg text-[#F0EDE4]/75 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-9"
              >
                A developer-first learning platform engineered for serious practitioners. Follow step-by-step roadmaps, build production-grade projects, and sharpen your skills with free notes and developer tools.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none mx-auto lg:mx-0"
              >
                {/* Real <a href> for crawler discoverability — SPA nav via onClick */}
                <Magnetic>
                  <a
                    href="/roadmaps"
                    onClick={(e) => { e.preventDefault(); openAuthModal('signup'); }}
                    className="block"
                    aria-label="Start learning full-stack engineering for free"
                  >
                    <AnimatedCta icon={Rocket} iconMotion="launch" trailing={ArrowRight} className="w-full sm:w-auto">
                      Start Learning Free
                    </AnimatedCta>
                  </a>
                </Magnetic>
                <Magnetic strength={0.15}>
                  <a
                    href="/roadmaps"
                    onClick={(e) => { e.preventDefault(); setCurrentView('learning-paths'); }}
                    className="block"
                    aria-label="Explore the engineering career roadmaps"
                  >
                    <AnimatedCta variant="ghost" icon={Play} iconMotion="pop" trailing={ChevronRight} className="w-full sm:w-auto">
                      Explore Roadmaps
                    </AnimatedCta>
                  </a>
                </Magnetic>
              </motion.div>

              {/* Trust Meta */}
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 mt-9 text-xs text-[#F0EDE4]/70"
              >
                {['140k+ Active Engineers', 'Hands-On Projects', 'Interactive In-Browser Labs'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#5EEAD4]" /> {t}
                  </span>
                ))}
              </motion.div>

              {/* E-E-A-T: Founder / About signal — visible to crawlers & AI engines */}
              <motion.p variants={fadeUp} className="text-xs text-[#F0EDE4]/50 mt-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Founded by <strong className="text-[#F0EDE4]/70">Yaswant Pandey</strong>, a software engineer and educator, Yaswant Code was built in 2024 to bridge the gap between academic tutorials and production-grade engineering.
                Every roadmap and project is designed around real-world systems used by top technology companies.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Floating proof chips orbiting the 3D core (desktop only) */}
          <div aria-hidden className="hidden lg:block absolute inset-y-0 right-0 w-1/2 pointer-events-none">
            {[
              { icon: CheckCircle2, label: '142 tests passed', sub: 'CI · distributed-cache', pos: 'top-[22%] left-[8%]', color: 'text-[#5EEAD4]', d: 1.1, f: 6 },
              { icon: BadgeCheck, label: 'Stage complete', sub: 'Full Stack · Stage 4', pos: 'bottom-[24%] right-[10%]', color: 'text-[#F5C451]', d: 1.3, f: 7.5 },
              { icon: GitBranch, label: 'PR merged', sub: 'review by instructor', pos: 'top-[16%] right-[14%]', color: 'text-[#F0EDE4]', d: 1.5, f: 8 },
            ].map(({ icon: Icon, label, sub, pos, color, d, f }) => (
              <motion.div
                key={label}
                className={`absolute ${pos}`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE_OUT, delay: d }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: f, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex items-center gap-3 rounded-2xl border border-[#F0EDE4]/15 bg-[#00302b]/70 backdrop-blur-xl px-4 py-3 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0EDE4]/[0.07]">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-xs font-semibold text-[#F0EDE4]">{label}</span>
                    <span className="block text-[10px] font-mono text-[#F0EDE4]/55">{sub}</span>
                  </span>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Scroll cue */}
          <motion.div
            aria-hidden
            className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#F0EDE4]/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <MousePointer2 className="w-3.5 h-3.5" />
            <span className="relative h-10 w-px overflow-hidden bg-[#F0EDE4]/15">
              <motion.span
                className="absolute inset-x-0 top-0 h-4 bg-[#F5C451]"
                animate={{ y: [-16, 40] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </span>
          </motion.div>
        </section>

        {/* 1b. Stats + tech marquee */}
        <section className="-mt-6 sm:-mt-10 space-y-14" aria-label="Platform at a glance">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger(0.1)}
              className="grid grid-cols-2 lg:grid-cols-4 rounded-3xl border border-[#F0EDE4]/12 bg-[#00302b]/60 backdrop-blur-xl overflow-hidden divide-x divide-y lg:divide-y-0 divide-[#F0EDE4]/10"
            >
              {[
                { node: <CountUp to={140} suffix="k+" />, label: 'Active engineers' },
                { node: <CountUp to={ALL_ROADMAP_TRACKS.reduce((n, t) => n + t.stages.length, 0)} />, label: 'Roadmap stages' },
                { node: <CountUp to={ALL_ROADMAP_TRACKS.length} />, label: 'Career roadmaps' },
                { node: <CountUp to={PRIMARY_INSTRUCTOR.rating} decimals={1} suffix="★" />, label: 'Instructor rating' },
              ].map(({ node, label }) => (
                <motion.div key={label} variants={fadeUp} className="p-6 sm:p-8 text-center">
                  <div className="text-3xl sm:text-5xl font-bold tracking-tight text-gradient-sand tabular-nums">{node}</div>
                  <div className="mt-2 text-[11px] sm:text-xs uppercase tracking-[0.18em] text-[#F0EDE4]/60">{label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <Marquee duration={45}>
            {TECH_STACK.map((t) => (
              <span key={t} className="flex items-center gap-10 whitespace-nowrap text-lg sm:text-2xl font-semibold tracking-tight text-[#F0EDE4]/35">
                {t}
                <Sparkles className="w-4 h-4 text-[#F5C451]/50" />
              </span>
            ))}
          </Marquee>
        </section>

        {/* 4. Trending Learning Paths */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="relative p-6 sm:p-14 rounded-3xl bg-[#00211e] border border-[#F0EDE4]/10 overflow-hidden">
            <div aria-hidden className="absolute inset-0 grid-backdrop opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
            <div aria-hidden className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#5EEAD4]/10 blur-[120px]" />
            <div aria-hidden className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#F5C451]/10 blur-[120px]" />
            <div aria-hidden className="absolute top-0 inset-x-0 h-px overflow-hidden">
              <div className="beam-line h-px w-1/4 bg-gradient-to-r from-transparent via-[#F5C451] to-transparent" />
            </div>

            <div className="relative z-10 max-w-2xl mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0EDE4]/10 text-xs font-semibold mb-5">
                <Sparkles className="w-3.5 h-3.5 text-[#F5C451]" /> Structured Career Roadmaps
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
                Go From Mid-Level to <span className="text-gradient-sand">Staff Engineer.</span>
              </h2>
              <p className="text-sm text-[#F0EDE4]/65 leading-relaxed">
                Step-by-step sequential learning roadmaps vetted by Silicon Valley hiring managers. Master theoretical computer science and production execution.
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger(0.12)}
              className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Connector line tying the roadmap cards into a path */}
              <motion.div
                aria-hidden
                className="hidden md:block absolute top-9 left-[8%] right-[8%] h-px origin-left bg-gradient-to-r from-[#5EEAD4]/60 via-[#F5C451]/60 to-[#F0EDE4]/20"
                variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.4, ease: EASE_OUT } } }}
              />
              {tracksToShow.map((path, i) => (
                <TiltCard
                  key={path.id}
                  variants={fadeUp}
                  max={6}
                  onClick={() => setCurrentView('learning-paths')}
                  className="p-6 flex flex-col justify-between bg-[#003a34]/80"
                >
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#F5C451]/50 bg-[#00211e] font-mono text-[11px] text-[#F5C451]">
                        {i + 1}
                      </span>
                      <Badge variant="purple" size="sm">{path.badge || '2026 Edition'}</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-2 transition-colors group-hover:text-yellow-300">
                      {path.title}
                    </h3>
                    <p className="text-xs text-[#F0EDE4]/60 line-clamp-3 mb-5 leading-relaxed">
                      {path.subtitle || path.description}
                    </p>
                  </div>

                  <div className="relative pt-4 border-t border-[#F0EDE4]/10 flex items-center justify-between text-xs">
                    <span className="text-[#F0EDE4]/55">{path.stages ? `${path.stages.length} Sequential Stages` : 'Curated Track'}</span>
                    <span className="font-semibold inline-flex items-center gap-1.5 text-[#F5C451]">
                      <Route className="w-3.5 h-3.5 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-125" />
                      View Roadmap
                      <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </TiltCard>
              ))}
            </motion.div>
          </Reveal>
        </section>

        {/* 5. Why Learn With Us (Bento Grid) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <SectionHeading
              center
              eyebrow="The Pedagogy"
              title={<>Designed for Real <span className="text-gradient-sand">Production Demands</span></>}
              sub="No shallow summaries. Rigorous engineering instruction built around actual production code."
            />
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.12)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Guided roadmaps — stage checklist that ticks itself off */}
            <TiltCard variants={fadeUp} className="p-6 overflow-hidden">
              <div className="relative">
                <motion.ul
                  className="relative mb-6 space-y-2 rounded-xl border border-[#F5C451]/30 bg-gradient-to-br from-[#F5C451]/10 via-[#003a34] to-[#5EEAD4]/10 p-4"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={stagger(0.25, 0.2)}
                >
                  {['Web & Internet Fundamentals', 'Frontend Frameworks', 'Backend & Databases'].map((stage, i) => (
                    <motion.li
                      key={stage}
                      variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                      className="flex items-center gap-2.5 text-xs"
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${i < 2 ? 'bg-[#5EEAD4]' : 'border border-[#F5C451]/60'}`}>
                        {i < 2 ? <CheckCircle2 className="w-3.5 h-3.5 text-[#004741]" /> : <span className="h-1.5 w-1.5 rounded-full bg-[#F5C451] animate-pulse" />}
                      </span>
                      <span className={i < 2 ? 'text-[#F0EDE4]/60 line-through decoration-[#5EEAD4]/50' : 'font-semibold'}>{stage}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                <h3 className="text-base font-bold mb-2">Guided Career Roadmaps</h3>
                <p className="text-xs text-[#F0EDE4]/65 leading-relaxed">
                  Follow sequential, stage-by-stage roadmaps for Full Stack, Frontend, Backend and DevOps, with curated resources for every step.
                </p>
              </div>
            </TiltCard>

            {/* Community — avatar stack with pulse */}
            <TiltCard variants={fadeUp} className="p-6">
              <div className="relative">
                <div className="mb-6 flex items-center">
                  {['#5EEAD4', '#F5C451', '#F0EDE4', '#7dd3fc', '#fda4af'].map((c, i) => (
                    <motion.span
                      key={c}
                      className="-ml-2 first:ml-0 h-10 w-10 rounded-full border-2 border-[#003a34] flex items-center justify-center text-[11px] font-bold text-[#004741]"
                      style={{ background: c }}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.2 + i * 0.08 }}
                    >
                      {['AK', 'RS', 'YP', 'MJ', 'NV'][i]}
                    </motion.span>
                  ))}
                  <span className="relative ml-3 flex h-3 w-3">
                    <span className="absolute inset-0 rounded-full bg-[#5EEAD4] animate-ping opacity-60" />
                    <span className="relative h-3 w-3 rounded-full bg-[#5EEAD4]" />
                  </span>
                  <span className="ml-2 text-[11px] text-[#F0EDE4]/60">online now</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#F0EDE4]/10 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-[#F0EDE4]" />
                </div>
                <h3 className="text-base font-bold mb-2">Private Staff Engineer Community</h3>
                <p className="text-xs text-[#F0EDE4]/65 leading-relaxed">
                  Engage directly in thread discussions with instructors and fellow senior engineers. Solve architecture questions and review system designs together.
                </p>
              </div>
            </TiltCard>
          </motion.div>
        </section>

        {/* 6. Instructor Highlights */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <SectionHeading
              eyebrow="Lead Instructor"
              title={<>Learn Directly From <span className="text-gradient-sand">Yaswant Pandey</span></>}
              sub={PRIMARY_INSTRUCTOR.bio}
            />

            <Reveal delay={0.15}>
              <TiltCard onClick={() => setCurrentView('learning-paths')} className="p-8 sm:p-10 text-center">
                <div className="relative mx-auto mb-6 h-28 w-28">
                  <span aria-hidden className="spin-slow absolute -inset-1 rounded-[1.75rem] bg-[conic-gradient(from_0deg,#5EEAD4,#F5C451,#F0EDE4,#5EEAD4)] opacity-80 blur-[2px]" />
                  <span className="relative flex h-full w-full items-center justify-center rounded-3xl bg-[#00211e] text-3xl font-bold">
                    YP
                  </span>
                </div>
                <h3 className="relative text-xl font-bold mb-1">{PRIMARY_INSTRUCTOR.name}</h3>
                <p className="relative text-xs text-[#F0EDE4]/60 font-medium mb-6">{PRIMARY_INSTRUCTOR.role}</p>
                <div className="relative grid grid-cols-3 gap-2 pt-6 border-t border-[#F0EDE4]/10">
                  {[
                    { v: <CountUp to={PRIMARY_INSTRUCTOR.rating} decimals={1} suffix="★" />, l: 'Rating' },
                    { v: <CountUp to={PRIMARY_INSTRUCTOR.studentsCount} suffix="+" />, l: 'Mentored' },
                    { v: <CountUp to={ALL_ROADMAP_TRACKS.length} />, l: 'Roadmaps' },
                  ].map(({ v, l }) => (
                    <div key={l}>
                      <div className="text-xl sm:text-2xl font-bold text-[#F5C451] tabular-nums">{v}</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[#F0EDE4]/50 mt-1">{l}</div>
                    </div>
                  ))}
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </section>

        {/* 7. FAQ Accordion */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Frequently asked questions about Yaswant Code">
          <div className="mb-12">
            <SectionHeading
              center
              eyebrow="FAQ"
              title="Frequently Asked Questions"
              sub="Everything you need to know about the platform."
            />
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger(0.08)}
            className="space-y-3"
          >
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className={`rounded-2xl border backdrop-blur-xl transition-colors duration-300 ${isOpen ? 'border-[#F5C451]/35 bg-[#003a34]/90' : 'border-[#F0EDE4]/12 bg-[#003a34]/50 hover:border-[#F0EDE4]/25'}`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="group w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#F0EDE4]"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className={`w-5 h-5 shrink-0 transition-all duration-500 group-hover:rotate-[20deg] group-hover:scale-110 ${isOpen ? 'text-[#F5C451]' : 'text-[#F0EDE4]/50 group-hover:text-[#5EEAD4]'}`} />
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isOpen ? 'bg-[#F5C451]' : 'bg-[#F0EDE4]/10'}`}
                    >
                      <ChevronDown className={`w-4 h-4 ${isOpen ? 'text-[#004741]' : 'text-[#F0EDE4]/70'}`} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE_OUT }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 sm:px-6 pb-6 text-sm text-[#F0EDE4]/70 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* 8. Final CTA */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <Reveal>
            <div
              className="relative rounded-[2rem] p-px overflow-hidden"
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                ctaX.set(((e.clientX - r.left) / r.width) * 100);
                ctaY.set(((e.clientY - r.top) / r.height) * 100);
              }}
            >
              {/* Rotating gradient border */}
              <span aria-hidden className="spin-slow absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0%,#F5C451_10%,transparent_25%,transparent_50%,#5EEAD4_60%,transparent_75%)] opacity-70 [animation-duration:10s]" />
              <div className="relative rounded-[calc(2rem-1px)] bg-[#00211e] px-6 py-14 sm:px-14 sm:py-20 text-center overflow-hidden">
                <motion.div aria-hidden className="absolute inset-0" style={{ background: ctaGlow }} />
                <div aria-hidden className="absolute inset-0 grid-backdrop opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
                {[
                  { c: '#5EEAD4', pos: 'top-8 left-[12%]', d: 7 },
                  { c: '#F5C451', pos: 'bottom-10 right-[14%]', d: 9 },
                  { c: '#F0EDE4', pos: 'top-16 right-[24%]', d: 6 },
                ].map(({ c, pos, d }) => (
                  <motion.span
                    key={c}
                    aria-hidden
                    className={`absolute ${pos} h-2 w-2 rounded-full`}
                    style={{ background: c, boxShadow: `0 0 24px 6px ${c}55` }}
                    animate={{ y: [0, -18, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: d, repeat: Infinity, ease: 'easeInOut' }}
                  />
                ))}

                <div className="relative">
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 leading-[1.08]">
                    Begin Your Engineering <br className="hidden sm:inline" />
                    <span className="text-gradient-sand">Upskilling Today.</span>
                  </h2>
                  <p className="text-sm sm:text-base text-[#F0EDE4]/65 max-w-lg mx-auto leading-relaxed mb-10">
                    Access step-by-step roadmaps, hands-on projects, study notes, and free developer tools.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
                    <Magnetic>
                      <button type="button" className="block w-full" onClick={() => openAuthModal('signup')}>
                        <AnimatedCta icon={Sparkles} iconMotion="spin" trailing={ArrowRight} className="w-full sm:w-auto">
                          Get Started for Free
                        </AnimatedCta>
                      </button>
                    </Magnetic>
                    <Magnetic strength={0.15}>
                      <button type="button" className="block w-full" onClick={() => setCurrentView('learning-paths')}>
                        <AnimatedCta variant="ghost" icon={Route} iconMotion="wiggle" trailing={ChevronRight} className="w-full sm:w-auto">Explore Roadmaps</AnimatedCta>
                      </button>
                    </Magnetic>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

      </div>
    </MotionConfig>
  );
};
