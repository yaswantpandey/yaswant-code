import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useLms } from '../context/LmsContext';
import { PRIMARY_INSTRUCTOR } from '../config/brand';
import { ALL_ROADMAP_TRACKS } from '../data/fullstackRoadmap';
import { ArrowRight, ChevronRight, ChevronDown } from 'lucide-react';
import { injectSchema, buildFAQSchema } from '../services/seo';

const EASE = [0.22, 1, 0.36, 1] as const;

const FadeIn: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className, delay = 0,
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.6, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

export const LandingPage: React.FC = () => {
  const { setCurrentView, openAuthModal } = useLms();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does this differ from generic coding tutorials?",
      a: "Every roadmap follows real production system patterns. You build distributed caches, write zero-waterfall React apps, and work with production databases — not todo lists."
    },
    {
      q: "Can I follow individual topics or only full roadmaps?",
      a: "Both. Follow a complete career roadmap (Full Stack, Frontend, Backend, DevOps) end-to-end, or jump to individual projects, study notes, and developer tools."
    },
    {
      q: "Do projects include code review?",
      a: "Yes. Projects require GitHub submissions, test suite passes, and review from designated instructors."
    },
    {
      q: "Is the content updated for 2026 tooling?",
      a: "Yes. Roadmaps cover React 19, Next.js 15, Node 22, PostgreSQL 17, Kubernetes, LLM integration, and current cloud-native patterns."
    }
  ];

  useEffect(() => {
    injectSchema(buildFAQSchema(faqs));
  }, []);

  const totalStages = ALL_ROADMAP_TRACKS.reduce((n, t) => n + t.stages.length, 0);

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full overflow-x-hidden">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-16 xl:gap-24 items-start">

            {/* Left — Headline + CTA */}
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#FD1843] mb-7"
              >
                Developer Learning Platform · 2026
              </motion.p>

              <h1 className="text-[3rem] sm:text-[4rem] lg:text-[5rem] xl:text-[6rem] font-bold tracking-[-0.025em] leading-[0.92] mb-8 text-[#110508]">
                <motion.span
                  className="block"
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, ease: EASE, delay: 0.08 }}
                >
                  Architect
                </motion.span>
                <motion.span
                  className="block"
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, ease: EASE, delay: 0.16 }}
                >
                  the Future
                </motion.span>
                <motion.span
                  className="block text-[#FD1843]"
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, ease: EASE, delay: 0.24 }}
                >
                  of Software.
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.36 }}
                className="text-base sm:text-[1.05rem] text-[#110508]/60 max-w-[500px] leading-relaxed mb-10"
              >
                Step-by-step engineering roadmaps, production-grade projects, and developer tools —
                built for engineers who ship real systems.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.46 }}
                className="flex items-center gap-5 flex-wrap"
              >
                <a
                  href="/roadmaps"
                  onClick={(e) => { e.preventDefault(); openAuthModal('signup'); }}
                  className="inline-flex items-center gap-2 bg-[#FD1843] text-[#FFF9FA] px-6 py-3 text-sm font-semibold hover:bg-[#E5102F] transition-colors"
                  aria-label="Start learning for free"
                >
                  Start Learning Free
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="/roadmaps"
                  onClick={(e) => { e.preventDefault(); setCurrentView('learning-paths'); }}
                  className="text-sm font-semibold text-[#110508] underline underline-offset-4 decoration-[#110508]/20 hover:text-[#FD1843] hover:decoration-[#FD1843]/50 transition-colors"
                  aria-label="Browse career roadmaps"
                >
                  View roadmaps
                </a>
              </motion.div>

              {/* Inline stats — no cards, no orbs, just numbers */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.62 }}
                className="mt-12 pt-8 border-t border-[#110508]/8 flex flex-wrap gap-8"
              >
                {[
                  { val: '140k+', label: 'engineers enrolled' },
                  { val: String(ALL_ROADMAP_TRACKS.length), label: 'career tracks' },
                  { val: String(totalStages), label: 'stages of content' },
                  { val: `${PRIMARY_INSTRUCTOR.rating}★`, label: 'instructor rating', pink: true },
                ].map(({ val, label, pink }) => (
                  <div key={label}>
                    <span className={`block text-xl font-bold ${pink ? 'text-[#FD1843]' : 'text-[#110508]'}`}>
                      {val}
                    </span>
                    <span className="block text-xs text-[#110508]/45 mt-0.5">{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Track listing (desktop only) */}
            <motion.aside
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
              className="hidden lg:block"
              aria-label="Career tracks"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#110508]/30 mb-5">
                2026 Career Tracks
              </p>
              <div className="divide-y divide-[#110508]/8">
                {ALL_ROADMAP_TRACKS.map((track, i) => (
                  <button
                    key={track.id}
                    onClick={() => setCurrentView('learning-paths')}
                    className="group w-full flex items-start justify-between gap-4 py-4 text-left"
                  >
                    <div>
                      <span className="block text-[10px] font-mono text-[#110508]/28 mb-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="block text-[0.85rem] font-semibold text-[#110508] group-hover:text-[#FD1843] transition-colors leading-tight">
                        {track.title}
                      </span>
                      <span className="block text-xs text-[#110508]/38 mt-1">
                        {track.stages?.length ?? 0} stages
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#110508]/18 group-hover:text-[#FD1843] shrink-0 mt-3 transition-colors" />
                  </button>
                ))}
              </div>

              <p className="mt-8 text-xs text-[#110508]/40 leading-relaxed">
                Founded by{' '}
                <strong className="font-semibold text-[#110508]/65">Yaswant Pandey</strong>
                {' '}— software engineer and educator. Built in 2024 to bridge the gap between
                tutorials and production-grade engineering.
              </p>
            </motion.aside>
          </div>
        </section>

        {/* ── DIVIDER ───────────────────────────────────────────────── */}
        <div className="border-t border-[#110508]/8" />

        {/* ── CURRICULUM ────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <FadeIn className="mb-14">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#FD1843] mb-4">
              The Curriculum
            </p>
            <h2 className="text-3xl sm:text-[2.5rem] font-bold tracking-[-0.02em] text-[#110508] leading-[1.1] max-w-lg">
              Production engineering,<br />not toy projects.
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-x-16">
            {[
              {
                n: '01',
                title: 'Sequential Roadmaps',
                body: 'Not playlists — ordered paths built around hiring criteria at top-tier engineering teams. Each stage builds directly on the last.'
              },
              {
                n: '02',
                title: 'Real Codebase Projects',
                body: 'Build a distributed cache, a fintech microservice, an LLM agent pipeline. Submit via GitHub, reviewed by an instructor.'
              },
              {
                n: '03',
                title: 'Study Notes & References',
                body: 'Every concept backed by dense, engineering-grade reference material — written for practitioners, not beginners.'
              },
              {
                n: '04',
                title: 'Developer Toolkit',
                body: 'JSON formatter, regex tester, JWT decoder, cron expression builder — directly in the browser, no account required.'
              },
            ].map((item, i) => (
              <FadeIn key={item.n} delay={i * 0.07}>
                <div className="flex gap-6 py-8 border-b border-[#110508]/8">
                  <span className="text-xs font-mono text-[#FD1843] shrink-0 pt-0.5">{item.n}</span>
                  <div>
                    <h3 className="text-[0.9rem] font-bold text-[#110508] mb-2">{item.title}</h3>
                    <p className="text-sm text-[#110508]/55 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── TRACKS ────────────────────────────────────────────────── */}
        <section className="bg-[#FD1843]" aria-label="Career roadmap tracks">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <FadeIn className="mb-12">
              <h2 className="text-3xl sm:text-[2.75rem] font-bold tracking-[-0.02em] text-[#FFF9FA] leading-[1.1] mb-4">
                Four tracks.<br />One platform.
              </h2>
              <p className="text-sm text-[#FFF9FA]/65 max-w-md">
                Full Stack, Frontend, Backend, DevOps — each a complete career roadmap, not a beginner course.
              </p>
            </FadeIn>

            <div className="divide-y divide-[#FFF9FA]/15">
              {ALL_ROADMAP_TRACKS.map((track, i) => (
                <FadeIn key={track.id} delay={i * 0.06}>
                  <button
                    onClick={() => setCurrentView('learning-paths')}
                    className="group w-full flex items-center justify-between gap-6 py-6 text-left"
                  >
                    <div className="flex items-baseline gap-5 min-w-0">
                      <span className="text-[11px] font-mono text-[#FFF9FA]/38 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <span className="block text-base sm:text-lg font-bold text-[#FFF9FA] leading-tight">
                          {track.title}
                        </span>
                        <span className="block text-xs text-[#FFF9FA]/55 mt-1 truncate max-w-sm">
                          {track.subtitle || track.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="hidden sm:block text-xs font-mono text-[#FFF9FA]/48">
                        {track.stages?.length ?? 0} stages
                      </span>
                      <span className="text-[11px] bg-[#FFF9FA]/15 text-[#FFF9FA] px-2.5 py-1 font-semibold tracking-wide">
                        {track.badge || '2026'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#FFF9FA]/38 group-hover:text-[#FFF9FA] transition-colors" />
                    </div>
                  </button>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── INSTRUCTOR ────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
            <FadeIn>
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#FD1843] mb-6">
                Lead Instructor
              </p>
              <h2 className="text-3xl sm:text-[2.5rem] font-bold tracking-[-0.02em] text-[#110508] mb-6 leading-[1.1]">
                {PRIMARY_INSTRUCTOR.name}
              </h2>
              <p className="text-sm text-[#110508]/58 leading-relaxed mb-6">
                {PRIMARY_INSTRUCTOR.bio}
              </p>
              <p className="text-sm text-[#110508]/58 leading-relaxed mb-8">
                Yaswant Code was built in 2024 to bridge the gap between academic tutorials and
                production engineering. Every roadmap is designed around real systems used at top
                technology companies.
              </p>
              <div className="flex flex-wrap gap-2">
                {PRIMARY_INSTRUCTOR.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs border border-[#110508]/14 text-[#110508]/55 px-3 py-1 font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15} className="lg:flex lg:flex-col lg:justify-center">
              <div className="divide-y divide-[#110508]/8">
                {[
                  { label: 'Instructor rating', value: `${PRIMARY_INSTRUCTOR.rating} / 5.0`, pink: true },
                  { label: 'Engineers mentored', value: `${PRIMARY_INSTRUCTOR.studentsCount}+` },
                  { label: 'Career tracks authored', value: String(ALL_ROADMAP_TRACKS.length) },
                  { label: 'Platform launched', value: '2024' },
                ].map(({ label, value, pink }) => (
                  <div key={label} className="flex items-center justify-between py-5">
                    <span className="text-sm text-[#110508]/48">{label}</span>
                    <span className={`text-lg font-bold tabular-nums ${pink ? 'text-[#FD1843]' : 'text-[#110508]'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── DIVIDER ───────────────────────────────────────────────── */}
        <div className="border-t border-[#110508]/8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <section
          className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-28"
          aria-label="Frequently asked questions about Yaswant Code"
        >
          <FadeIn className="mb-12">
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#110508]">
              Common questions.
            </h2>
          </FadeIn>

          <div>
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <FadeIn key={idx} delay={idx * 0.04}>
                  <div className="border-b border-[#110508]/10">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 py-5 text-left"
                    >
                      <span className="text-sm font-semibold text-[#110508] leading-snug">{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#FD1843]' : 'text-[#110508]/30'
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="pb-6 text-sm text-[#110508]/55 leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </section>

        {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
        <section className="border-t border-[#110508]/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
            <FadeIn>
              <h2 className="text-[2.5rem] sm:text-[4rem] lg:text-[5rem] font-bold tracking-[-0.025em] text-[#110508] leading-[0.95] mb-8">
                Start building<br />
                <span className="text-[#FD1843]">real things.</span>
              </h2>
              <p className="text-sm sm:text-base text-[#110508]/52 max-w-md mb-10 leading-relaxed">
                Free to start. Access roadmaps, study notes, and developer tools without a payment card.
              </p>
              <div className="flex items-center gap-5 flex-wrap">
                <a
                  href="/roadmaps"
                  onClick={(e) => { e.preventDefault(); openAuthModal('signup'); }}
                  className="inline-flex items-center gap-2 bg-[#FD1843] text-[#FFF9FA] px-8 py-4 text-sm font-semibold hover:bg-[#E5102F] transition-colors"
                  aria-label="Create a free account"
                >
                  Get started for free
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="/roadmaps"
                  onClick={(e) => { e.preventDefault(); setCurrentView('learning-paths'); }}
                  className="text-sm font-semibold text-[#110508] underline underline-offset-4 decoration-[#110508]/20 hover:text-[#FD1843] hover:decoration-[#FD1843]/50 transition-colors"
                  aria-label="Browse all roadmaps"
                >
                  Browse roadmaps
                </a>
              </div>
            </FadeIn>
          </div>
        </section>

      </div>
    </MotionConfig>
  );
};
