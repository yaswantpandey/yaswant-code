import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { MOCK_CERTIFICATES, MOCK_COURSES } from '../data/mockData';
import { 
  User, 
  MapPin, 
  Github, 
  Globe, 
  Twitter, 
  Linkedin, 
  Flame, 
  Clock, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  ExternalLink, 
  Code2, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const StudentProfilePage: React.FC = () => {
  const { setCertificateModal, addToast } = useLms();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'certificates'>('overview');

  const skills = [
    { name: 'React 19 & Next.js 15', level: 'Advanced', verified: true },
    { name: 'TypeScript & Type Systems', level: 'Advanced', verified: true },
    { name: 'PostgreSQL & Prisma', level: 'Proficient', verified: true },
    { name: 'PyTorch & Fine-Tuning', level: 'Intermediate', verified: true },
    { name: 'Docker & CI/CD Pipelines', level: 'Proficient', verified: false }
  ];

  const projects = [
    {
      title: "Real-Time Collaborative Kanban Board",
      desc: "Full-stack project featuring optimistic mutations, distributed WebSockets, and Postgres rollback triggers.",
      tech: ['Next.js 15', 'React 19', 'PostgreSQL', 'Tailwind'],
      github: 'https://github.com/alexmercer/kanban-capstone',
      demo: 'https://kanban-demo.apex.io'
    },
    {
      title: "Autonomous Agent Multi-Turn Orchestrator",
      desc: "Local agentic pipeline using Gemini Flash with function calling, state rollback, and streaming UI.",
      tech: ['TypeScript', 'Gemini SDK', 'Node.js'],
      github: 'https://github.com/alexmercer/agent-runner',
      demo: 'https://agent-runner.demo'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Profile Header */}
      <GlassCard className="p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
            alt="Alex Mercer"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover ring-2 ring-neutral-300 dark:ring-neutral-700 shadow-xl"
          />

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="purple" size="sm">Verified Learner</Badge>
              <Badge variant="success" size="sm">Top 5% Performer</Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Alex Mercer
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              Software Engineer specializing in Distributed Frontends & Machine Learning Systems
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" /> San Francisco, CA
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-amber-500">
                <Flame className="w-3.5 h-3.5 fill-current" /> 19-Day Learning Streak
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" /> 84.5 Study Hours
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => addToast("Portfolio Link", "Copied public portfolio URL to clipboard.", "info")}
            >
              Share Portfolio
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Profile Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-8 text-xs sm:text-sm font-semibold">
        {(['overview', 'projects', 'certificates'] as const).map((tab) => (
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

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Verified Skills & Heatmap */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Verified Engineering Proficiencies
              </h3>
              <div className="space-y-3">
                {skills.map((s) => (
                  <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-750 text-xs">
                    <div className="flex items-center gap-2">
                      {s.verified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      <span className="font-semibold text-neutral-900 dark:text-white">{s.name}</span>
                    </div>
                    <Badge variant="neutral" size="sm">{s.level}</Badge>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Study Activity Streak Grid */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-400" /> Study Activity Log (Last 90 Days)
                </h3>
                <span className="text-xs text-emerald-500 font-semibold">142 total commits & lessons</span>
              </div>

              {/* Heatmap grid */}
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto py-2">
                {Array.from({ length: 140 }).map((_, i) => {
                  const intensity = i % 7 === 0 ? 0 : i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
                  const bg = 
                    intensity === 3 ? 'bg-emerald-500' :
                    intensity === 2 ? 'bg-emerald-600/70' :
                    intensity === 1 ? 'bg-emerald-800/40' :
                    'bg-neutral-100 dark:bg-neutral-800';

                  return (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-xs ${bg} transition-transform hover:scale-125`}
                      title={`Activity index ${i}`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-end gap-2 text-[10px] text-neutral-400 pt-2">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-neutral-200 dark:bg-neutral-800" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-800/40" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600/70" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span>More</span>
              </div>
            </GlassCard>
          </div>

          {/* Right Col: Quick Stats & Credentials */}
          <div className="space-y-6">
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Verified Credentials ({MOCK_CERTIFICATES.length})
              </h3>

              <div className="space-y-3">
                {MOCK_CERTIFICATES.map((cert) => (
                  <div
                    key={cert.id}
                    onClick={() => setCertificateModal(cert)}
                    className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-750 cursor-pointer hover:border-neutral-400 transition-colors"
                  >
                    <div className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
                      {cert.courseTitle}
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">
                      ID: {cert.credentialId}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

        </div>
      )}

      {/* Tab: Showcase Projects */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <GlassCard key={i} className="p-6 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
                  {p.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                  {p.desc}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Github className="w-3.5 h-3.5" />}
                  onClick={() => addToast("Source Code", `Redirecting to ${p.github}`, "info")}
                >
                  Code Repo
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                  onClick={() => addToast("Live Demo", `Launching preview for ${p.title}`, "info")}
                >
                  Live Demo
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Tab: Certificates */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_CERTIFICATES.map((cert) => (
            <GlassCard key={cert.id} className="p-6 flex items-center justify-between gap-4">
              <div>
                <Badge variant="success" size="sm" className="mb-2">Verified Honor</Badge>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">{cert.courseTitle}</h4>
                <div className="text-xs text-neutral-400 font-mono">Issued {cert.issueDate} • {cert.credentialId}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCertificateModal(cert)}>
                Inspect
              </Button>
            </GlassCard>
          ))}
        </div>
      )}

    </div>
  );
};
