import React, { useState, useEffect, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { StudyNote, NoteResourceType } from '../types/lms';
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
  FolderOpen, 
  ExternalLink,
  FileSpreadsheet,
  FileCode,
  Layers,
  Grid,
  List,
  ArrowUpRight,
  Upload,
  Info,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const NOTES_STORAGE_KEY = 'yaswant_code_study_notes_v3';

export const NotesPage: React.FC = () => {
  const { addToast } = useLms();

  // Load from localStorage or initialize empty
  const [notes, setNotes] = useState<StudyNote[]>(() => {
    try {
      const saved = localStorage.getItem(NOTES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Fetch live notes from backend API
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes.php');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setNotes(json.data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch notes from API:', err);
      }
    };
    fetchNotes();
  }, []);

  // Filters & View State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedResourceType, setSelectedResourceType] = useState<'all' | 'pdf' | 'google' | 'starred' | 'pinned'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);
  const [previewNote, setPreviewNote] = useState<StudyNote | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for Add / Edit Modal
  const [formResourceType, setFormResourceType] = useState<NoteResourceType>('pdf');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formCourse, setFormCourse] = useState<string>('');
  const [formCategory, setFormCategory] = useState<StudyNote['category']>('System Design');
  const [formThumbnail, setFormThumbnail] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formFileSize, setFormFileSize] = useState<string>('');
  const [formAuthor, setFormAuthor] = useState<string>('Yaswant Pandey');

  // Load live study notes from MariaDB database
  useEffect(() => {
    fetch('/api/notes.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setNotes(data.data);
        }
      })
      .catch(() => {});
  }, []);

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
    'Data Structures & Algorithms',
    'Languages & Programming',
    'Core CS & B.Tech',
    'System Design',
    'React & Web',
    'Distributed Systems',
    'Databases & SQL',
    'Machine Learning',
    'DevOps & Cloud',
    'General',
  ];

  // Auto-fill thumbnail when category changes if thumbnail is empty or matched default
  const handleCategoryChange = (newCat: StudyNote['category']) => {
    setFormCategory(newCat);
    if (!formThumbnail || Object.values(CATEGORY_THUMBNAILS).includes(formThumbnail)) {
      setFormThumbnail(CATEGORY_THUMBNAILS[newCat] || CATEGORY_THUMBNAILS['General']);
    }
  };

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;

        let matchesType = true;
        if (selectedResourceType === 'pdf') {
          matchesType = note.resourceType === 'pdf';
        } else if (selectedResourceType === 'google') {
          matchesType = ['google_drive', 'google_docs', 'google_sheets', 'google_slides'].includes(note.resourceType);
        } else if (selectedResourceType === 'starred') {
          matchesType = !!note.starred;
        } else if (selectedResourceType === 'pinned') {
          matchesType = !!note.pinned;
        }

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          note.title.toLowerCase().includes(q) ||
          (note.description && note.description.toLowerCase().includes(q)) ||
          note.courseOrTopic.toLowerCase().includes(q) ||
          (note.author && note.author.toLowerCase().includes(q));

        return matchesCategory && matchesType && matchesSearch;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, selectedCategory, selectedResourceType, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = notes.length;
    const pdfCount = notes.filter((n) => n.resourceType === 'pdf').length;
    const googleCount = notes.filter((n) => ['google_drive', 'google_docs', 'google_sheets', 'google_slides'].includes(n.resourceType)).length;
    const starredCount = notes.filter((n) => n.starred).length;
    return { total, pdfCount, googleCount, starredCount };
  }, [notes]);

  // Handlers
  const handleOpenAddModal = (type: NoteResourceType = 'pdf') => {
    setEditingNote(null);
    setFormResourceType(type);
    setFormTitle('');
    setFormUrl('');
    setFormCourse('');
    setFormCategory('System Design');
    setFormThumbnail(CATEGORY_THUMBNAILS['System Design']);
    setFormDescription('');
    setFormFileSize(type === 'pdf' ? '2.5 MB • 15p' : 'Google Drive');
    setFormAuthor('Yaswant Pandey');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (note: StudyNote) => {
    setEditingNote(note);
    setFormResourceType(note.resourceType);
    setFormTitle(note.title);
    setFormUrl(note.url);
    setFormCourse(note.courseOrTopic);
    setFormCategory(note.category);
    setFormThumbnail(note.thumbnail || CATEGORY_THUMBNAILS[note.category] || CATEGORY_THUMBNAILS['General']);
    setFormDescription(note.description || '');
    setFormFileSize(note.fileSize || '');
    setFormAuthor(note.author || 'Yaswant Pandey');
    setIsAddModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      addToast('Title required', 'Please provide a title for this note.', 'warning');
      return;
    }

    if (!formUrl.trim()) {
      addToast('Link required', 'Please provide the PDF URL or Google link.', 'warning');
      return;
    }

    let cleanUrl = formUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const fallbackThumb = CATEGORY_THUMBNAILS[formCategory] || CATEGORY_THUMBNAILS['General'];
    const now = new Date().toISOString().split('T')[0];

    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? {
                ...n,
                title: formTitle.trim(),
                url: cleanUrl,
                courseOrTopic: formCourse.trim() || formCategory,
                category: formCategory,
                thumbnail: formThumbnail.trim() || fallbackThumb,
                description: formDescription.trim() || 'Study notes and reference material.',
                fileSize: formFileSize.trim(),
                author: formAuthor.trim(),
                resourceType: formResourceType,
                previewUrl: cleanUrl,
                updatedAt: now,
              }
            : n
        )
      );
      addToast('Note Updated', `"${formTitle}" changes saved.`, 'success');
    } else {
      const newNote: StudyNote = {
        id: `note-${Date.now()}`,
        title: formTitle.trim(),
        url: cleanUrl,
        courseOrTopic: formCourse.trim() || formCategory,
        category: formCategory,
        thumbnail: formThumbnail.trim() || fallbackThumb,
        description: formDescription.trim() || 'Study notes and reference material.',
        fileSize: formFileSize.trim() || (formResourceType === 'pdf' ? 'PDF File' : 'Google Drive'),
        tags: [formCategory],
        author: formAuthor.trim() || 'Yaswant Pandey',
        resourceType: formResourceType,
        previewUrl: cleanUrl,
        pinned: false,
        starred: false,
        createdAt: now,
        updatedAt: now,
      };

      setNotes([newNote, ...notes]);
      addToast('Resource Added!', `New ${formResourceType.toUpperCase()} card added.`, 'success');
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteNote = (noteId: string, title: string) => {
    if (confirm(`Remove "${title}" from study notes?`)) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      addToast('Note removed', `"${title}" removed.`, 'info');
    }
  };

  const handleTogglePin = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleToggleStar = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, starred: !n.starred } : n))
    );
  };

  const handleCopyLink = (note: StudyNote) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(note.url);
      setCopiedId(note.id);
      addToast('Link copied!', 'Document link copied to clipboard.', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      if (!formTitle) setFormTitle(nameWithoutExt);
      setFormFileSize(`${sizeMB} MB • PDF`);
      const objectUrl = URL.createObjectURL(file);
      setFormUrl(objectUrl);
      addToast('File selected', `${file.name} ready to save.`, 'info');
    }
  };

  const renderBadge = (type: NoteResourceType) => {
    switch (type) {
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold bg-rose-600/90 text-white shadow-xs backdrop-blur-md">
            <FileText className="w-3 h-3" />
            PDF
          </span>
        );
      case 'google_drive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold bg-sky-600/90 text-white shadow-xs backdrop-blur-md">
            <FolderOpen className="w-3 h-3" />
            DRIVE
          </span>
        );
      case 'google_docs':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold bg-blue-600/90 text-white shadow-xs backdrop-blur-md">
            <FileCode className="w-3 h-3" />
            DOCS
          </span>
        );
      case 'google_sheets':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold bg-emerald-600/90 text-white shadow-xs backdrop-blur-md">
            <FileSpreadsheet className="w-3 h-3" />
            SHEETS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold bg-purple-600/90 text-white shadow-xs backdrop-blur-md">
            <ExternalLink className="w-3 h-3" />
            LINK
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ─── Header & Top Actions ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Study Notes & Resources
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Notes & PDF Cards
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Visual subject cards for downloadable PDF guides and Google Drive resources.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenAddModal('google_drive')}
            className="border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs"
          >
            <FolderOpen className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
            + Google Link
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenAddModal('pdf')}
            className="bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 text-xs"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            + Add PDF
          </Button>
        </div>
      </div>

      {/* ─── Filter & Search Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-950 dark:focus:border-white shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Format pills */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs">
            <button
              onClick={() => setSelectedResourceType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedResourceType === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setSelectedResourceType('pdf')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedResourceType === 'pdf'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              PDFs ({stats.pdfCount})
            </button>
            <button
              onClick={() => setSelectedResourceType('google')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedResourceType === 'google'
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              Google Links ({stats.googleCount})
            </button>
            <button
              onClick={() => setSelectedResourceType('starred')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedResourceType === 'starred'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline" />
            </button>
          </div>

          {/* Grid/List switch */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-900 shadow-2xs font-bold' : 'text-neutral-400'}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-neutral-900 shadow-2xs font-bold' : 'text-neutral-400'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Category Pills ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold shadow-xs'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── Note Cards Grid ─────────────────────────────────────────────────── */}
      {filteredNotes.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs max-w-sm mx-auto my-12">
          <FileText className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-neutral-950 dark:text-white mb-1">
            No notes found
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            Try resetting your filters or add a new PDF note.
          </p>
          <Button variant="primary" size="sm" onClick={() => handleOpenAddModal('pdf')}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add PDF Note
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const isPdf = note.resourceType === 'pdf';
            const thumbUrl = note.thumbnail || CATEGORY_THUMBNAILS[note.category] || CATEGORY_THUMBNAILS['General'];

            return (
              <div
                key={note.id}
                className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 shadow-xs hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                {/* ── Subject-Related Cover Photo with Overlays ── */}
                <div className="relative h-44 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={thumbUrl}
                    alt={note.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Top-Left: Resource Type Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    {renderBadge(note.resourceType)}
                  </div>

                  {/* Top-Right: Quick Pin & Star Icons */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(note.id);
                      }}
                      className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                        note.pinned
                          ? 'bg-indigo-600 text-white'
                          : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70'
                      }`}
                      title={note.pinned ? 'Pinned' : 'Pin note'}
                    >
                      <Pin className={`w-3 h-3 ${note.pinned ? 'fill-white' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(note.id);
                      }}
                      className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                        note.starred
                          ? 'bg-amber-500 text-white'
                          : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70'
                      }`}
                      title={note.starred ? 'Starred' : 'Star note'}
                    >
                      <Star className={`w-3 h-3 ${note.starred ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Bottom-Right: File Size / Pages Pill */}
                  <div className="absolute bottom-2.5 right-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-black/60 backdrop-blur-md text-white/90">
                    {note.fileSize || 'Online'}
                  </div>

                  {/* Bottom-Left: Category Tag */}
                  <div className="absolute bottom-2.5 left-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-900 dark:text-white">
                    {note.category}
                  </div>
                </div>

                {/* ── Card Body: Simple Title & Small Description ── */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Course/Topic */}
                    <div className="text-[10px] font-mono text-neutral-400 truncate mb-1">
                      {note.courseOrTopic}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-neutral-950 dark:text-white leading-snug tracking-tight mb-1.5 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                      {note.title}
                    </h3>

                    {/* Simple & Small Description (1-2 lines max) */}
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                      {note.description || 'Essential revision notes and engineering guide.'}
                    </p>
                  </div>

                  {/* ── Action Buttons Footer ── */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                    {isPdf ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <button
                          onClick={() => setPreviewNote(note)}
                          className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View PDF
                        </button>
                        <a
                          href={note.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-1">
                        <a
                          href={note.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-900/40 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open Link
                        </a>
                        <button
                          onClick={() => setPreviewNote(note)}
                          className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Secondary Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopyLink(note)}
                        className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Copy URL"
                      >
                        {copiedId === note.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(note)}
                        className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Edit Note"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note.id, note.title)}
                        className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Compact List Mode ── */
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredNotes.map((note) => {
                const isPdf = note.resourceType === 'pdf';
                const thumbUrl = note.thumbnail || CATEGORY_THUMBNAILS[note.category] || CATEGORY_THUMBNAILS['General'];

                return (
                  <tr key={note.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30 transition-colors">
                    <td className="py-3 px-4 w-16">
                      <img src={thumbUrl} alt="" className="w-12 h-10 object-cover rounded-xl" />
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center gap-2 mb-0.5">
                        {renderBadge(note.resourceType)}
                        <span className="text-[10px] font-mono text-neutral-400">{note.category}</span>
                      </div>
                      <div className="font-bold text-neutral-950 dark:text-white line-clamp-1">{note.title}</div>
                      <div className="text-[11px] text-neutral-500 line-clamp-1">{note.description}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px] font-mono text-neutral-400 whitespace-nowrap">
                      {note.fileSize}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewNote(note)}
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 text-neutral-500"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={note.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 text-neutral-500"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleCopyLink(note)}
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 text-neutral-500"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id, note.title)}
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-rose-50 text-neutral-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Add / Edit Modal ────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                {editingNote ? 'Edit Note Card' : 'Add Note Resource Card'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type Pills */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setFormResourceType('pdf')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  formResourceType === 'pdf'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-600 dark:text-rose-400 shadow-2xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                PDF Document
              </button>
              <button
                type="button"
                onClick={() => setFormResourceType('google_drive')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  formResourceType === 'google_drive'
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-600 dark:text-sky-400 shadow-2xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-sky-500" />
                Google Link
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3.5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Raft Consensus Algorithm Specification"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-950 dark:focus:border-white"
                />
              </div>

              {/* URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {formResourceType === 'pdf' ? 'PDF Link URL *' : 'Google Drive / Docs URL *'}
                  </label>
                  {formResourceType === 'pdf' && (
                    <label className="text-[10px] text-rose-600 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Select Local File
                      <input type="file" accept=".pdf" onChange={handleSimulatedFileUpload} className="hidden" />
                    </label>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              {/* Category & Course */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Subject Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Topic / Course
                  </label>
                  <input
                    type="text"
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    placeholder="e.g. Distributed Systems"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Cover Photo URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                    Subject Photo URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormThumbnail(CATEGORY_THUMBNAILS[formCategory] || CATEGORY_THUMBNAILS['General'])}
                    className="text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    Auto-pick photo
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-mono truncate"
                  />
                  {formThumbnail && (
                    <img src={formThumbnail} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border" />
                  )}
                </div>
              </div>

              {/* Simple & Small Description */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Short Description (1-2 sentences)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Official whitepaper and key architectural takeaways."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white resize-none"
                />
              </div>

              {/* File Size */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  File Size / Page Count
                </label>
                <input
                  type="text"
                  value={formFileSize}
                  onChange={(e) => setFormFileSize(e.target.value)}
                  placeholder="e.g. 1.4 MB • 18p"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2.5">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white">
                  {editingNote ? 'Save Changes' : 'Add Note Card'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Document Previewer Modal ────────────────────────────────────────── */}
      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-5xl h-[88vh] rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-850/50">
              <div className="flex items-center gap-2.5 truncate">
                {renderBadge(previewNote.resourceType)}
                <div className="truncate">
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white truncate">
                    {previewNote.title}
                  </h3>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {previewNote.fileSize || previewNote.courseOrTopic}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewNote.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Open in New Window
                </a>

                {previewNote.resourceType === 'pdf' && (
                  <a
                    href={previewNote.url}
                    download
                    className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:text-neutral-950 transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => setPreviewNote(null)}
                  className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-950"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-neutral-100 dark:bg-neutral-950 flex flex-col relative overflow-hidden">
              <iframe
                src={
                  previewNote.resourceType === 'google_drive' || previewNote.resourceType === 'google_docs'
                    ? previewNote.url.includes('/preview') || previewNote.url.includes('/view')
                      ? previewNote.url
                      : `${previewNote.url}/preview`
                    : previewNote.url
                }
                title={previewNote.title}
                className="w-full h-full border-0"
              />

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-neutral-900/90 text-white text-xs backdrop-blur-md shadow-lg flex items-center gap-2 border border-white/10">
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  If preview doesn't load:
                </span>
                <a
                  href={previewNote.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-sky-400 hover:text-sky-300"
                >
                  Click here to open directly
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
