import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Download, 
  MessageSquare, 
  Sparkles, 
  Code2, 
  Copy, 
  Check, 
  Menu, 
  X, 
  Clock, 
  HelpCircle,
  Award,
  BookOpen
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const CourseLearningPage: React.FC = () => {
  const { 
    selectedCourse, 
    selectedLesson, 
    setSelectedLesson, 
    setCurrentView,
    addToast,
    setCertificateModal
  } = useLms();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const [progressRatio, setProgressRatio] = useState(38); // percent
  const [activeRightTab, setActiveRightTab] = useState<'notes' | 'resources' | 'discussion' | 'transcript'>('notes');
  const [userNote, setUserNote] = useState(
    "Server Actions in Next.js 15 must be treated as POST endpoints with implicit CSRF tokens. Always wrap mutations with useActionState for predictable rollback."
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleSnippet = `// app/actions/board.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const TaskSchema = z.object({
  title: z.string().min(3),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'])
});

export async function moveTaskAction(prevState: any, formData: FormData) {
  const parsed = TaskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: 'Invalid payload format' };
  }
  
  // Real database write
  await db.task.update({ where: { id: formData.get('id') }, data: parsed.data });
  revalidatePath('/dashboard');
  return { success: true };
}`;

  const copySnippet = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    addToast("Code Copied", "Snippet copied to clipboard.", "success");
  };

  const handleMarkComplete = () => {
    addToast("Lesson Completed", "Progress saved! Continuing to next chapter...", "success");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-neutral-950 text-white">
      
      {/* Top Learning Header */}
      <div className="h-14 border-b border-neutral-800 bg-neutral-900/90 px-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('student-dashboard')}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Toggle Curriculum Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="truncate">
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              {selectedCourse.title} /
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-white truncate ml-1 inline">
              {selectedLesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
            <span>Course Progress:</span>
            <div className="w-24 h-1.5 rounded-full bg-neutral-850 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedCourse.progressPercent || 34}%` }} />
            </div>
            <span className="font-mono text-neutral-200">{selectedCourse.progressPercent || 34}%</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-xs border-neutral-700 text-neutral-200"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
          >
            {rightPanelOpen ? 'Hide Notes' : 'Show Notes'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleMarkComplete}
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Complete
          </Button>
        </div>
      </div>

      {/* Main Workspace Area (Sidebar + Video + Right Panel) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Curriculum Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 sm:w-80 border-r border-neutral-850 bg-neutral-900/80 flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Course Syllabus
              </span>
              <span className="text-xs font-mono text-neutral-500">
                {selectedCourse.lessonsCount} lessons
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4 divide-y divide-neutral-850">
              {selectedCourse.modules.map((mod) => (
                <div key={mod.id} className="pt-3 first:pt-0">
                  <div className="text-xs font-bold text-neutral-300 mb-2">
                    {mod.title}
                  </div>

                  <div className="space-y-1">
                    {mod.chapters.flatMap(c => c.lessons).map((lesson) => {
                      const isActive = selectedLesson.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all ${
                            isActive
                              ? 'bg-neutral-800 text-white font-bold ring-1 ring-neutral-700'
                              : 'text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {lesson.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : lesson.type === 'quiz' ? (
                              <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            ) : (
                              <Play className="w-3 h-3 text-neutral-500 shrink-0 fill-current" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                            {lesson.duration}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Quick Test link */}
            <div className="p-3 border-t border-neutral-800 bg-neutral-900 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs border-neutral-750 text-neutral-300"
                onClick={() => setCurrentView('quiz')}
              >
                Launch Assessment Quiz
              </Button>
            </div>
          </aside>
        )}

        {/* Center Video Player & Content Scroll Area */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-neutral-950">
          
          {/* Mock Video Container */}
          <div className="w-full aspect-video sm:max-h-[56vh] bg-black relative flex items-center justify-center group overflow-hidden border-b border-neutral-850">
            {/* Ambient background canvas simulation */}
            <div className="absolute inset-0 bg-radial from-neutral-900 to-black opacity-80" />
            
            {/* Center Play Button Graphic */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-transform transform group-hover:scale-110 active:scale-95 z-10"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-white text-white" />
              ) : (
                <Play className="w-7 h-7 fill-white text-white ml-1" />
              )}
            </button>

            {/* Video Overlay Watermark & Info */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <Badge variant="purple" size="sm">1080p 60fps</Badge>
              <span className="text-xs font-mono text-neutral-400">
                Lesson ID: {selectedLesson.id}
              </span>
            </div>

            {/* Bottom Video Controls Scrubber Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 space-y-2 opacity-90 group-hover:opacity-100 transition-opacity">
              {/* Scrubber */}
              <div 
                className="w-full h-1.5 bg-neutral-800 hover:h-2.5 rounded-full cursor-pointer relative overflow-hidden transition-all"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  setProgressRatio(Math.round((clickX / rect.width) * 100));
                }}
              >
                <div
                  className="h-full bg-emerald-500 rounded-full relative"
                  style={{ width: `${progressRatio}%` }}
                />
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  <button onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <span className="font-mono text-[11px] text-neutral-400">
                    08:14 / {selectedLesson.duration}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Speed Selector */}
                  <div className="flex items-center gap-1 text-[11px] font-mono bg-neutral-900/80 px-2 py-0.5 rounded border border-neutral-800">
                    {['1.0x', '1.25x', '1.5x'].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-1.5 py-0.5 rounded ${playbackSpeed === spd ? 'bg-white text-black font-bold' : 'text-neutral-400'}`}
                      >
                        {spd}
                      </button>
                    ))}
                  </div>

                  <button title="Toggle Fullscreen">
                    <Maximize2 className="w-4 h-4 text-neutral-400 hover:text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Content, Code Snippet & Notes */}
          <div className="p-6 sm:p-8 max-w-4xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {selectedLesson.title}
                </h2>
                <p className="text-xs text-neutral-400">
                  Taught by {selectedCourse.instructor.name} • Recorded in Next.js 15 Canary & React 19
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-neutral-700"
                  onClick={() => setCurrentView('assignment')}
                >
                  View Capstone
                </Button>
              </div>
            </div>

            {/* Architectural Explanation */}
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-4">
              <p>
                In this masterclass lesson, we explore how React Server Actions interact with client-side cache revalidation in Next.js 15. When invoking <code className="text-amber-400 font-mono bg-neutral-900 px-1 py-0.5 rounded">revalidatePath()</code>, the server computes a minimal diff of the RSC payload without triggering a full page remount.
              </p>

              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Key Architectural Rules
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-300 list-disc list-inside">
                  <li>Keep all Server Actions in dedicated <code className="text-neutral-200 font-mono">/actions</code> directories.</li>
                  <li>Always parse input arguments using Zod schemas to reject invalid payloads.</li>
                  <li>Use <code className="text-neutral-200 font-mono">useOptimistic</code> for instantaneous zero-latency list updates.</li>
                </ul>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
              <div className="px-4 py-2.5 bg-neutral-850/60 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <Code2 className="w-4 h-4 text-neutral-400" />
                  <span>app/actions/board.ts</span>
                </div>
                <button
                  onClick={copySnippet}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto bg-neutral-950">
                <code>{sampleSnippet}</code>
              </pre>
            </div>

            {/* Navigation Footer */}
            <div className="pt-6 border-t border-neutral-800 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="border-neutral-700 text-neutral-300"
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={() => addToast("Previous Lesson", "Switched to preceding module.", "info")}
              >
                Previous Lesson
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={<ChevronRight className="w-4 h-4" />}
                iconPosition="right"
                onClick={() => addToast("Next Lesson", "Loaded next video in queue.", "success")}
              >
                Next Lesson
              </Button>
            </div>
          </div>
        </main>

        {/* Right Collapsible Panel (Notes, Resources, Discussions) */}
        {rightPanelOpen && (
          <aside className="w-80 sm:w-96 border-l border-neutral-850 bg-neutral-900/90 flex flex-col shrink-0 overflow-hidden">
            {/* Panel Tabs */}
            <div className="flex border-b border-neutral-800 text-xs font-semibold bg-neutral-900">
              {(['notes', 'resources', 'discussion', 'transcript'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveRightTab(tab)}
                  className={`flex-1 py-3 capitalize transition-colors text-center ${
                    activeRightTab === tab
                      ? 'text-white border-b-2 border-white font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Notes Tab */}
            {activeRightTab === 'notes' && (
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4 overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Personal Scratchpad
                    </span>
                    <Badge variant="success" size="sm">Auto-saved</Badge>
                  </div>
                  <p className="text-[11px] text-neutral-500 mb-3">
                    Notes are synchronized with your student profile and searchable across all devices.
                  </p>
                  <textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    rows={8}
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 leading-relaxed resize-none"
                    placeholder="Take timestamped notes here..."
                  />
                </div>

                <div className="pt-2 border-t border-neutral-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs border-neutral-750"
                    onClick={() => addToast("Notes Exported", "Notes downloaded as markdown (.md)", "success")}
                  >
                    Export Notes as Markdown
                  </Button>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeRightTab === 'resources' && (
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Lesson Assets & Code
                </div>
                {[
                  { name: 'Starter GitHub Monorepo (v15.2)', size: '14.2 MB', ext: 'ZIP' },
                  { name: 'React 19 Hooks Cheatsheet', size: '2.1 MB', ext: 'PDF' },
                  { name: 'Architecture Excalidraw Diagram', size: '820 KB', ext: 'PNG' }
                ].map((res, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-neutral-200 truncate">{res.name}</div>
                        <span className="text-[10px] text-neutral-500 font-mono">{res.size}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Download className="w-3.5 h-3.5" />}
                      onClick={() => addToast("Download Started", `${res.name} is downloading.`, "info")}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Discussion Tab */}
            {activeRightTab === 'discussion' && (
              <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto space-y-3">
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Lesson Q&A Thread (3 Questions)
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <strong className="text-white">Marcus Vance</strong>
                      <span>2h ago</span>
                    </div>
                    <p className="text-neutral-300">
                      Does useOptimistic support asynchronous rolling cancellations if the user navigates away?
                    </p>
                    <div className="text-[11px] text-emerald-400 font-medium pt-1">
                      Instructor verified reply: &ldquo;Yes, React discards the optimistic update automatically on unmount.&rdquo;
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask an architecture question..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 rounded-xl text-white placeholder-neutral-500 focus:outline-none"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => addToast("Question Posted", "Instructor has been notified.", "success")}
                  >
                    Ask
                  </Button>
                </div>
              </div>
            )}

            {/* Transcript Tab */}
            {activeRightTab === 'transcript' && (
              <div className="p-4 flex-1 overflow-y-auto space-y-2 text-xs text-neutral-400 font-mono">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Click Timestamp to Jump
                </div>
                {[
                  { time: '00:00', text: 'Introduction to Next.js 15 Server Actions and RPC bridges' },
                  { time: '02:45', text: 'Defining action schemas using Zod validation pipelines' },
                  { time: '06:12', text: 'Invoking mutations with useActionState inside client forms' },
                  { time: '12:30', text: 'Optimistic state rollbacks and error boundary traps' },
                  { time: '18:50', text: 'Benchmark comparisons with traditional REST handlers' }
                ].map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => addToast("Timestamp Jump", `Seek to ${t.time}`, "info")}
                    className="w-full text-left p-2 rounded-lg hover:bg-neutral-800/60 flex items-start gap-2 text-neutral-300 transition-colors"
                  >
                    <span className="text-emerald-400 font-bold shrink-0">{t.time}</span>
                    <span className="text-xs leading-relaxed text-neutral-400 hover:text-white font-sans">{t.text}</span>
                  </button>
                ))}
              </div>
            )}

          </aside>
        )}

      </div>
    </div>
  );
};
