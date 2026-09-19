import React, { useState, useEffect, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { 
  FULLSTACK_ROADMAP, 
  ALL_ROADMAP_TRACKS, 
  RoadmapTrack, 
  RoadmapStage, 
  RoadmapTopic 
} from '../data/fullstackRoadmap';
import { 
  Map, 
  GitBranch, 
  Layers, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Search, 
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
  Cpu, 
  Database, 
  Server, 
  Download, 
  Share2, 
  Check, 
  Copy, 
  RotateCcw, 
  X, 
  Target, 
  HelpCircle,
  Flame,
  ArrowDown,
  Layout
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { syncUrlWithView } from '../services/router';

export const LearningPathsPage: React.FC = () => {
  const { setCurrentView, addToast } = useLms();

  // Active track selection (default Full Stack, or detected from deep URL /roadmaps/:track)
  const [selectedTrackId, setSelectedTrackId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname.includes('/roadmaps/frontend')) return 'frontend';
      if (pathname.includes('/roadmaps/backend')) return 'backend';
      if (pathname.includes('/roadmaps/devops')) return 'devops';
      if (pathname.includes('/roadmaps/full-stack')) return 'full-stack';
    }
    return 'full-stack';
  });
  const [activeViewMode, setActiveViewMode] = useState<'flowchart' | 'milestones' | 'checklist'>('flowchart');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingTopic, setInspectingTopic] = useState<{ topic: RoadmapTopic; stageTitle: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Completed & In-Progress state stored in localStorage
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yaswant_completed_topics');
      return saved ? JSON.parse(saved) : ['how-internet-works', 'semantic-html'];
    } catch {
      return ['how-internet-works', 'semantic-html'];
    }
  });

  const [inProgressTopicIds, setInProgressTopicIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yaswant_inprogress_topics');
      return saved ? JSON.parse(saved) : ['modern-javascript', 'react-core'];
    } catch {
      return ['modern-javascript', 'react-core'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('yaswant_completed_topics', JSON.stringify(completedTopicIds));
    } catch (e) {
      console.error('Failed to save completed topics to localStorage', e);
    }
  }, [completedTopicIds]);

  useEffect(() => {
    try {
      localStorage.setItem('yaswant_inprogress_topics', JSON.stringify(inProgressTopicIds));
    } catch (e) {
      console.error('Failed to save in-progress topics to localStorage', e);
    }
  }, [inProgressTopicIds]);

  // Synchronize browser URL bar, title, meta tags, and schema with active roadmap track
  useEffect(() => {
    syncUrlWithView('learning-paths', null, false, selectedTrackId);
  }, [selectedTrackId]);

  // Handle browser Back / Forward navigation between roadmap tracks
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/roadmaps/frontend')) setSelectedTrackId('frontend');
      else if (path.includes('/roadmaps/backend')) setSelectedTrackId('backend');
      else if (path.includes('/roadmaps/devops')) setSelectedTrackId('devops');
      else if (path.includes('/roadmaps/full-stack') || path === '/roadmaps') setSelectedTrackId('full-stack');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Current active track object
  const currentTrack: RoadmapTrack = useMemo(() => {
    return ALL_ROADMAP_TRACKS.find(t => t.id === selectedTrackId) || FULLSTACK_ROADMAP;
  }, [selectedTrackId]);

  // Total topics count in current track
  const allTopicsInTrack = useMemo(() => {
    return currentTrack.stages.flatMap(s => s.topics);
  }, [currentTrack]);

  // Progress metrics
  const progressStats = useMemo(() => {
    const total = allTopicsInTrack.length;
    const completed = allTopicsInTrack.filter(t => completedTopicIds.includes(t.id)).length;
    const inProgress = allTopicsInTrack.filter(t => inProgressTopicIds.includes(t.id) && !completedTopicIds.includes(t.id)).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, percent };
  }, [allTopicsInTrack, completedTopicIds, inProgressTopicIds]);

  // Filter topics by status / recommendation
  const [nodeFilter, setNodeFilter] = useState<'all' | 'recommended' | 'mastered' | 'in-progress'>('all');

  // Filtered stages based on search and status filters
  const filteredStages = useMemo(() => {
    let stages = currentTrack.stages;

    if (nodeFilter === 'recommended') {
      stages = stages.map(stage => ({
        ...stage,
        topics: stage.topics.filter(t => t.type === 'recommended' || t.type === 'essential')
      }));
    } else if (nodeFilter === 'mastered') {
      stages = stages.map(stage => ({
        ...stage,
        topics: stage.topics.filter(t => completedTopicIds.includes(t.id))
      }));
    } else if (nodeFilter === 'in-progress') {
      stages = stages.map(stage => ({
        ...stage,
        topics: stage.topics.filter(t => inProgressTopicIds.includes(t.id) && !completedTopicIds.includes(t.id))
      }));
    }

    if (!searchQuery.trim()) {
      return stages.filter(stage => stage.topics.length > 0);
    }

    const q = searchQuery.toLowerCase();
    return stages
      .map(stage => ({
        ...stage,
        topics: stage.topics.filter(t => 
          t.title.toLowerCase().includes(q) || 
          t.description.toLowerCase().includes(q) ||
          t.whatToLearn.some(item => item.toLowerCase().includes(q))
        )
      }))
      .filter(stage => stage.topics.length > 0);
  }, [currentTrack, searchQuery, nodeFilter, completedTopicIds, inProgressTopicIds]);

  // Toggle status helper
  const setTopicStatus = (topicId: string, status: 'completed' | 'in-progress' | 'to-learn') => {
    if (status === 'completed') {
      setCompletedTopicIds(prev => prev.includes(topicId) ? prev : [...prev, topicId]);
      setInProgressTopicIds(prev => prev.filter(id => id !== topicId));
      addToast("Topic Mastered! 🎯", "Progress saved in your developer roadmap.", "success");
    } else if (status === 'in-progress') {
      setInProgressTopicIds(prev => prev.includes(topicId) ? prev : [...prev, topicId]);
      setCompletedTopicIds(prev => prev.filter(id => id !== topicId));
      addToast("Status Updated", "Marked as in-progress.", "info");
    } else {
      setCompletedTopicIds(prev => prev.filter(id => id !== topicId));
      setInProgressTopicIds(prev => prev.filter(id => id !== topicId));
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/roadmaps/${selectedTrackId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    addToast("Roadmap URL Copied", `${currentTrack.title} URL copied to your clipboard.`, "info");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* ── Top Header (Roadmap.sh signature style) ───────────────────────── */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 space-y-6">
        
        {/* Track Switcher Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {ALL_ROADMAP_TRACKS.map(track => (
              <button
                key={track.id}
                onClick={() => {
                  setSelectedTrackId(track.id);
                  syncUrlWithView('learning-paths', null, false, track.id);
                }}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  selectedTrackId === track.id
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {track.id === 'full-stack' && <Sparkles className="w-3.5 h-3.5 text-yellow-400" />}
                {track.id === 'frontend' && <Layout className="w-3.5 h-3.5 text-sky-400" />}
                {track.id === 'backend' && <Server className="w-3.5 h-3.5 text-emerald-400" />}
                {track.id === 'devops' && <Terminal className="w-3.5 h-3.5 text-purple-400" />}
                {track.title}
              </button>
            ))}
          </div>

          {/* Action Buttons: Download & Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-neutral-950 font-bold text-xs transition-colors cursor-pointer shadow-xs"
              title="Print or Save as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-medium text-xs transition-colors cursor-pointer"
              title="Share roadmap"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Title & Tagline Banner */}
        <div className="space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 dark:bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 text-xs font-bold font-mono tracking-wide">
            <Map className="w-3.5 h-3.5" />
            {currentTrack.badge.toUpperCase()} • 2026 EDITION
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight">
            {currentTrack.title}
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            {currentTrack.subtitle}. Follow the step-by-step flowchart below, click any topic to inspect core theoretical concepts and practice challenges, and track your progress to job readiness.
          </p>
        </div>

        {/* ── Learning Progress Tracker Meter ─────────────────────────────── */}
        <div className="p-5 rounded-2xl bg-neutral-100/90 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 text-neutral-950 font-black flex items-center justify-center text-sm shadow-sm">
                {progressStats.percent}%
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Your Roadmap Progress</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    {progressStats.completed} of {progressStats.total} Mastered
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  {progressStats.inProgress} topic(s) currently in-progress • {progressStats.total - progressStats.completed - progressStats.inProgress} remaining
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm("Reset your roadmap progress?")) {
                  setCompletedTopicIds([]);
                  setInProgressTopicIds([]);
                  addToast("Progress Reset", "All roadmap topics reset to learn.", "info");
                }
              }}
              className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 flex items-center gap-1 self-end sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Dual-color Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${(progressStats.completed / progressStats.total) * 100}%` }}
              title={`${progressStats.completed} Completed`}
            />
            <div 
              className="h-full bg-yellow-400 transition-all duration-500" 
              style={{ width: `${(progressStats.inProgress / progressStats.total) * 100}%` }}
              title={`${progressStats.inProgress} In Progress`}
            />
          </div>
        </div>

        {/* ── Toolbar: Search & View Mode Switcher ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search topics (e.g. Docker, React, PostgreSQL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-yellow-400/50"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveViewMode('flowchart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeViewMode === 'flowchart'
                  ? 'bg-yellow-400 text-neutral-950 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Flowchart
            </button>

            <button
              onClick={() => setActiveViewMode('milestones')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeViewMode === 'milestones'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Stages List
            </button>

            <button
              onClick={() => setActiveViewMode('checklist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeViewMode === 'checklist'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Checklist
            </button>
          </div>
        </div>

        {/* ── Signature Roadmap.sh Legend & Quick Filters ─────────────────── */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-[11px] font-mono">
          <span className="font-bold text-neutral-900 dark:text-white mr-1">Filter Nodes:</span>
          
          <button
            onClick={() => setNodeFilter('all')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
              nodeFilter === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All ({allTopicsInTrack.length})
          </button>

          <button
            onClick={() => setNodeFilter(nodeFilter === 'recommended' ? 'all' : 'recommended')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
              nodeFilter === 'recommended'
                ? 'bg-yellow-400 text-neutral-950 shadow-xs font-bold'
                : 'bg-yellow-400/15 text-yellow-700 dark:text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/25'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            Recommended
          </button>

          <button
            onClick={() => setNodeFilter(nodeFilter === 'mastered' ? 'all' : 'mastered')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
              nodeFilter === 'mastered'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Mastered ({progressStats.completed})
          </button>

          <button
            onClick={() => setNodeFilter(nodeFilter === 'in-progress' ? 'all' : 'in-progress')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
              nodeFilter === 'in-progress'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300'
            }`}
          >
            <Clock className="w-3 h-3 text-yellow-500" />
            In Progress ({progressStats.inProgress})
          </button>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════
           VIEW 1: SIGNATURE MIND TREE FLOWCHART (Compact Connected Nodes)
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeViewMode === 'flowchart' && (
        <div className="relative rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-4 sm:p-8 backdrop-blur-xs overflow-x-auto shadow-sm">
          
          {/* Canvas Dot Matrix Pattern */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, #a1a1aa 1.2px, transparent 1.2px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Canvas Interactive Helper Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-6 mb-4 border-b border-neutral-200/60 dark:border-neutral-800/60 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono font-medium">
                Interactive Mind Tree Graph • {filteredStages.flatMap(s => s.topics).length} Active Nodes
              </span>
            </div>
            <div className="text-[11px] font-mono text-neutral-400">
              Click any card for full architecture overview, checklist & docs
            </div>
          </div>

          {/* Empty Filter State */}
          {filteredStages.length === 0 && (
            <div className="relative z-10 py-16 text-center space-y-3">
              <p className="text-sm text-neutral-500">No nodes match your search or filter.</p>
              <button
                onClick={() => { setSearchQuery(''); setNodeFilter('all'); }}
                className="px-4 py-2 rounded-xl bg-yellow-400 text-neutral-950 font-bold text-xs cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Mind Tree Spine & Connected Stages */}
          <div className="relative z-10 flex flex-col items-center space-y-1 min-w-fit sm:min-w-0">
            {filteredStages.map((stage, stageIdx) => (
              <React.Fragment key={stage.id}>
                
                {/* ── STAGE CLUSTER ────────────────────────────────────────── */}
                <div className="flex flex-col items-center relative w-full max-w-5xl">
                  
                  {/* Stage Hub Root Node */}
                  <div className="relative z-20 flex flex-col items-center group">
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-extrabold text-xs sm:text-sm border-2 border-yellow-400 shadow-md hover:scale-105 transition-all">
                      <span className="w-5 h-5 rounded-full bg-yellow-400 text-neutral-950 font-black text-[10px] flex items-center justify-center">
                        {stage.stepNumber < 10 ? `0${stage.stepNumber}` : stage.stepNumber}
                      </span>
                      <span className="tracking-tight">{stage.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-neutral-800 text-yellow-400 dark:bg-neutral-200 dark:text-neutral-900 font-bold">
                        {stage.topics.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-md text-center line-clamp-1 px-2">
                      {stage.tagline}
                    </span>
                  </div>

                  {/* Central Trunk Stem from Stage Hub */}
                  <div className="w-0.5 h-6 bg-yellow-400 dark:bg-yellow-500 z-10" />

                  {/* Horizontal Branching Rail & Child Cards */}
                  <div className="relative w-full flex flex-col items-center">
                    
                    {/* Horizontal Branching Line (connects all child stems) */}
                    {stage.topics.length > 1 && (
                      <div className="relative w-full max-w-4xl px-8 sm:px-12 flex items-center justify-center">
                        <div className="h-0.5 bg-neutral-300 dark:bg-neutral-700 w-full" />
                      </div>
                    )}

                    {/* Connected Small Topic Cards */}
                    <div className="flex flex-wrap justify-center items-start gap-3 sm:gap-4.5 pt-0 w-full max-w-5xl">
                      {stage.topics.map((topic) => {
                        const isDone = completedTopicIds.includes(topic.id);
                        const isInProg = inProgressTopicIds.includes(topic.id) && !isDone;

                        return (
                          <div key={topic.id} className="flex flex-col items-center relative group">
                            {/* Vertical Drop Stem from Rail to Card */}
                            <div className="w-0.5 h-4 sm:h-5 bg-neutral-300 dark:bg-neutral-700 group-hover:bg-yellow-400 transition-colors" />

                            {/* Micro Connector Node Dot */}
                            <div className="w-2 h-2 rounded-full -my-1 z-10 bg-neutral-300 dark:bg-neutral-600 group-hover:bg-yellow-400 group-hover:scale-125 transition-all" />

                            {/* Compact Mind Tree Card ("Chhote Chhote Card") */}
                            <div
                              onClick={() => setInspectingTopic({ topic, stageTitle: stage.title })}
                              className={`w-36 sm:w-44 md:w-48 p-2.5 sm:p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none hover:-translate-y-1 hover:shadow-lg mt-1 text-left ${
                                isDone
                                  ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 shadow-xs shadow-emerald-500/20 ring-1 ring-emerald-500/30'
                                  : isInProg
                                  ? 'bg-yellow-400/10 dark:bg-yellow-400/15 border-yellow-400 shadow-xs shadow-yellow-400/20 ring-2 ring-yellow-400/20'
                                  : topic.type === 'recommended'
                                  ? 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-750 hover:border-yellow-400 dark:hover:border-yellow-400 shadow-xs'
                                  : topic.type === 'alternative'
                                  ? 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-750 hover:border-sky-400 dark:hover:border-sky-400 shadow-xs'
                                  : 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                              }`}
                            >
                              {/* Header: Type Badge & Status Toggle Check */}
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className={`text-[9px] font-black font-mono px-1.5 py-0.5 rounded tracking-wider uppercase ${
                                  topic.type === 'recommended'
                                    ? 'bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 border border-yellow-400/30'
                                    : topic.type === 'alternative'
                                    ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/20'
                                    : 'bg-neutral-200 dark:bg-neutral-750 text-neutral-600 dark:text-neutral-400'
                                }`}>
                                  {topic.type === 'recommended' ? 'REC' : topic.type === 'alternative' ? 'ALT' : 'CORE'}
                                </span>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isDone) setTopicStatus(topic.id, 'to-learn');
                                    else if (isInProg) setTopicStatus(topic.id, 'completed');
                                    else setTopicStatus(topic.id, 'in-progress');
                                  }}
                                  className="p-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                                  title={isDone ? "Status: Completed (Click to reset)" : isInProg ? "Status: In Progress (Click to complete)" : "Click to mark in-progress"}
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                                  ) : isInProg ? (
                                    <Clock className="w-4 h-4 text-yellow-500" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200" />
                                  )}
                                </button>
                              </div>

                              {/* Node Title */}
                              <div className="text-xs sm:text-[13px] font-extrabold text-neutral-900 dark:text-white leading-snug group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2 my-0.5">
                                {topic.title}
                              </div>

                              {/* Node Footer: Estimated Hours & Learn Link */}
                              <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-1.5 mt-1 border-t border-neutral-100 dark:border-neutral-800">
                                <span>~{topic.estimatedHours}h</span>
                                <span className="text-neutral-500 group-hover:text-yellow-500 font-sans font-semibold flex items-center gap-0.5">
                                  Guide <ChevronRight className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>

                </div>

                {/* ── INTER-STAGE SPINE CONNECTOR ─────────────────────────── */}
                {stageIdx < filteredStages.length - 1 && (
                  <div className="flex flex-col items-center my-3 sm:my-4 relative z-10">
                    <div className="w-0.5 h-6 sm:h-8 bg-neutral-300 dark:bg-neutral-750" />
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-neutral-900 border-2 border-yellow-400 flex items-center justify-center shadow-xs text-yellow-500 my-0.5">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-0.5 h-6 sm:h-8 bg-neutral-300 dark:bg-neutral-750" />
                  </div>
                )}

              </React.Fragment>
            ))}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           VIEW 2: STAGES & MILESTONES LIST VIEW
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeViewMode === 'milestones' && (
        <div className="space-y-6 animate-fade-in">
          {filteredStages.map((stage) => (
            <div 
              key={stage.id}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-yellow-400 text-neutral-950 font-black flex items-center justify-center text-xs">
                  {stage.stepNumber}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {stage.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {stage.topics.map(topic => (
                  <div 
                    key={topic.id}
                    onClick={() => setInspectingTopic({ topic, stageTitle: stage.title })}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-750 hover:border-yellow-400 transition-all cursor-pointer flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">
                          {topic.title}
                        </span>
                        <Badge variant={topic.type === 'recommended' ? 'purple' : 'neutral'} size="sm">
                          {topic.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {topic.description}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-400 font-mono shrink-0">
                      {topic.estimatedHours} hrs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           VIEW 3: CHECKLIST MODE (Fast Interactive Inventory)
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeViewMode === 'checklist' && (
        <div className="space-y-6 animate-fade-in">
          {filteredStages.map((stage) => (
            <div 
              key={stage.id}
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4"
            >
              <div className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-wider">
                Stage {stage.stepNumber}: {stage.title}
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {stage.topics.map((topic) => {
                  const isDone = completedTopicIds.includes(topic.id);

                  return (
                    <div 
                      key={topic.id}
                      onClick={() => setTopicStatus(topic.id, isDone ? 'to-learn' : 'completed')}
                      className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-850/50 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <button 
                          className="text-neutral-400 hover:text-emerald-500 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTopicStatus(topic.id, isDone ? 'to-learn' : 'completed');
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
                            {topic.title}
                          </div>
                          <div className="text-xs text-neutral-500 line-clamp-1">
                            {topic.description}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
                          {topic.estimatedHours} hrs
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
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           MODAL: TOPIC INSPECTOR & LEARNING GUIDE (Roadmap.sh detail drawer)
      ═══════════════════════════════════════════════════════════════════════ */}
      {inspectingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                  {inspectingTopic.stageTitle} • {inspectingTopic.topic.level}
                </span>
                <h3 className="text-xl font-extrabold text-neutral-950 dark:text-white mt-1">
                  {inspectingTopic.topic.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectingTopic(null)}
                className="p-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider font-mono">
                Overview & Architecture
              </span>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {inspectingTopic.topic.description}
              </p>
            </div>

            {/* What you need to learn (Key checklist) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider font-mono">
                What You Must Learn
              </span>
              <div className="space-y-1.5">
                {inspectingTopic.topic.whatToLearn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Coding Challenge */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750 space-y-1.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Hands-On Practice Challenge:
              </span>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {inspectingTopic.topic.practiceChallenge}
              </p>
            </div>

            {/* Official Docs Link */}
            {inspectingTopic.topic.officialDocs && (
              <a
                href={inspectingTopic.topic.officialDocs}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Official Documentation & Specifications <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono text-neutral-400">
                Estimated study time: ~{inspectingTopic.topic.estimatedHours} hours
              </span>

              <div className="flex items-center gap-2">
                {completedTopicIds.includes(inspectingTopic.topic.id) ? (
                  <button
                    onClick={() => {
                      setTopicStatus(inspectingTopic.topic.id, 'to-learn');
                      setInspectingTopic(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold cursor-pointer hover:bg-neutral-300"
                  >
                    Mark as To-Learn
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setTopicStatus(inspectingTopic.topic.id, 'in-progress');
                        setInspectingTopic(null);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 border border-yellow-400/30 text-xs font-bold cursor-pointer hover:bg-yellow-400/30"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => {
                        setTopicStatus(inspectingTopic.topic.id, 'completed');
                        setInspectingTopic(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Mastered
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
