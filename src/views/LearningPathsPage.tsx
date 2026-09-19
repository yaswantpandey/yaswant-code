import React, { useState, useEffect, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { 
  TECH_ROADMAPS, 
  TechRoadmap, 
  MindTreeNode, 
  MindTreeBranch,
  RoadmapMilestone 
} from '../config/roadmaps';
import { 
  GitBranch, 
  Layers, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  Award, 
  ChevronRight, 
  Search, 
  ShieldCheck, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Wrench, 
  ExternalLink,
  Code2,
  Terminal,
  Zap,
  Globe,
  Shield,
  CloudCog,
  BrainCircuit,
  Layout,
  Server,
  Database,
  Cpu,
  Eye,
  Bot,
  Filter,
  RefreshCw,
  TrendingUp,
  X,
  Target
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

// Icon mapper for tech tracks and branches
const renderTrackIcon = (iconName: string, className = "w-5 h-5") => {
  switch (iconName) {
    case 'Globe': return <Globe className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'CloudCog': return <CloudCog className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'BrainCircuit': return <BrainCircuit className={className} />;
    case 'Layout': return <Layout className={className} />;
    case 'Server': return <Server className={className} />;
    case 'Database': return <Database className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Terminal': return <Terminal className={className} />;
    case 'Eye': return <Eye className={className} />;
    case 'Bot': return <Bot className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export const LearningPathsPage: React.FC = () => {
  const { setCurrentView, setSelectedCourse, courses, addToast } = useLms();

  // Active track selection
  const [selectedTrackId, setSelectedTrackId] = useState<string>(TECH_ROADMAPS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeViewMode, setActiveViewMode] = useState<'mindtree' | 'roadmap' | 'checklist'>('mindtree');
  
  // Selected Node modal state
  const [inspectingNode, setInspectingNode] = useState<{ node: MindTreeNode; branchTitle: string } | null>(null);

  // LocalStorage persistence for user skills progress
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yaswant_completed_skills');
      return saved ? JSON.parse(saved) : ['web-ts-strict', 'sec-networking', 'auto-python-core'];
    } catch {
      return ['web-ts-strict'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('yaswant_completed_skills', JSON.stringify(completedNodeIds));
    } catch (e) {
      console.error('Failed to save skills to localStorage', e);
    }
  }, [completedNodeIds]);

  const toggleNodeCompletion = (nodeId: string) => {
    setCompletedNodeIds(prev => {
      const exists = prev.includes(nodeId);
      const updated = exists ? prev.filter(id => id !== nodeId) : [...prev, nodeId];
      if (!exists) {
        addToast("Skill Mastered! 🎯", "Progress updated in your learning portfolio.", "success");
      }
      return updated;
    });
  };

  // Find active track
  const currentTrack: TechRoadmap = useMemo(() => {
    return TECH_ROADMAPS.find(r => r.id === selectedTrackId) || TECH_ROADMAPS[0];
  }, [selectedTrackId]);

  // Calculate track progress
  const trackStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    currentTrack.mindtree.forEach(branch => {
      branch.nodes.forEach(node => {
        total++;
        if (completedNodeIds.includes(node.id)) completed++;
      });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [currentTrack, completedNodeIds]);

  // Filtered tracks for category selector
  const visibleTracks = useMemo(() => {
    if (selectedCategory === 'all') return TECH_ROADMAPS;
    return TECH_ROADMAPS.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* ── Page Hero Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono tracking-wide">
            <GitBranch className="w-3.5 h-3.5" />
            TECH UPSKILL ROADMAP & MINDTREE ENGINE
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight leading-none">
            Interactive Career Roadmaps
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Step-by-step learning trees, knowledge node graphs, and milestone checkpoints for modern software engineering, cyber security, cloud native DevOps, and AI systems.
          </p>
        </div>

        {/* Career Readiness Meter */}
        <div className="shrink-0 p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 min-w-[240px]">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-300 dark:text-neutral-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-600 dark:text-indigo-400 transition-all duration-500"
                strokeDasharray={`${trackStats.percent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-bold font-mono text-neutral-900 dark:text-white">
              {trackStats.percent}%
            </span>
          </div>
          <div>
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
              Track Progress
            </div>
            <div className="text-sm font-bold text-neutral-900 dark:text-white">
              {trackStats.completed} of {trackStats.total} Mastered
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {trackStats.percent >= 80 ? '🎯 Job & Interview Ready' : 'In Active Upskilling'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Filters & Search ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: 'All Technologies' },
            { id: 'web', label: 'Web Dev' },
            { id: 'security', label: 'Cyber Security' },
            { id: 'cloud', label: 'Cloud & DevOps' },
            { id: 'automation', label: 'Automation & RPA' },
            { id: 'ai', label: 'Generative AI' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveViewMode('mindtree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeViewMode === 'mindtree'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
            Mind Tree
          </button>

          <button
            onClick={() => setActiveViewMode('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeViewMode === 'roadmap'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            Milestones
          </button>

          <button
            onClick={() => setActiveViewMode('checklist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeViewMode === 'checklist'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Checklist
          </button>
        </div>
      </div>

      {/* ── Track Selector Cards Carousel ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {visibleTracks.map((track) => {
          const isSelected = track.id === selectedTrackId;
          const completedCount = track.mindtree.reduce((acc, b) => {
            return acc + b.nodes.filter(n => completedNodeIds.includes(n.id)).length;
          }, 0);
          const percent = Math.round((completedCount / track.totalTopics) * 100);

          return (
            <div
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              className={`group p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-neutral-900 text-white dark:bg-neutral-900 border-neutral-950 dark:border-white shadow-xl ring-1 ring-neutral-900 dark:ring-white'
                  : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-900 dark:text-neutral-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white/10 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}>
                    {renderTrackIcon(track.iconName, "w-4 h-4")}
                  </div>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                  }`}>
                    {track.duration}
                  </span>
                </div>

                <h3 className="text-sm font-bold tracking-tight mb-1 line-clamp-1">
                  {track.title}
                </h3>
                <p className={`text-[11px] line-clamp-2 leading-relaxed mb-3 ${
                  isSelected ? 'text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'
                }`}>
                  {track.tagline}
                </p>
              </div>

              {/* Progress mini bar */}
              <div className="pt-2 border-t border-neutral-200/50 dark:border-neutral-800/80">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className={isSelected ? 'text-neutral-300' : 'text-neutral-400'}>
                    {completedCount}/{track.totalTopics} Skills
                  </span>
                  <span className={isSelected ? 'text-white font-bold' : 'text-neutral-600 dark:text-neutral-300 font-bold'}>
                    {percent}%
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Active Track Hero Banner ─────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white border border-neutral-800 shadow-2xl relative overflow-hidden space-y-6">
        {/* Glow ambient background */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="purple" size="sm">
                {currentTrack.categoryLabel}
              </Badge>
              <Badge variant="neutral" size="sm">
                {currentTrack.difficulty} Level
              </Badge>
              <span className="text-xs font-mono text-neutral-400">
                • {currentTrack.weeklyCommitment}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              {renderTrackIcon(currentTrack.iconName, "w-8 h-8 text-indigo-400")}
              {currentTrack.title}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {currentTrack.description}
            </p>

            {/* Career Target Roles */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 font-semibold flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-400" /> Target Roles:
              </span>
              {currentTrack.careerRoles.map((role, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-lg bg-neutral-800/80 border border-neutral-700/60 text-neutral-300 text-[11px] font-mono">
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <div className="p-3.5 rounded-2xl bg-neutral-800/70 border border-neutral-700/60 text-center sm:text-left">
              <div className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                Salary Benchmark
              </div>
              <div className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                {currentTrack.salaryBenchmark}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center bg-white text-neutral-950 hover:bg-neutral-100 font-bold"
                onClick={() => {
                  addToast("Track Enrolled", `You are now enrolled in the ${currentTrack.title} track!`, "success");
                }}
              >
                Enroll in Track Free
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── VIEW 1: INTERACTIVE MIND TREE VIEW ───────────────────────────── */}
      {activeViewMode === 'mindtree' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-500" />
                Branching Mind Tree Hierarchy
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Click on any node to view concepts, practical projects, essential CLI tools, and toggle mastery status.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-neutral-500 hidden sm:flex">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Mastered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" /> To Learn
              </span>
            </div>
          </div>

          {/* Root to Branch Visual Tree */}
          <div className="space-y-10">
            {currentTrack.mindtree.map((branch, branchIdx) => (
              <div 
                key={branch.id} 
                className="p-5 sm:p-7 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-5 relative"
              >
                {/* Branch Header Pillar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-500 text-white font-black flex items-center justify-center shadow-md shadow-indigo-500/20 text-sm">
                      P{branch.phaseNumber}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
                        {branch.title}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {branch.tagline}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-xl bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 self-start sm:self-auto">
                    ~{branch.estimatedWeeks} Weeks
                  </span>
                </div>

                {/* Leaves / Topic Nodes in Branch */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {branch.nodes.map((node) => {
                    const isDone = completedNodeIds.includes(node.id);

                    return (
                      <div
                        key={node.id}
                        onClick={() => setInspectingNode({ node, branchTitle: branch.title })}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                          isDone
                            ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500'
                            : 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-750 hover:border-indigo-500 dark:hover:border-indigo-400 shadow-xs'
                        }`}
                      >
                        <div>
                          {/* Node Header */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                              {node.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                node.level === 'Beginner'
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                  : node.level === 'Intermediate'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                              }`}>
                                {node.level}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleNodeCompletion(node.id);
                                }}
                                className="p-1 text-neutral-400 hover:text-emerald-500 transition-colors"
                                title={isDone ? "Mark as uncompleted" : "Mark as mastered"}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <h5 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {node.title}
                          </h5>

                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                            {node.description}
                          </p>
                        </div>

                        {/* Node Footer: Tools & Hours */}
                        <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                          <span className="font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {node.estimatedHours} hrs
                          </span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline flex items-center gap-0.5">
                            Inspect node <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VIEW 2: STEP-BY-STEP ROADMAP TIMELINE ────────────────────────── */}
      {activeViewMode === 'roadmap' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              Chronological Roadmap Milestones
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Structured milestone progression with clear learning objectives, checkpoint deliverables, and portfolio projects.
            </p>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:content-[''] before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
            {currentTrack.milestones.map((milestone, idx) => (
              <div key={idx} className="relative group">
                {/* Node indicator */}
                <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-white dark:bg-neutral-900 border-2 border-indigo-500 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
                  {milestone.phase}
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple" size="sm">
                        Phase {milestone.phase}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {milestone.level}
                      </Badge>
                      <span className="text-xs font-mono text-neutral-400">
                        • {milestone.duration}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      Milestone Checkpoint
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                      {milestone.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>

                  {/* Checkpoint Deliverable Box */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750 text-xs">
                    <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      📦 Expected Phase Deliverable:
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {milestone.deliverable}
                    </span>
                  </div>

                  {/* Skills & Checkpoint Projects */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[11px] font-mono text-neutral-400 font-bold block mb-1.5 uppercase">
                        Core Competencies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {milestone.keySkills.map((skill, sIdx) => (
                          <span key={sIdx} className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-neutral-400 font-bold block mb-1.5 uppercase">
                        Portfolio Checkpoints
                      </span>
                      <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                        {milestone.checkpointProjects.map((proj, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span>{proj}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VIEW 3: UPSKILL CHECKLIST & READINESS SCORE ──────────────────── */}
      {activeViewMode === 'checklist' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-neutral-900 text-white border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold">Interactive Skills Inventory</h3>
              <p className="text-xs text-neutral-400">
                Track and check off each specific technology node. Status is stored securely on your browser.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCompletedNodeIds([]);
                addToast("Checklist Reset", "All skills marked as to-learn.", "info");
              }}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              className="border-neutral-700 text-neutral-300 hover:text-white"
            >
              Reset Track Progress
            </Button>
          </div>

          <div className="space-y-4">
            {currentTrack.mindtree.map(branch => (
              <div key={branch.id} className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="text-xs font-bold font-mono text-neutral-400 uppercase">
                  Phase {branch.phaseNumber}: {branch.title}
                </div>

                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {branch.nodes.map(node => {
                    const isDone = completedNodeIds.includes(node.id);

                    return (
                      <div 
                        key={node.id} 
                        className="py-3 flex items-start justify-between gap-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-850/50 px-2 rounded-xl transition-colors"
                        onClick={() => toggleNodeCompletion(node.id)}
                      >
                        <div className="flex items-start gap-3">
                          <button 
                            className="mt-0.5 text-neutral-400 hover:text-emerald-500 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNodeCompletion(node.id);
                            }}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                            ) : (
                              <Circle className="w-5 h-5 text-neutral-400" />
                            )}
                          </button>
                          <div>
                            <div className={`text-sm font-bold ${isDone ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>
                              {node.title}
                            </div>
                            <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                              {node.description}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
                            {node.estimatedHours} hrs
                          </span>
                          <Badge variant={isDone ? 'emerald' : 'neutral'} size="sm">
                            {isDone ? 'Mastered' : 'To Learn'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Related LMS Resources & Tools ─────────────────────────────────── */}
      <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-indigo-500" />
          Recommended Tools & Study Notes for this Roadmap
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => setCurrentView('notes')}
            className="p-5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-blue-500 transition-colors">
              Study Notes & Cheat Sheets
            </h4>
            <p className="text-xs text-neutral-500">
              Direct access to comprehensive PDF guides, Google Drive notes, and architecture blueprints.
            </p>
          </div>

          <div 
            onClick={() => setCurrentView('tools')}
            className="p-5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-amber-500 transition-colors">
              Developer Software Hub
            </h4>
            <p className="text-xs text-neutral-500">
              Download Docker Desktop, Wireshark, Burp Suite, VS Code, and Postman with 1-click downloads.
            </p>
          </div>

          <div 
            onClick={() => setCurrentView('courses')}
            className="p-5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-emerald-500 transition-colors">
              Full Video Masterclasses
            </h4>
            <p className="text-xs text-neutral-500">
              Explore in-depth interactive curriculum with live code editors and verifiable certificates.
            </p>
          </div>
        </div>
      </div>

      {/* ── MODAL: NODE DEEP DIVE INSPECTOR ───────────────────────────────── */}
      {inspectingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                  {inspectingNode.branchTitle} • {inspectingNode.node.category}
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                  {inspectingNode.node.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectingNode(null)}
                className="p-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {inspectingNode.node.description}
            </p>

            {/* Key Concepts */}
            <div>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block mb-2">
                Core Theoretical Concepts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {inspectingNode.node.concepts.map((concept, cIdx) => (
                  <span key={cIdx} className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono">
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Tools */}
            <div>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block mb-2">
                Essential Tools & Ecosystem
              </span>
              <div className="flex flex-wrap gap-1.5">
                {inspectingNode.node.tools.map((tool, tIdx) => (
                  <span key={tIdx} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Practical Project Challenge */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750 text-xs">
              <span className="font-bold text-neutral-800 dark:text-neutral-200 block mb-1">
                🔨 Practical Hands-On Exercise:
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {inspectingNode.node.projectIdea}
              </span>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <span className="font-mono text-neutral-400">
                Estimated: ~{inspectingNode.node.estimatedHours} hours
              </span>

              <button
                onClick={() => {
                  toggleNodeCompletion(inspectingNode.node.id);
                  setInspectingNode(null);
                }}
                className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  completedNodeIds.includes(inspectingNode.node.id)
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                }`}
              >
                {completedNodeIds.includes(inspectingNode.node.id)
                  ? 'Mark as To-Learn'
                  : '✓ Mark as Mastered'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
