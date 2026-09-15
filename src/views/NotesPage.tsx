import React, { useState, useEffect, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { INITIAL_STUDY_NOTES } from '../data/notesData';
import { StudyNote } from '../types/lms';
import { 
  FileText, 
  Plus, 
  Search, 
  Pin, 
  Star, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  Edit3, 
  Tag, 
  BookOpen, 
  Sparkles,
  Calendar,
  X,
  FolderOpen,
  Database
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useWorkspace } from '../context/WorkspaceContext';
import { firebaseDb } from '../services/firebaseDb';

const NOTES_STORAGE_KEY = 'yaswant_code_study_notes';

export const NotesPage: React.FC = () => {
  const { addToast } = useLms();
  const { uploadNoteToDrive, isConnected: isWorkspaceConnected } = useWorkspace();
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);

  // Load from localStorage or default notes
  const [notes, setNotes] = useState<StudyNote[]>(() => {
    try {
      const saved = localStorage.getItem(NOTES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_STUDY_NOTES;
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterStarredOnly, setFilterStarredOnly] = useState<boolean>(false);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [copiedNote, setCopiedNote] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  const categories = [
    'All',
    'System Design',
    'React & Web',
    'Distributed Systems',
    'Databases & SQL',
    'Machine Learning',
    'General',
  ];

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
        const matchesStarred = !filterStarredOnly || note.starred;
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          !q ||
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q) ||
          note.courseOrTopic.toLowerCase().includes(q) ||
          note.tags.some(t => t.toLowerCase().includes(q));
        return matchesCategory && matchesStarred && matchesSearch;
      })
      .sort((a, b) => {
        // Pinned first, then by updatedAt
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, selectedCategory, filterStarredOnly, searchQuery]);

  const activeNote = notes.find(n => n.id === selectedNoteId) || filteredNotes[0] || null;

  // Handlers
  const handleCreateNote = () => {
    const newNote: StudyNote = {
      id: `note-${Date.now()}`,
      title: 'Untitled Engineering Note',
      courseOrTopic: 'General Computer Science',
      category: 'General',
      tags: ['Revision'],
      pinned: false,
      starred: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      content: `### New Note\n\nStart capturing concepts, code snippets, and architectural trade-offs here.\n\n\`\`\`typescript\n// Write your code snippet\n\`\`\`\n`,
    };

    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setEditorMode('edit');
    addToast('Note created!', 'Ready for revision and code notes.', 'success');
  };

  const handleUpdateActiveNote = (updates: Partial<StudyNote>) => {
    if (!activeNote) return;
    const now = new Date().toISOString().split('T')[0];
    setNotes(prev =>
      prev.map(note =>
        note.id === activeNote.id
          ? { ...note, ...updates, updatedAt: now }
          : note
      )
    );
  };

  const handleDeleteNote = (noteId: string) => {
    if (notes.length <= 1) {
      addToast('Cannot delete last note', 'You must have at least one note in your workspace.', 'warning');
      return;
    }
    const remaining = notes.filter(n => n.id !== noteId);
    setNotes(remaining);
    if (selectedNoteId === noteId) {
      setSelectedNoteId(remaining[0]?.id || '');
    }
    addToast('Note deleted', 'The note was removed from your notebook.', 'info');
  };

  const handleTogglePin = (noteId: string) => {
    setNotes(prev =>
      prev.map(n => n.id === noteId ? { ...n, pinned: !n.pinned } : n)
    );
  };

  const handleToggleStar = (noteId: string) => {
    setNotes(prev =>
      prev.map(n => n.id === noteId ? { ...n, starred: !n.starred } : n)
    );
  };

  const handleExportActiveNote = () => {
    if (!activeNote) return;
    const markdownContent = `# ${activeNote.title}\nTopic: ${activeNote.courseOrTopic}\nCategory: ${activeNote.category}\nDate: ${activeNote.updatedAt}\nTags: ${activeNote.tags.join(', ')}\n\n${activeNote.content}\n`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeNote.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Note exported as Markdown!', `${activeNote.title}.md saved`, 'success');
  };

  const handleCopyNote = () => {
    if (!activeNote) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeNote.content);
      setCopiedNote(true);
      addToast('Copied to clipboard', 'Note markdown copied successfully.', 'success');
      setTimeout(() => setCopiedNote(false), 2000);
    }
  };

  const handleSaveToDrive = async () => {
    if (!activeNote) return;
    setIsSyncingDrive(true);
    try {
      await uploadNoteToDrive(activeNote.title, activeNote.content);
      addToast('Saved to Google Drive', `"${activeNote.title}.md" backed up to Google Drive.`, 'success');
    } catch {
      addToast('Google Drive Sync', 'Could not upload note to Google Drive.', 'error');
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleSaveToFirestore = async () => {
    if (!activeNote) return;
    setIsSyncingFirestore(true);
    try {
      await firebaseDb.saveUserNote('current_learner', {
        id: activeNote.id,
        userId: 'current_learner',
        title: activeNote.title,
        content: activeNote.content,
        category: activeNote.category,
        tags: activeNote.tags,
        updatedAt: new Date().toISOString()
      });
      addToast('Firebase Firestore', 'Study note synced securely to Firebase cloud.', 'success');
    } catch {
      addToast('Firebase Sync', 'Saved locally. Cloud sync requires network.', 'info');
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Personal Knowledge Workspace
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Study Notes & Scratchpad
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
            Maintain course notes, architectural diagrams, revision summaries, and code snippets with instant local persistence and Markdown export.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExportActiveNote} disabled={!activeNote}>
            <Download className="w-3.5 h-3.5 mr-1" /> Export Note (.md)
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreateNote}>
            <Plus className="w-3.5 h-3.5 mr-1" /> New Note
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Column: Note List & Search Filter */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Search & Star filter bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-950 dark:focus:border-white shadow-2xs"
              />
            </div>
            <button
              onClick={() => setFilterStarredOnly(!filterStarredOnly)}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                filterStarredOnly
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-neutral-900 text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:text-neutral-950'
              }`}
              title="Filter starred"
            >
              <Star className={`w-3.5 h-3.5 ${filterStarredOnly ? 'fill-amber-400' : ''}`} />
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold'
                    : 'bg-neutral-100 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Scrollable Note List */}
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[560px] pr-1">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2 opacity-50" />
                <div className="text-xs font-bold text-neutral-900 dark:text-white mb-1">No notes match</div>
                <div className="text-[11px] text-neutral-400">Click "New Note" to create one.</div>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = note.id === selectedNoteId;

                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white dark:bg-neutral-900 border-neutral-900 dark:border-white shadow-md ring-1 ring-neutral-900/10 dark:ring-white/10'
                        : 'bg-white/80 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-snug line-clamp-1">
                          {note.title}
                        </h4>
                        <div className="flex items-center gap-1 shrink-0">
                          {note.pinned && (
                            <Pin className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                          )}
                          {note.starred && (
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono truncate mb-1.5">
                        {note.courseOrTopic}
                      </div>

                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {note.content.replace(/[#*`]/g, '')}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                      <span>{note.category}</span>
                      <span>{note.updatedAt}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Note Editor / Preview */}
        <div className="lg:col-span-8">
          {activeNote ? (
            <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 flex flex-col h-full min-h-[600px]">
              {/* Note Metadata Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {activeNote.category}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    Updated {activeNote.updatedAt}
                  </span>
                </div>

                {/* Editor Action Controls */}
                <div className="flex items-center gap-1.5">
                  {/* Mode Toggle */}
                  <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs">
                    <button
                      onClick={() => setEditorMode('edit')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        editorMode === 'edit'
                          ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs font-bold'
                          : 'text-neutral-500 hover:text-neutral-950'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => setEditorMode('preview')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        editorMode === 'preview'
                          ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs font-bold'
                          : 'text-neutral-500 hover:text-neutral-950'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 inline mr-1" /> Preview
                    </button>
                  </div>

                  {/* Pin Toggle */}
                  <button
                    onClick={() => handleTogglePin(activeNote.id)}
                    className={`p-2 rounded-xl border text-xs transition-colors ${
                      activeNote.pinned 
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900' 
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-950'
                    }`}
                    title={activeNote.pinned ? 'Unpin' : 'Pin to top'}
                  >
                    <Pin className={`w-3.5 h-3.5 ${activeNote.pinned ? 'fill-indigo-500' : ''}`} />
                  </button>

                  {/* Star Toggle */}
                  <button
                    onClick={() => handleToggleStar(activeNote.id)}
                    className={`p-2 rounded-xl border text-xs transition-colors ${
                      activeNote.starred 
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900' 
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-950'
                    }`}
                    title={activeNote.starred ? 'Unstar' : 'Star note'}
                  >
                    <Star className={`w-3.5 h-3.5 ${activeNote.starred ? 'fill-amber-500' : ''}`} />
                  </button>

                  {/* Google Drive Backup Button */}
                  <button
                    onClick={handleSaveToDrive}
                    disabled={isSyncingDrive}
                    className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                    title="Backup note to Google Drive"
                  >
                    <FolderOpen className={`w-3.5 h-3.5 ${isSyncingDrive ? 'animate-pulse' : ''}`} />
                  </button>

                  {/* Firebase Firestore Cloud Button */}
                  <button
                    onClick={handleSaveToFirestore}
                    disabled={isSyncingFirestore}
                    className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                    title="Sync note to Firebase Cloud"
                  >
                    <Database className={`w-3.5 h-3.5 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyNote}
                    className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                    title="Copy Markdown"
                  >
                    {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Topic Inputs */}
              <div className="py-4 space-y-3">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                  placeholder="Note Title..."
                  className="w-full text-xl sm:text-2xl font-extrabold bg-transparent text-neutral-950 dark:text-white placeholder-neutral-400 focus:outline-none tracking-tight"
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    type="text"
                    value={activeNote.courseOrTopic}
                    onChange={(e) => handleUpdateActiveNote({ courseOrTopic: e.target.value })}
                    placeholder="Associated Course or Concept (e.g. Distributed Consensus)..."
                    className="text-xs font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-850 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-750 focus:outline-none flex-1"
                  />

                  {/* Category Selector */}
                  <select
                    value={activeNote.category}
                    onChange={(e) => handleUpdateActiveNote({ category: e.target.value as any })}
                    className="text-xs bg-neutral-50 dark:bg-neutral-850 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300 focus:outline-none font-medium"
                  >
                    {categories.filter(c => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Main Text Content Area */}
              <div className="flex-1 flex flex-col pt-2">
                {editorMode === 'edit' ? (
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                    placeholder="Write markdown, algorithms, math formulas, and code snippets here..."
                    className="w-full flex-1 p-4 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm font-mono text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-950 dark:focus:border-white leading-relaxed resize-none min-h-[340px]"
                  />
                ) : (
                  <div className="flex-1 p-5 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed font-sans overflow-y-auto whitespace-pre-line min-h-[340px]">
                    {activeNote.content}
                  </div>
                )}
              </div>

              {/* Tag Editor Row */}
              <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-neutral-400 mr-1" />
                {activeNote.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-md text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono flex items-center gap-1"
                  >
                    #{tag}
                  </span>
                ))}
                <span className="text-[11px] text-neutral-400 italic">
                  (Changes auto-save locally to browser storage)
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-12 text-center h-full flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-neutral-400 mb-3 opacity-40" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
                No note selected
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                Select an existing note from the list on the left, or create a brand new note to get started.
              </p>
              <Button variant="primary" size="sm" onClick={handleCreateNote}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Create Note
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
