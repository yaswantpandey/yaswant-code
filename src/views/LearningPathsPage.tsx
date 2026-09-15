import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { MOCK_LEARNING_PATHS } from '../data/mockData';
import { 
  Layers, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Award, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const LearningPathsPage: React.FC = () => {
  const { setCurrentView, setSelectedCourse, courses, addToast } = useLms();
  const [selectedPathId, setSelectedPathId] = useState<string>(MOCK_LEARNING_PATHS[0].id);

  const currentPath = MOCK_LEARNING_PATHS.find(p => p.id === selectedPathId) || MOCK_LEARNING_PATHS[0];

  const handleEnrollInPath = () => {
    addToast("Roadmap Enrolled", `You are now enrolled in the ${currentPath.title} career track!`, "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
          Career Tracks & Roadmaps
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Curated Engineering Roadmaps
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
          Sequential, milestone-driven paths designed to guide software engineers from junior/mid to principal and staff level.
        </p>
      </div>

      {/* Path Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {MOCK_LEARNING_PATHS.map((path) => {
          const isSelected = path.id === selectedPathId;

          return (
            <GlassCard
              key={path.id}
              hoverEffect
              className={`p-5 cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-neutral-900 dark:ring-white' : ''
              }`}
              onClick={() => setSelectedPathId(path.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant={isSelected ? 'primary' : 'neutral'} size="sm">
                  {path.difficulty}
                </Badge>
                <span className="text-xs font-mono text-neutral-400">{path.estimatedDuration}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white mb-1.5">
                {path.title}
              </h3>
              <p className="text-xs text-neutral-500 line-clamp-2">
                {path.description}
              </p>
            </GlassCard>
          );
        })}
      </div>

      {/* Selected Path Deep Dive Container */}
      <div className="p-6 sm:p-10 rounded-3xl bg-neutral-950 text-white border border-neutral-800 relative overflow-hidden space-y-8">
        
        {/* Track Hero Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-neutral-800">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="sm">Verified Track</Badge>
              <span className="text-xs text-neutral-400 font-mono">{currentPath.coursesCount} Required Courses</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentPath.title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              {currentPath.description}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="bg-white text-neutral-950 hover:bg-neutral-100 font-bold"
              onClick={handleEnrollInPath}
            >
              Enroll in Track Free
            </Button>
          </div>
        </div>

        {/* Sequential Roadmap Visualization */}
        <div className="space-y-6">
          <h3 className="text-base font-bold uppercase tracking-wider text-neutral-400">
            Roadmap Milestones & Sequential Curriculum
          </h3>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:content-[''] before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-800">
            {currentPath.milestones.map((milestone, idx) => (
              <div key={idx} className="relative group">
                {/* Node indicator */}
                <div className="absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full bg-neutral-900 border-2 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                  {idx + 1}
                </div>

                <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono text-neutral-400">
                      Phase {idx + 1} • {milestone.level}
                    </span>
                    <Badge variant="neutral" size="sm">Milestone</Badge>
                  </div>

                  <h4 className="text-base font-bold text-white mb-2">
                    {milestone.title}
                  </h4>
                  <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                    {milestone.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {milestone.courses.map((courseName) => (
                      <span key={courseName} className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                        {courseName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Associated Courses in Path */}
        <div className="pt-8 border-t border-neutral-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4">
            Included Masterclasses ({courses.slice(0, 3).length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {courses.slice(0, 3).map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCourse(c);
                  setCurrentView('course-detail');
                }}
                className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all"
              >
                <div className="text-[11px] text-neutral-400 mb-1">{c.difficulty}</div>
                <h5 className="text-xs font-bold text-white line-clamp-1 mb-2">{c.title}</h5>
                <div className="text-[10px] text-neutral-500 flex items-center justify-between">
                  <span>{c.durationHours} hours</span>
                  <span className="text-white hover:underline inline-flex items-center gap-1">
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
