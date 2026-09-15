import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  UploadCloud, 
  Plus, 
  Trash2, 
  GripVertical, 
  Layers, 
  DollarSign, 
  Sparkles, 
  Eye, 
  Save, 
  FileText, 
  HelpCircle,
  Video
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const CourseCreationWizard: React.FC = () => {
  const { setCurrentView, addToast } = useLms();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [courseTitle, setCourseTitle] = useState('Production Micro-Frontends with Module Federation');
  const [courseSubtitle, setCourseSubtitle] = useState('Architect ultra-fast distributed web apps with independent deployment pipelines.');
  const [category, setCategory] = useState('Web Development');
  const [level, setLevel] = useState('Advanced');
  const [price, setPrice] = useState('89');
  const [modules, setModules] = useState([
    {
      id: '1',
      title: 'Module 1: Module Federation Fundamentals',
      lessons: ['Runtime Shared Dependencies', 'Bi-directional Webpack 5 remotes', 'TypeScript declaration sharing']
    },
    {
      id: '2',
      title: 'Module 2: Resilient Shell Architecture',
      lessons: ['Fault-tolerant error boundaries', 'Micro-Frontend SSR streaming with Next.js', 'Auth token propagation']
    }
  ]);

  const steps = [
    { num: 1, label: 'Course Info' },
    { num: 2, label: 'Media & Trailer' },
    { num: 3, label: 'Curriculum Builder' },
    { num: 4, label: 'Quizzes & Capstones' },
    { num: 5, label: 'Pricing & Publish' }
  ];

  const handleAddModule = () => {
    const nextNum = modules.length + 1;
    setModules([
      ...modules,
      {
        id: String(Date.now()),
        title: `Module ${nextNum}: New Architecture Topic`,
        lessons: ['Introduction to Concept', 'Live Code Implementation']
      }
    ]);
    addToast("Module Added", `Created Module ${nextNum}`, "info");
  };

  const handleAddLesson = (modId: string) => {
    setModules(modules.map(m => {
      if (m.id === modId) {
        return {
          ...m,
          lessons: [...m.lessons, `New Video Lecture (${m.lessons.length + 1})`]
        };
      }
      return m;
    }));
    addToast("Lesson Added", "New lesson slot appended to module.", "info");
  };

  const handleDeleteModule = (modId: string) => {
    setModules(modules.filter(m => m.id !== modId));
  };

  const handleSaveDraft = () => {
    addToast("Draft Saved", "Course configuration stored in local workspace.", "success");
  };

  const handlePublish = () => {
    addToast("Masterclass Published", "Course has been submitted to catalog review!", "success");
    setCurrentView('instructor-dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
            Course Studio & Authoring
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Masterclass Authoring Wizard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Save className="w-3.5 h-3.5" />}
            onClick={handleSaveDraft}
          >
            Save Draft
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('instructor-dashboard')}
          >
            Exit Studio
          </Button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-5 gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        {steps.map((s) => {
          const isDone = s.num < currentStep;
          const isCurrent = s.num === currentStep;

          return (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className="text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-colors ${
                  isDone 
                    ? 'bg-emerald-500 text-white' 
                    : isCurrent 
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-extrabold' 
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                }`}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                </span>
                <span className={`text-xs font-semibold hidden md:inline truncate ${
                  isCurrent ? 'text-neutral-950 dark:text-white' : 'text-neutral-400'
                }`}>
                  {s.label}
                </span>
              </div>
              <div className={`h-1 rounded-full transition-all ${
                isDone || isCurrent ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-800'
              }`} />
            </button>
          );
        })}
      </div>

      {/* Step 1: Course Information */}
      {currentStep === 1 && (
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-neutral-950 dark:text-white">
            1. Basic Masterclass Metadata
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Course Title
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Subtitle / Headline
              </label>
              <input
                type="text"
                value={courseSubtitle}
                onChange={(e) => setCourseSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Discipline Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Distributed Systems">Distributed Systems</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced (Senior / Staff)</option>
                </select>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Step 2: Media & Assets */}
      {currentStep === 2 && (
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-neutral-950 dark:text-white">
            2. Thumbnail & Preview Trailer
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 border-2 border-dashed border-neutral-300 dark:border-neutral-750 rounded-2xl text-center space-y-2">
              <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto" />
              <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Upload 16:9 Cover Thumbnail
              </div>
              <p className="text-[10px] text-neutral-400">Recommended 1280x720 PNG or WebP</p>
              <Button variant="outline" size="sm">Select File</Button>
            </div>

            <div className="p-6 border-2 border-dashed border-neutral-300 dark:border-neutral-750 rounded-2xl text-center space-y-2">
              <Video className="w-8 h-8 text-neutral-400 mx-auto" />
              <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Upload 2-Minute Syllabus Trailer
              </div>
              <p className="text-[10px] text-neutral-400">1080p MP4 up to 200MB</p>
              <Button variant="outline" size="sm">Select Video</Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Step 3: Curriculum Builder */}
      {currentStep === 3 && (
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white">
              3. Interactive Curriculum Builder
            </h2>
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleAddModule}
            >
              Add Module
            </Button>
          </div>

          <div className="space-y-4">
            {modules.map((mod) => (
              <div key={mod.id} className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <GripVertical className="w-4 h-4 text-neutral-400 cursor-move" />
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setModules(modules.map(m => m.id === mod.id ? { ...m, title: val } : m));
                      }}
                      className="text-xs sm:text-sm font-bold bg-transparent text-neutral-900 dark:text-white focus:outline-none flex-1 border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-0.5"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteModule(mod.id)}
                    className="text-rose-500 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Lessons in Module */}
                <div className="pl-6 space-y-1.5">
                  {mod.lessons.map((lesson, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs">
                      <div className="flex items-center gap-2">
                        <Video className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-neutral-800 dark:text-neutral-200">{lesson}</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">18:40 • Free Preview</span>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddLesson(mod.id)}
                    className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white pt-1 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Lesson to Module
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Step 4: Quizzes & Capstones */}
      {currentStep === 4 && (
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-neutral-950 dark:text-white">
            4. Assessments & Capstone Project Rubric
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-500" /> Module 1 Knowledge Check Quiz
                </span>
                <Badge variant="purple" size="sm">5 Multiple Choice</Badge>
              </div>
              <p className="text-xs text-neutral-500">
                Minimum passing score set at 80% to earn the completion badge.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" /> Final Production Capstone Assignment
                </span>
                <Badge variant="success" size="sm">GitHub Submission</Badge>
              </div>
              <p className="text-xs text-neutral-500">
                Requires automated Jest/Playwright test suites and instructor code review before certificate generation.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Step 5: Pricing & Final Publish */}
      {currentStep === 5 && (
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-neutral-950 dark:text-white">
            5. Pricing Strategy & Review
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Course Price (USD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Instructor receives 85% ($75.65) per verified student enrollment.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-850 space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
              <div className="font-bold text-neutral-900 dark:text-white">
                Pre-Publication Audit Checklist
              </div>
              <div>✔ 2 Comprehensive Modules</div>
              <div>✔ 5 High-Definition Video Lectures</div>
              <div>✔ 1 Automated Assessment Quiz</div>
              <div>✔ Verifiable Credential Enabled</div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Bottom Step Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <Button
          variant="outline"
          size="md"
          disabled={currentStep === 1}
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
        >
          Previous Step
        </Button>

        {currentStep < 5 ? (
          <Button
            variant="primary"
            size="md"
            icon={<ChevronRight className="w-4 h-4" />}
            iconPosition="right"
            onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
          >
            Save & Continue
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            className="font-bold bg-emerald-600 hover:bg-emerald-700"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={handlePublish}
          >
            Publish Masterclass
          </Button>
        )}
      </div>

    </div>
  );
};
