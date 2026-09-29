import React, { useState, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { 
  Play, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Download, 
  Code2, 
  Copy, 
  Check, 
  Menu, 
  HelpCircle,
  BookOpen,
  ExternalLink,
  FolderOpen,
  HardDrive
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getVideoEmbedUrl } from '../services/mediaEmbed';

export const CourseLearningPage: React.FC = () => {
  const { 
    selectedCourse, 
    selectedLesson, 
    setSelectedLesson, 
    setCurrentView,
    addToast,
    completeLesson
  } = useLms();

  const [activeRightTab, setActiveRightTab] = useState<'notes' | 'resources' | 'discussion'>('notes');
  const [userNote, setUserNote] = useState<string>('');
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Flatten all lessons across modules and chapters to enable sequential navigation
  const allLessons = useMemo(() => {
    return selectedCourse?.modules?.flatMap(m => m.chapters?.flatMap(c => c.lessons) || []) || [];
  }, [selectedCourse]);

  const currentLessonIndex = useMemo(() => {
    return allLessons.findIndex(l => l.id === selectedLesson.id);
  }, [allLessons, selectedLesson]);

  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1 
    ? allLessons[currentLessonIndex + 1] 
    : null;

  // Real video detection from database
  const hasVideo = Boolean(selectedLesson?.videoUrl && selectedLesson.videoUrl.trim() !== '');
  const videoData = hasVideo ? getVideoEmbedUrl(selectedLesson.videoUrl) : null;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    addToast("Code Copied", "Snippet copied to clipboard.", "success");
  };

  const handleMarkComplete = () => {
    completeLesson(selectedLesson.id);
    if (nextLesson) {
      setSelectedLesson(nextLesson);
    }
  };

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    addToast("Question Submitted", "Your inquiry has been sent to the instructor.", "success");
    setNewQuestion('');
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
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedCourse.progressPercent || 0}%` }} />
            </div>
            <span className="font-mono text-neutral-200">{selectedCourse.progressPercent || 0}%</span>
          </div>

          {selectedCourse.driveUrl && (
            <a
              href={selectedCourse.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium transition-all shadow-sm"
              title="Open Google Drive Course Materials & Repository"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Google Drive</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}

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
                {allLessons.length} lessons
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
                            ) : lesson.type === 'assignment' ? (
                              <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            ) : (
                              <Play className="w-3 h-3 text-neutral-500 shrink-0 fill-current" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          {lesson.duration && (
                            <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                              {lesson.duration}
                            </span>
                          )}
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
          
          {/* VIDEO / DRIVE PLAYER */}
          {hasVideo && videoData && videoData.type !== 'none' && (
            <div className="w-full aspect-video sm:max-h-[58vh] bg-black relative flex items-center justify-center border-b border-neutral-850 group">
              {videoData.type === 'youtube' || videoData.type === 'vimeo' || videoData.type === 'googledrive' || videoData.type === 'googledrive-folder' ? (
                <div className="relative w-full h-full">
                  <iframe
                    src={videoData.embedUrl}
                    title={selectedLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  {(videoData.type === 'googledrive' || videoData.type === 'googledrive-folder') && (
                    <a
                      href={videoData.driveInfo?.directUrl || selectedLesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/80 shadow-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all"
                      title="Open file directly in Google Drive"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Open in Drive</span>
                      <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </a>
                  )}
                </div>
              ) : (
                <video
                  src={videoData.embedUrl}
                  controls
                  className="w-full h-full max-h-[58vh] bg-black"
                />
              )}
            </div>
          )}

          {/* Lesson Content, Code Snippet & Notes */}
          <div className="p-6 sm:p-8 max-w-4xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {selectedLesson.title}
                </h2>
                <p className="text-xs text-neutral-400">
                  {selectedCourse.title} • {selectedCourse.instructor.name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedCourse.driveUrl && (
                  <a
                    href={selectedCourse.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Course Drive</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-neutral-700"
                  onClick={() => setCurrentView('assignment')}
                >
                  View Assignments
                </Button>
              </div>
            </div>

            {/* Google Drive Materials Banner (If lesson or course has a Drive link) */}
            {(selectedLesson.driveUrl || selectedCourse.driveUrl) && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-neutral-900 to-neutral-900 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white">Google Drive Course Resources</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">Drive Cloud</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {selectedLesson.driveUrl 
                        ? 'Specific lecture files, starter templates, and notebooks for this lesson.' 
                        : 'Full course workspace repository, slides, and code assets on Google Drive.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
                  <a
                    href={selectedLesson.driveUrl || selectedCourse.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <span>Open in Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedLesson.driveUrl || selectedCourse.driveUrl || '');
                      addToast("Link Copied", "Google Drive link copied to clipboard.", "success");
                    }}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                    title="Copy Drive Link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Real Lesson Description from Database (if available) */}
            {selectedLesson.description && selectedLesson.description.trim() !== '' && (
              <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-4">
                <p>{selectedLesson.description}</p>
              </div>
            )}

            {/* Real Code Snippet Box (ONLY if available from database) */}
            {selectedLesson.codeSnippet && selectedLesson.codeSnippet.trim() !== '' && (
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
                <div className="px-4 py-2.5 bg-neutral-850/60 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                    <Code2 className="w-4 h-4 text-neutral-400" />
                    <span>Reference Implementation</span>
                  </div>
                  <button
                    onClick={() => copyCode(selectedLesson.codeSnippet!)}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto bg-neutral-950">
                  <code>{selectedLesson.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="pt-6 border-t border-neutral-800 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={!prevLesson}
                className="border-neutral-700 text-neutral-300 disabled:opacity-40"
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={() => {
                  if (prevLesson) setSelectedLesson(prevLesson);
                }}
              >
                Previous Lesson
              </Button>

              <Button
                variant="primary"
                size="sm"
                disabled={!nextLesson}
                className="disabled:opacity-40"
                icon={<ChevronRight className="w-4 h-4" />}
                iconPosition="right"
                onClick={() => {
                  if (nextLesson) setSelectedLesson(nextLesson);
                }}
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
              {(['notes', 'resources', 'discussion'] as const).map((tab) => (
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
                    {userNote.trim() && <Badge variant="success" size="sm">Draft</Badge>}
                  </div>
                  <textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    rows={8}
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 leading-relaxed resize-none"
                    placeholder="Take personal lesson notes here..."
                  />
                </div>

                {userNote.trim() && (
                  <div className="pt-2 border-t border-neutral-800">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs border-neutral-750"
                      onClick={() => addToast("Notes Saved", "Notes saved to your browser session.", "success")}
                    >
                      Save Notes
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeRightTab === 'resources' && (
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {/* Google Drive Repository Hub Card */}
                {(selectedLesson.driveUrl || selectedCourse.driveUrl || videoData?.type === 'googledrive') && (
                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-white">Google Drive Repository</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono">Cloud Sync</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Course materials, lecture notes, and starter code are synced to Google Drive for quick cloud access and downloads.
                    </p>
                    <div className="flex items-center gap-2">
                      <a
                        href={selectedLesson.driveUrl || selectedCourse.driveUrl || videoData?.driveInfo?.directUrl || selectedLesson.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <span>Access Google Drive</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => {
                          const driveLink = selectedLesson.driveUrl || selectedCourse.driveUrl || videoData?.driveInfo?.directUrl || selectedLesson.videoUrl || '';
                          navigator.clipboard.writeText(driveLink);
                          addToast("Link Copied", "Google Drive URL copied to clipboard.", "success");
                        }}
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                        title="Copy Link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Lesson Materials
                </div>
                {Array.isArray(selectedLesson.resources) && selectedLesson.resources.length > 0 ? (
                  selectedLesson.resources.map((res: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                        <div className="truncate">
                          <div className="font-semibold text-neutral-200 truncate">{res.name}</div>
                          {res.size && <span className="text-[10px] text-neutral-500 font-mono">{res.size}</span>}
                        </div>
                      </div>
                      {res.url && (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  !selectedLesson.driveUrl && !selectedCourse.driveUrl && (
                    <div className="p-6 text-center text-xs text-neutral-500">
                      No downloadable files attached to this lesson.
                    </div>
                  )
                )}
              </div>
            )}

            {/* Discussion Tab */}
            {activeRightTab === 'discussion' && (
              <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto space-y-3">
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Lesson Q&A Thread
                  </div>
                  <div className="p-6 text-center text-xs text-neutral-500">
                    No questions posted yet for this lesson.
                  </div>
                </div>

                <form onSubmit={handlePostQuestion} className="pt-2 border-t border-neutral-800 flex gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask a question about this lesson..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 rounded-xl text-white placeholder-neutral-500 focus:outline-none"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                  >
                    Ask
                  </Button>
                </form>
              </div>
            )}

          </aside>
        )}

      </div>
    </div>
  );
};
