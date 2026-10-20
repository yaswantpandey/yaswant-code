import React from 'react';
import { useLms } from '../context/LmsContext';
import { ActiveView } from '../types/lms';
import {
  Sparkles,
  ArrowRight,
  FolderGit2,
  FileText,
  Wrench,
  MessageSquare,
  DownloadCloud,
  BookMarked,
  User,
  type LucideIcon,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { tokenStorage } from '../services/api';
import { ALL_ROADMAP_TRACKS } from '../data/fullstackRoadmap';

const HUB_LINKS: { view: ActiveView; title: string; desc: string; icon: LucideIcon; accent: string }[] = [
  { view: 'learning-paths', title: 'Roadmaps', desc: 'Step-by-step career tracks from fundamentals to production.', icon: Sparkles, accent: 'text-amber-400' },
  { view: 'projects', title: 'Projects', desc: 'Hands-on capstones with starter repos and reviews.', icon: FolderGit2, accent: 'text-emerald-400' },
  { view: 'notes', title: 'Study Notes', desc: 'Architecture guides, cheat sheets and code snippets.', icon: FileText, accent: 'text-brand-400' },
  { view: 'tools', title: 'Developer Tools', desc: 'JSON, Regex, JWT, Cron and more in your browser.', icon: Wrench, accent: 'text-brand-400' },
  { view: 'community', title: 'Community', desc: 'Ask questions and review designs with peers.', icon: MessageSquare, accent: 'text-rose-400' },
  { view: 'resources', title: 'Free Resources', desc: 'Blueprints, templates and starter kits.', icon: DownloadCloud, accent: 'text-emerald-400' },
  { view: 'blog', title: 'Engineering Blog', desc: 'Deep dives on systems, AI and frontend.', icon: BookMarked, accent: 'text-brand-400' },
  { view: 'student-profile', title: 'My Profile', desc: 'Your skills, activity and showcase projects.', icon: User, accent: 'text-brand-400' },
];

export const StudentDashboardPage: React.FC = () => {
  const { setCurrentView } = useLms();

  const currentUser = tokenStorage.getUser<{ name?: string; email?: string }>();
  const studentFirstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Engineer';
  const featuredTrack = ALL_ROADMAP_TRACKS[0];

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
            Pick up a roadmap, build a project, or explore the tools and notes below.
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
            onClick={() => setCurrentView('projects')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            Browse Projects
          </Button>
        </div>
      </div>

      {/* 2. Featured roadmap */}
      {featuredTrack && (
        <GlassCard className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Recommended next step</div>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-white mb-1">{featuredTrack.title}</h2>
            <p className="text-sm text-neutral-500 max-w-xl">{featuredTrack.subtitle}</p>
            <p className="text-xs text-neutral-400 mt-2">{featuredTrack.stages.length} sequential stages</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setCurrentView('learning-paths')}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Open Roadmap
          </Button>
        </GlassCard>
      )}

      {/* 3. Quick access */}
      <div>
        <h2 className="text-lg font-bold text-neutral-950 dark:text-white mb-4">Your workspace</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HUB_LINKS.map(({ view, title, desc, icon: Icon, accent }) => (
            <GlassCard
              key={view}
              hoverEffect
              className="p-5 cursor-pointer group"
              onClick={() => setCurrentView(view)}
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:-rotate-6">
                <Icon className={`w-5 h-5 ${accent}`} />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
                {title}
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>

    </div>
  );
};
