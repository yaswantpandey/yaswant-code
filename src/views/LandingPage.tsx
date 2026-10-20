import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useLms } from '../context/LmsContext';
import { PRIMARY_INSTRUCTOR } from '../config/brand';
import { ALL_ROADMAP_TRACKS } from '../data/fullstackRoadmap';
import { ArrowRight, ArrowUpRight, ChevronDown, Compass, FolderGit2, FileText, Wrench } from 'lucide-react';
import { injectSchema, buildFAQSchema } from '../services/seo';
import { syncUrlWithView } from '../services/router';
import type { ActiveView } from '../types/lms';

const EASE = [0.22, 1, 0.36, 1] as const;

const FadeIn: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className, delay = 0,
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.55, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

const SectionHeading: React.FC<{ eyebrow: string; title: React.ReactNode; body?: string; invert?: boolean }> = ({
  eyebrow, title, body, invert,
}) => (
  <FadeIn className="max-w-2xl mb-12 sm:mb-14">
    <p className={`eyebrow mb-4 ${invert ? '!text-brand-300' : ''}`}>{eyebrow}</p>
    <h2 className={`text-3xl sm:text-[2.5rem] font-bold tracking-[-0.025em] leading-[1.08] ${invert ? 'text-neutral-50' : 'text-ink'}`}>
      {title}
    </h2>
    {body && (
      <p className={`mt-4 text-base leading-relaxed ${invert ? 'text-neutral-300' : 'text-ink-2'}`}>{body}</p>
    )}
  </FadeIn>
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
  const totalTopics = ALL_ROADMAP_TRACKS.reduce(
    (n, t) => n + t.stages.reduce((m, s) => m + s.topics.length, 0), 0,
  );
  const featured = ALL_ROADMAP_TRACKS[0];
  const featuredHours = featured.stages.reduce(
    (n, s) => n + s.topics.reduce((m, t) => m + t.estimatedHours, 0), 0,
  );

  // Open one specific roadmap: put its slug in the URL, then let LmsContext's
  // popstate handler resolve view + slug exactly as it does for back/forward.
  const openTrack = (slug: string) => {
    syncUrlWithView('learning-paths', false, slug);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0 });
  };

  const go = (view: ActiveView) => (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentView(view);
  };

  const pillars: { icon: typeof Compass; title: string; body: string; view: ActiveView; href: string; cta: string }[] = [
    {
      icon: Compass,
      title: 'Sequential roadmaps',
      body: 'Ordered paths built around real hiring criteria. Each stage builds directly on the last, with progress you can track.',
      view: 'learning-paths', href: '/roadmaps', cta: 'Browse roadmaps',
    },
    {
      icon: FolderGit2,
      title: 'Real codebase projects',
      body: 'Build a distributed cache, a fintech microservice, an LLM agent pipeline. Submit via GitHub for instructor review.',
      view: 'projects', href: '/projects', cta: 'See projects',
    },
    {
      icon: FileText,
      title: 'Study notes',
      body: 'Dense, engineering-grade reference material and university notes — written for practitioners, free to download.',
      view: 'notes', href: '/notes', cta: 'Read notes',
    },
    {
      icon: Wrench,
      title: 'Developer toolkit',
      body: 'JSON formatter, regex tester, JWT decoder, cron builder and ready-made dev environments. No account required.',
      view: 'tools', href: '/tools', cta: 'Open tools',
    },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full overflow-x-hidden">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="container-page pt-14 pb-20 sm:pt-20 sm:pb-28">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-14 xl:gap-20 items-center">

            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2 mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                {ALL_ROADMAP_TRACKS.length} career roadmaps · updated for 2026
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
                className="text-[2.75rem] sm:text-6xl lg:text-[4.5rem] xl:text-[5.25rem] font-bold tracking-[-0.035em] leading-[0.95] text-ink"
              >
                Architect the future <span className="text-accent">of software.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
                className="mt-7 text-lg text-ink-2 max-w-[34rem] leading-relaxed"
              >
                Step-by-step engineering roadmaps, production-grade projects and developer
                tools — built for engineers who ship real systems.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                <a
                  href="/roadmaps"
                  onClick={(e) => { e.preventDefault(); openAuthModal('signup'); }}
                  className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-brand text-on-brand text-sm font-semibold shadow-sm shadow-brand/25 hover:bg-brand-hover transition-colors"
                >
                  Start learning free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a
                  href="/roadmaps"
                  onClick={go('learning-paths')}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-line bg-surface text-sm font-semibold text-ink hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                >
                  View roadmaps
                </a>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-6 text-sm text-ink-3"
              >
                Free to start · No payment card · Join 140k+ engineers
              </motion.p>
            </div>

            {/* Roadmap preview — the real Full Stack track, not decoration */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            >
              <div className="rounded-2xl border border-line bg-surface shadow-xl shadow-neutral-950/[0.04] dark:shadow-none">
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-line">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{featured.title}</p>
                    <p className="text-xs text-ink-3 mt-0.5">
                      {featured.stages.length} stages · ~{featuredHours}h of material
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-accent bg-brand/10 rounded-full px-2.5 py-1">
                    {featured.badge}
                  </span>
                </div>

                <ol className="px-5 py-4">
                  {featured.stages.slice(0, 6).map((stage, i) => (
                    <li key={stage.id} className="relative flex gap-4 pb-4 last:pb-0">
                      {i < 5 && (
                        <span aria-hidden className="absolute left-[11px] top-7 bottom-0 w-px bg-line" />
                      )}
                      <span
                        className={`relative z-10 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold ${
                          i === 0
                            ? 'bg-brand text-on-brand'
                            : 'border border-line bg-paper text-ink-3'
                        }`}
                      >
                        {stage.stepNumber}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className={`text-sm font-medium truncate ${i === 0 ? 'text-ink' : 'text-ink-2'}`}>
                          {stage.title}
                        </p>
                        <p className="text-xs text-ink-3 mt-0.5">{stage.topics.length} topics</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <button
                  onClick={() => openTrack(featured.slug)}
                  className="group w-full flex items-center justify-between px-5 py-3.5 border-t border-line text-sm font-semibold text-accent hover:bg-surface-2 rounded-b-2xl transition-colors"
                >
                  Open the full roadmap
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl border border-line bg-line overflow-hidden"
          >
            {[
              { val: String(ALL_ROADMAP_TRACKS.length), label: 'Career roadmaps' },
              { val: String(totalStages), label: 'Sequential stages' },
              { val: String(totalTopics), label: 'Guided topics' },
              { val: `${PRIMARY_INSTRUCTOR.rating.toFixed(1)}`, label: 'Instructor rating' },
            ].map(({ val, label }) => (
              <div key={label} className="bg-paper px-5 py-6 sm:px-6">
                <dt className="text-xs text-ink-3">{label}</dt>
                <dd className="mt-1 text-3xl font-bold tracking-tight text-ink tabular-nums">{val}</dd>
              </div>
            ))}
          </motion.dl>
        </section>

        {/* ── WHAT YOU GET ──────────────────────────────────────────── */}
        <section className="container-page pb-20 sm:pb-28">
          <SectionHeading
            eyebrow="The platform"
            title={<>Production engineering,<br className="hidden sm:block" /> not toy projects.</>}
            body="Four tools that work together: follow a roadmap, build the project, look things up in the notes, and keep the toolkit open in another tab."
          />

          <div className="grid sm:grid-cols-2 gap-4">
            {pillars.map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={item.title} delay={i * 0.05}>
                  <a
                    href={item.href}
                    onClick={go(item.view)}
                    className="group flex flex-col h-full rounded-xl border border-line bg-surface p-6 sm:p-7 hover:border-brand/40 transition-colors"
                  >
                    <span className="w-10 h-10 rounded-lg bg-brand/10 text-accent flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm text-ink-2 leading-relaxed flex-1">{item.body}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      {item.cta}
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </a>
                </FadeIn>
              );
            })}
          </div>
        </section>

        {/* ── TRACKS ────────────────────────────────────────────────── */}
        <section className="bg-neutral-950 dark:bg-neutral-900 dark:border-y dark:border-line" aria-label="Career roadmap tracks">
          <div className="container-page py-20 sm:py-28">
            <SectionHeading
              invert
              eyebrow="Career tracks"
              title={<>{ALL_ROADMAP_TRACKS.length} tracks. One platform.</>}
              body="Each one a complete career roadmap — from fundamentals to production — not a beginner course."
            />

            <div className="grid md:grid-cols-2 gap-4">
              {ALL_ROADMAP_TRACKS.map((track, i) => (
                <FadeIn key={track.id} delay={i * 0.05}>
                  <button
                    onClick={() => openTrack(track.slug)}
                    className="group w-full h-full text-left rounded-xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 hover:border-brand/60 hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-mono text-xs text-neutral-500">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] font-medium text-brand-300 border border-brand-300/30 rounded-full px-2.5 py-0.5">
                        {track.badge}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-neutral-50">{track.title}</h3>
                    <p className="mt-2 text-sm text-neutral-400 leading-relaxed line-clamp-2">
                      {track.subtitle || track.description}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {track.stages.slice(0, 3).map((s) => (
                        <li key={s.id} className="text-xs text-neutral-300 bg-white/[0.06] rounded-md px-2 py-1">
                          {s.title}
                        </li>
                      ))}
                      {track.stages.length > 3 && (
                        <li className="text-xs text-neutral-500 px-1 py-1">+{track.stages.length - 3} more</li>
                      )}
                    </ul>
                    <span className="mt-6 flex items-center justify-between text-sm">
                      <span className="text-neutral-500">{track.stages.length} stages</span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-neutral-50 group-hover:text-brand-300 transition-colors">
                        View roadmap <ArrowRight className="w-4 h-4" />
                      </span>
                    </span>
                  </button>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── INSTRUCTOR ────────────────────────────────────────────── */}
        <section className="container-page py-20 sm:py-28">
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-12 lg:gap-24">
            <FadeIn>
              <p className="eyebrow mb-4">Lead instructor</p>
              <h2 className="text-3xl sm:text-[2.5rem] font-bold tracking-[-0.025em] text-ink leading-[1.08]">
                {PRIMARY_INSTRUCTOR.name}
              </h2>
              <p className="mt-1 text-sm text-ink-3">{PRIMARY_INSTRUCTOR.role}</p>
              <p className="mt-6 text-base text-ink-2 leading-relaxed">{PRIMARY_INSTRUCTOR.bio}</p>
              <p className="mt-4 text-base text-ink-2 leading-relaxed">
                Yaswant Code was built to bridge the gap between academic tutorials and
                production engineering. Every roadmap is designed around real systems used at
                top technology companies.
              </p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {PRIMARY_INSTRUCTOR.expertise.map((skill) => (
                  <li key={skill} className="text-xs text-ink-2 border border-line bg-surface rounded-md px-2.5 py-1">
                    {skill}
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.1} className="lg:pt-10">
              <dl className="rounded-xl border border-line bg-surface divide-y divide-line">
                {[
                  { label: 'Instructor rating', value: `${PRIMARY_INSTRUCTOR.rating.toFixed(1)} / 5.0`, accent: true },
                  { label: 'Students mentored', value: `${PRIMARY_INSTRUCTOR.studentsCount.toLocaleString()}+` },
                  { label: 'Reviews', value: String(PRIMARY_INSTRUCTOR.reviewsCount) },
                  { label: 'Career tracks authored', value: String(ALL_ROADMAP_TRACKS.length) },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="flex items-center justify-between px-6 py-5">
                    <dt className="text-sm text-ink-2">{label}</dt>
                    <dd className={`text-lg font-semibold tabular-nums ${accent ? 'text-accent' : 'text-ink'}`}>{value}</dd>
                  </div>
                ))}
              </dl>
            </FadeIn>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <section
          className="container-page pb-20 sm:pb-28"
          aria-label="Frequently asked questions about Yaswant Code"
        >
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-10 lg:gap-24">
            <FadeIn>
              <p className="eyebrow mb-4">FAQ</p>
              <h2 className="text-3xl sm:text-[2.5rem] font-bold tracking-[-0.025em] text-ink leading-[1.08]">
                Common questions.
              </h2>
            </FadeIn>

            <div className="border-t border-line">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="border-b border-line">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                    >
                      <span className="text-base font-semibold text-ink group-hover:text-accent transition-colors">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-accent' : 'text-ink-3'
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
                          <p className="pb-6 pr-8 text-sm sm:text-base text-ink-2 leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
        <section className="container-page">
          <FadeIn>
            <div className="relative overflow-hidden rounded-2xl bg-brand px-6 py-14 sm:px-14 sm:py-20">
              <div aria-hidden className="absolute -right-24 -top-24 w-80 h-80 rounded-full border-[48px] border-white/10" />
              <h2 className="relative text-4xl sm:text-6xl font-bold tracking-[-0.035em] text-on-brand leading-[0.98] max-w-2xl">
                Start building real things.
              </h2>
              <p className="relative mt-5 text-base sm:text-lg text-on-brand/80 max-w-md leading-relaxed">
                Free to start. Roadmaps, study notes and developer tools — no payment card.
              </p>
              <div className="relative mt-10 flex flex-wrap items-center gap-3">
                <a
                  href="/roadmaps"
                  onClick={(e) => { e.preventDefault(); openAuthModal('signup'); }}
                  className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-neutral-950 text-sm font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Get started for free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a
                  href="/roadmaps"
                  onClick={go('learning-paths')}
                  className="inline-flex items-center h-12 px-6 rounded-lg border border-white/30 text-on-brand text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  Browse roadmaps
                </a>
              </div>
            </div>
          </FadeIn>
        </section>

      </div>
    </MotionConfig>
  );
};
