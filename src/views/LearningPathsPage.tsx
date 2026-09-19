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

export const LearningPathsPage: React.FC = () => {
  const { setCurrentView, addToast } = useLms();

  // Active track selection (default Full Stack)
  const [selectedTrackId, setSelectedTrackId] = useState<string>('full-stack');
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

  // Filtered stages based on search
  const filteredStages = useMemo(() => {
    if (!searchQuery.trim()) return currentTrack.stages;
    const q = searchQuery.toLowerCase();
    return currentTrack.stages
      .map(stage => ({
        ...stage,
        topics: stage.topics.filter(t => 
          t.title.toLowerCase().includes(q) || 
          t.description.toLowerCase().includes(q) ||
          t.whatToLearn.some(item => item.toLowerCase().includes(q))
        )
      }))
      .filter(stage => stage.topics.length > 0);
  }, [currentTrack, searchQuery]);

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
    navigator.clipboard.writeText(window.location.origin + '/roadmaps');
    setCopiedLink(true);
    addToast("Roadmap URL Copied", "Link copied to your clipboard.", "info");
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
                onClick={() => setSelectedTrackId(track.id)}
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

        {/* ── Signature Roadmap.sh Legend ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
          <span className="font-bold text-neutral-900 dark:text-white">Legend:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-400/15 text-yellow-700 dark:text-yellow-400 border border-yellow-400/30 font-semibold">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            Personal Recommendation
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Alternative Option
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Mastered
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
            <Clock className="w-3 h-3 text-yellow-500" />
            In Progress
          </span>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════
           VIEW 1: SIGNATURE FLOWCHART VIEW (Roadmap.sh Style)
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeViewMode === 'flowchart' && (
        <div className="space-y-6 animate-fade-in relative">
          
          {filteredStages.map((stage, stageIdx) => (
            <React.Fragment key={stage.id}>
              {/* Connector between stages */}
              {stageIdx > 0 && (
                <div className="flex flex-col items-center justify-center my-2">
                  <div className="w-0.5 h-8 bg-neutral-300 dark:bg-neutral-750" />
                  <div className="w-5 h-5 rounded-full bg-white dark:bg-neutral-900 border-2 border-yellow-400 flex items-center justify-center -my-2.5 z-10 shadow-xs">
                    <ArrowDown className="w-3 h-3 text-yellow-500" />
                  </div>
                  <div className="w-0.5 h-8 bg-neutral-300 dark:bg-neutral-750" />
                </div>
              )}

              {/* Stage Card Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all space-y-6 relative overflow-hidden">
                
                {/* Stage Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-black flex items-center justify-center text-sm shadow-md">
                      {stage.stepNumber < 10 ? `0${stage.stepNumber}` : stage.stepNumber}
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                        {stage.title}
                      </h2>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {stage.tagline}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 self-start sm:self-auto">
                    {stage.topics.length} Key Topics
                  </span>
                </div>

                {/* Topics Flow Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {stage.topics.map((topic) => {
                    const isDone = completedTopicIds.includes(topic.id);
                    const isInProg = inProgressTopicIds.includes(topic.id) && !isDone;

                    return (
                      <div
                        key={topic.id}
                        onClick={() => setInspectingTopic({ topic, stageTitle: stage.title })}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group relative ${
                          isDone
                            ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/40 hover:border-emerald-500 shadow-xs'
                            : isInProg
                            ? 'bg-yellow-400/5 dark:bg-yellow-400/10 border-yellow-400/50 hover:border-yellow-400 shadow-xs'
                            : topic.type === 'recommended'
                            ? 'bg-neutral-50/50 dark:bg-neutral-850/50 border-neutral-200 dark:border-neutral-750 hover:border-yellow-400 dark:hover:border-yellow-400 hover:shadow-md'
                            : 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-800 hover:border-sky-400 dark:hover:border-sky-400'
                        }`}
                      >
                        <div className="space-y-2">
                          {/* Top Tag & Status */}
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              topic.type === 'recommended'
                                ? 'bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 border border-yellow-400/30'
                                : topic.type === 'alternative'
                                ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/20'
                                : 'bg-neutral-200 dark:bg-neutral-750 text-neutral-600 dark:text-neutral-300'
                            }`}>
                              {topic.type}
                            </span>

                            {/* Quick status toggle button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isDone) setTopicStatus(topic.id, 'to-learn');
                                else if (isInProg) setTopicStatus(topic.id, 'completed');
                                else setTopicStatus(topic.id, 'in-progress');
                              }}
                              className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                              title={isDone ? "Status: Completed (Click to reset)" : isInProg ? "Status: In Progress (Click to mark done)" : "Click to mark in-progress"}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                              ) : isInProg ? (
                                <Clock className="w-4 h-4 text-yellow-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-neutral-400" />
                              )}
                            </button>
                          </div>

                          {/* Topic Title */}
                          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                            {topic.title}
                          </h3>

                          {/* Snippet Description */}
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                            {topic.description}
                          </p>
                        </div>

                        {/* Footer: Learn items preview */}
                        <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400 font-mono">
                            ~{topic.estimatedHours}h
                          </span>
                          <span className="text-neutral-600 dark:text-neutral-300 font-semibold group-hover:underline inline-flex items-center gap-0.5">
                            Learn more <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </React.Fragment>
          ))}

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
