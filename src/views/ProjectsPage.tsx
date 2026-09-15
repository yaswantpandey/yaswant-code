import React, { useState, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { MOCK_PROJECTS } from '../data/projectsData';
import { ProjectItem } from '../types/lms';
import { 
  FolderGit2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  ArrowRight, 
  Github, 
  Terminal, 
  Sparkles, 
  UploadCloud, 
  X,
  Code2,
  Cpu,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const ProjectsPage: React.FC = () => {
  const { setCurrentView, addToast } = useLms();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  // Active Project Detail Modal
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [copiedCommand, setCopiedCommand] = useState(false);
  
  // Local milestone states (allows user to toggle milestones!)
  const [projectMilestones, setProjectMilestones] = useState<Record<string, Record<string, boolean>>>(() => {
    const initial: Record<string, Record<string, boolean>> = {};
    MOCK_PROJECTS.forEach(p => {
      initial[p.id] = {};
      p.milestones.forEach(m => {
        initial[p.id][m.id] = m.completed;
      });
    });
    return initial;
  });

  // Submission modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    title: '',
    githubUrl: '',
    demoUrl: '',
    description: '',
    techStack: ''
  });

  const categories = ['All', 'Full-Stack', 'Distributed Systems', 'AI & ML', 'Systems & Rust', 'DevOps & Cloud'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const statuses = ['All', 'In Progress', 'Available', 'Completed'];

  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || project.difficulty === selectedDifficulty;
      const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedStatus]);

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    setProjectMilestones(prev => {
      const current = prev[projectId] || {};
      const updated = { ...current, [milestoneId]: !current[milestoneId] };
      return { ...prev, [projectId]: updated };
    });
    addToast('Milestone Updated', 'Project progress saved.', 'info');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(true);
    addToast('Copied to Clipboard', text, 'success');
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleNewProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.title || !submitForm.githubUrl) {
      addToast('Missing Details', 'Please provide project title and GitHub URL.', 'warning');
      return;
    }
    addToast('Capstone Submitted', 'Your capstone proposal has been queued for review by the instructor cohort!', 'success');
    setSubmitModalOpen(false);
    setSubmitForm({ title: '', githubUrl: '', demoUrl: '', description: '', techStack: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">
            <FolderGit2 className="w-4 h-4 text-emerald-500" />
            <span>Hands-On Engineering</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Real-World Capstone Projects
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl">
            Build production-grade systems with starter repositories, architecture blueprints, milestone checklists, and instructor code review.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="outline"
            onClick={() => setCurrentView('assignment')}
            className="flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            <span>My Submissions</span>
          </Button>
          <Button 
            variant="primary"
            onClick={() => setSubmitModalOpen(true)}
            className="flex items-center gap-2 shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Submit Capstone</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search projects by tech (e.g. Go, React 19, eBPF, Rust)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all shadow-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 self-end sm:self-auto">
            <span>Showing <strong className="text-neutral-900 dark:text-white">{filteredProjects.length}</strong> of {MOCK_PROJECTS.length} capstones</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sub-Filters: Difficulty & Status */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-medium">Difficulty:</span>
            <div className="flex items-center gap-1.5">
              {difficulties.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedDifficulty === d
                      ? 'bg-neutral-200 dark:bg-neutral-800 font-bold text-neutral-900 dark:text-white'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-medium">Status:</span>
            <div className="flex items-center gap-1.5">
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedStatus === s
                      ? 'bg-neutral-200 dark:bg-neutral-800 font-bold text-neutral-900 dark:text-white'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8">
          <FolderGit2 className="w-12 h-12 text-neutral-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No projects found</h3>
          <p className="text-sm text-neutral-500 mt-1">Try resetting your search query or category filters.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedDifficulty('All');
              setSelectedStatus('All');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const milestonesMap = projectMilestones[project.id] || {};
            const completedCount = project.milestones.filter(m => milestonesMap[m.id]).length;
            const progressPercent = Math.round((completedCount / project.milestones.length) * 100);

            return (
              <GlassCard 
                key={project.id}
                className="group flex flex-col justify-between overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-300 hover:shadow-lg rounded-2xl"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-neutral-900">
                    <img 
                      src={project.thumbnail} 
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-black/60 backdrop-blur-md text-white border border-white/10">
                        {project.category}
                      </span>
                      {project.featured && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/90 text-neutral-950 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-[11px] font-bold rounded-md backdrop-blur-md ${
                        project.status === 'Completed' 
                          ? 'bg-emerald-500/90 text-white' 
                          : project.status === 'In Progress' 
                            ? 'bg-blue-600/90 text-white' 
                            : 'bg-neutral-800/80 text-neutral-200'
                      }`}>
                        {project.status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> ~{project.estimatedHours} hrs build time
                      </span>
                      <span className="font-semibold text-white/80">{project.difficulty}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-blue-500 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {project.tagline}
                    </p>

                    {/* Tech Stack Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.techStack.slice(0, 4).map((tech) => (
                        <span 
                          key={tech} 
                          className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Milestone Progress Indicator */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] mb-1 text-neutral-500 dark:text-neutral-400">
                        <span>Milestones</span>
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {completedCount}/{project.milestones.length} ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500 rounded-full" 
                          style={{ width: `${progressPercent}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-neutral-100 dark:border-neutral-800/80 mt-2">
                  <span className="text-[11px] text-neutral-400 truncate">
                    {project.submissionsCount} submissions
                  </span>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setActiveProject(project)}
                    className="flex items-center gap-1.5 text-xs py-1.5 px-3"
                  >
                    <span>View Specs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Project Detail & Interactive Workspace Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="blue" size="sm">{activeProject.category}</Badge>
                  <Badge variant="neutral" size="sm">{activeProject.difficulty}</Badge>
                  <span className="text-xs text-neutral-400">Est. {activeProject.estimatedHours} Hours</span>
                </div>
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white">
                  {activeProject.title}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">{activeProject.tagline}</p>
              </div>

              <button
                onClick={() => setActiveProject(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Starter Command */}
            <div className="bg-neutral-950 text-neutral-100 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Starter Repository Setup
                </span>
                <button
                  onClick={() => handleCopy(activeProject.starterRepoCommand)}
                  className="flex items-center gap-1 text-xs hover:text-white transition-colors"
                >
                  {copiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCommand ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <code className="text-xs font-mono text-emerald-300 block overflow-x-auto whitespace-nowrap py-1">
                {activeProject.starterRepoCommand}
              </code>
            </div>

            {/* Architecture Overview */}
            {activeProject.architectureDiagramSnippet && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-blue-500" /> Architecture Blueprint
                </h4>
                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-700 dark:text-neutral-300 whitespace-pre overflow-x-auto">
                  {activeProject.architectureDiagramSnippet}
                </div>
              </div>
            )}

            {/* Interactive Milestones */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Implementation Milestones
                </h4>
                <span className="text-xs text-neutral-500">Click to toggle progress</span>
              </div>

              <div className="space-y-2">
                {activeProject.milestones.map((milestone) => {
                  const isDone = projectMilestones[activeProject.id]?.[milestone.id] ?? milestone.completed;
                  return (
                    <div
                      key={milestone.id}
                      onClick={() => toggleMilestone(activeProject.id, milestone.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isDone
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-neutral-900 dark:text-white'
                          : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/60 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                      }`}
                    >
                      <button className="mt-0.5 shrink-0 text-emerald-500">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
                        ) : (
                          <Circle className="w-4 h-4 text-neutral-400" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className={`text-sm font-semibold ${isDone ? 'line-through opacity-80' : ''}`}>
                          {milestone.title}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {milestone.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deliverables */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Grading Deliverables & Criteria
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 list-disc list-inside">
                {activeProject.deliverables.map((del, idx) => (
                  <li key={idx}>{del}</li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                {activeProject.liveDemoUrl && (
                  <a
                    href={activeProject.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline"
                  >
                    <span>Reference Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setActiveProject(null)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setActiveProject(null);
                    setCurrentView('assignment');
                    addToast('Project Selected', `Loaded ${activeProject.title} into your assignment review workspace.`, 'info');
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <span>Go to Submission Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Submit Capstone Proposal Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Submit Capstone Project</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Submit your completed build for peer grading & instructor review.</p>
              </div>
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Key-Value Store with Raft"
                  value={submitForm.title}
                  onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  GitHub Repository URL *
                </label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username/project-repo"
                    value={submitForm.githubUrl}
                    onChange={(e) => setSubmitForm({ ...submitForm, githubUrl: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Live Demo URL (Optional)
                </label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="url"
                    placeholder="https://my-project.vercel.app"
                    value={submitForm.demoUrl}
                    onChange={(e) => setSubmitForm({ ...submitForm, demoUrl: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tech Stack (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Go, gRPC, Docker, PostgreSQL"
                  value={submitForm.techStack}
                  onChange={(e) => setSubmitForm({ ...submitForm, techStack: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Architecture Notes / Key Challenges Solved
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your solution, concurrency guards, test suite coverage..."
                  value={submitForm.description}
                  onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSubmitModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Submit for Evaluation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
