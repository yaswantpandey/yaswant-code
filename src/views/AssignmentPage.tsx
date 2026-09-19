import React, { useState, useEffect } from 'react';
import { useLms } from '../context/LmsContext';
import { Assignment } from '../types/lms';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  UploadCloud, 
  Github, 
  ExternalLink, 
  MessageSquare, 
  Star, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  Award,
  BookOpen
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const AssignmentPage: React.FC = () => {
  const { setCurrentView, addToast, selectedCourse } = useLms();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [repoUrl, setRepoUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setIsLoading(true);
        const courseParam = selectedCourse?.id ? `?course_id=${encodeURIComponent(selectedCourse.id)}` : '';
        const res = await fetch(`/api/assignments.php${courseParam}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const a = Array.isArray(json.data) ? json.data[0] : json.data;
            if (a && a.title) {
              setAssignment(a);
              if (a.githubUrl) setRepoUrl(a.githubUrl);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch assignment:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignment();
  }, [selectedCourse]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFileName(e.dataTransfer.files[0].name);
      addToast("File Attached", `${e.dataTransfer.files[0].name} uploaded successfully.`, "success");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      addToast("Missing Repository", "Please enter a valid GitHub repository URL.", "warning");
      return;
    }
    addToast("Assignment Submitted!", "Your project has been queued for grading.", "success");
  };

  if (!assignment) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <GlassCard className="p-12 text-center">
          <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4 opacity-40" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No Active Assignment</h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
            There is currently no graded project or capstone assignment required for this module. You can continue with other lessons or browse available courses.
          </p>
          <Button variant="primary" onClick={() => setCurrentView('courses')}>
            Browse Courses
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Assignment Overview Hero Banner */}
      <GlassCard className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="purple" size="sm">Graded Capstone Project</Badge>
            <Badge variant={assignment.status === 'Completed' ? 'success' : 'neutral'} size="sm">
              Status: {assignment.status || 'In Progress'}
            </Badge>
          </div>
          {assignment.deadline && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Deadline: {assignment.deadline}</span>
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          {assignment.title}
        </h1>

        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-3xl">
          {assignment.description}
        </p>

        {/* Requirements Checklist */}
        {assignment.requirements && assignment.requirements.length > 0 && (
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Core Evaluation Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {assignment.requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Submission Form & Instructor Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Cols: Submission Area */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-4">
              Project Submission Details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* GitHub Repo */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  GitHub Repository URL
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                </div>
              </div>

              {/* Live Preview URL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Live Deployment URL (Vercel, Railway, Cloud Run)
                </label>
                <div className="relative">
                  <ExternalLink className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://your-app.vercel.app"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                </div>
              </div>

              {/* Drag-and-drop file upload */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Architecture Documentation / PDF / ZIP (Optional)
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`p-6 border-2 border-dashed rounded-2xl text-center transition-colors cursor-pointer ${
                    dragActive 
                      ? 'border-neutral-900 dark:border-white bg-neutral-100/50 dark:bg-neutral-800/50' 
                      : 'border-neutral-300 dark:border-neutral-750 hover:border-neutral-400'
                  }`}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.onchange = (e: any) => {
                      if (e.target.files[0]) {
                        setUploadedFileName(e.target.files[0].name);
                        addToast("File Selected", e.target.files[0].name, "info");
                      }
                    };
                    input.click();
                  }}
                >
                  <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    {uploadedFileName ? uploadedFileName : 'Drag & drop deliverables here, or click to browse'}
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Supports PDF, ZIP, PNG diagrams up to 50MB
                  </p>
                </div>
              </div>

              {/* Implementation Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Architectural Summary & Tradeoffs Made
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Summarize your state handling strategy, database index choices..."
                  className="w-full p-3 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white leading-relaxed resize-none"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="md" className="w-full font-bold">
                  Update Capstone Submission
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Right Col: Instructor Review & Grade */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Staff Instructor Feedback
              </h3>
              <Badge variant="success" size="sm">Graded</Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-3xl font-extrabold text-neutral-950 dark:text-white">
                96<span className="text-xs font-normal text-neutral-400">/100</span>
              </div>
              <div className="text-xs text-emerald-500 font-semibold">
                High Distinction Honors
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Optimistic State Fidelity:</span>
                <strong className="text-neutral-900 dark:text-white">100%</strong>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Server Action Security:</span>
                <strong className="text-neutral-900 dark:text-white">95%</strong>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>TypeScript Strictness:</span>
                <strong className="text-neutral-900 dark:text-white">95%</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <div className="flex items-center gap-2 mb-2 font-semibold text-neutral-900 dark:text-white">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>Instructor {selectedCourse?.instructor?.name || 'Yaswant Pandey'}</span>
              </div>
              &ldquo;{assignment.feedback || 'Well-structured project implementation adhering to practical software engineering best practices.'}&rdquo;
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setCurrentView('certificate')}
                icon={<Award className="w-3.5 h-3.5 text-emerald-500" />}
              >
                View Minted Certificate
              </Button>
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
