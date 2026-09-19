import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLms } from '../context/LmsContext';
import { StudyNote, NoteResourceType } from '../types/lms';
import { tokenStorage } from '../services/api';
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
  Image as ImageIcon,
  Sparkles,
  Database,
  Server,
  Globe,
  Cpu,
  Terminal,
  BookOpen,
  Share2,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const NOTE_CATEGORY_THUMBNAILS: Record<string, string> = {
  'Data Structures & Algorithms': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
  'Languages & Programming': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
  'Core CS & B.Tech': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
  'System Design': 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80',
  'React & Web': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
  'Distributed Systems': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  'Databases & SQL': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
  'Machine Learning': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
  'DevOps & Cloud': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
  'General': 'https://images.unsplash.com/photo-1516116211227-bbc13c6b2452?w=800&auto=format&fit=crop&q=80'
};

export const NOTE_CATEGORIES = [
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
] as const;

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Data Structures & Algorithms': <Cpu className="w-3.5 h-3.5 text-rose-500" />,
  'Languages & Programming': <Terminal className="w-3.5 h-3.5 text-amber-500" />,
  'Core CS & B.Tech': <BookOpen className="w-3.5 h-3.5 text-blue-500" />,
  'System Design': <Server className="w-3.5 h-3.5 text-purple-500" />,
  'React & Web': <Globe className="w-3.5 h-3.5 text-sky-500" />,
  'Distributed Systems': <Layers className="w-3.5 h-3.5 text-indigo-500" />,
  'Databases & SQL': <Database className="w-3.5 h-3.5 text-emerald-500" />,
  'Machine Learning': <Sparkles className="w-3.5 h-3.5 text-pink-500" />,
  'DevOps & Cloud': <Terminal className="w-3.5 h-3.5 text-teal-500" />,
  'General': <FileText className="w-3.5 h-3.5 text-neutral-500" />
};

const STARRED_NOTES_KEY = 'yaswant_user_starred_notes';
const CACHED_NOTES_KEY = 'yaswant_code_study_notes_v3';

export const NotesPage: React.FC = () => {
  const { addToast, role } = useLms();

  // Check if current user is an authorized admin
  const isAdmin = useMemo(() => {
    if (role === 'admin') return true;
    const user = tokenStorage.getUser<{ role?: string }>();
    return user?.role === 'admin';
  }, [role]);

  // Notes state initialized from cache if present
  const [notes, setNotes] = useState<StudyNote[]>(() => {
    try {
      const saved = localStorage.getItem(CACHED_NOTES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(notes.length === 0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Student's personal starred/favorited note IDs
  const [starredNoteIds, setStarredNoteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STARRED_NOTES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STARRED_NOTES_KEY, JSON.stringify(starredNoteIds));
    } catch {}
  }, [starredNoteIds]);

  // Fetch live study notes from MariaDB database
  const fetchNotes = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const res = await fetch('/api/notes.php');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setNotes(json.data);
          try {
            localStorage.setItem(CACHED_NOTES_KEY, JSON.stringify(json.data));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Could not load notes from database:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Filters & Sorting View State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedResourceType, setSelectedResourceType] = useState<'all' | 'pdf' | 'google' | 'starred'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'category'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);
  const [previewNote, setPreviewNote] = useState<StudyNote | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State for Add / Edit Modal
  const [formResourceType, setFormResourceType] = useState<NoteResourceType>('pdf');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formCourse, setFormCourse] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Data Structures & Algorithms');
  const [formThumbnail, setFormThumbnail] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formFileSize, setFormFileSize] = useState<string>('');
  const [formAuthor, setFormAuthor] = useState<string>('Yaswant Pandey');

  // Category change thumbnail helper
  const handleCategoryChange = (newCat: string) => {
    setFormCategory(newCat);
    if (!formThumbnail || Object.values(NOTE_CATEGORY_THUMBNAILS).includes(formThumbnail)) {
      setFormThumbnail(NOTE_CATEGORY_THUMBNAILS[newCat] || NOTE_CATEGORY_THUMBNAILS['General']);
    }
  };

  // Filtered & Sorted Notes
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
          matchesType = starredNoteIds.includes(note.id) || !!note.starred;
        }

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (note.title && note.title.toLowerCase().includes(q)) ||
          (note.description && note.description.toLowerCase().includes(q)) ||
          (note.courseOrTopic && note.courseOrTopic.toLowerCase().includes(q)) ||
          (note.category && note.category.toLowerCase().includes(q)) ||
          (note.author && note.author.toLowerCase().includes(q)) ||
          (Array.isArray(note.tags) && note.tags.some(t => t.toLowerCase().includes(q)));

        return matchesCategory && matchesType && matchesSearch;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'category') {
          return (a.category || '').localeCompare(b.category || '');
        }
        return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
      });
  }, [notes, selectedCategory, selectedResourceType, searchQuery, sortBy, starredNoteIds]);

  // Statistics
  const stats = useMemo(() => {
    const total = notes.length;
    const pdfCount = notes.filter((n) => n.resourceType === 'pdf').length;
    const googleCount = notes.filter((n) => ['google_drive', 'google_docs', 'google_sheets', 'google_slides'].includes(n.resourceType)).length;
    const starredCount = notes.filter((n) => starredNoteIds.includes(n.id) || n.starred).length;
    return { total, pdfCount, googleCount, starredCount };
  }, [notes, starredNoteIds]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: notes.length };
    notes.forEach(n => {
      const cat = n.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [notes]);

  // Handlers
  const handleOpenAddModal = (type: NoteResourceType = 'pdf') => {
    setEditingNote(null);
    setFormResourceType(type);
    setFormTitle('');
    setFormUrl('');
    setFormCourse('');
    setFormCategory('Data Structures & Algorithms');
    setFormThumbnail(NOTE_CATEGORY_THUMBNAILS['Data Structures & Algorithms']);
    setFormDescription('');
    setFormFileSize(type === 'pdf' ? '2.5 MB • 20p' : 'Google Drive');
    setFormAuthor('Yaswant Pandey');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (note: StudyNote) => {
    setEditingNote(note);
    setFormResourceType(note.resourceType);
    setFormTitle(note.title);
    setFormUrl(note.url);
    setFormCourse(note.courseOrTopic || note.category);
    setFormCategory(note.category || 'General');
    setFormThumbnail(note.thumbnail || NOTE_CATEGORY_THUMBNAILS[note.category] || NOTE_CATEGORY_THUMBNAILS['General']);
    setFormDescription(note.description || '');
    setFormFileSize(note.fileSize || '');
    setFormAuthor(note.author || 'Yaswant Pandey');
    setIsAddModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
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

    const fallbackThumb = NOTE_CATEGORY_THUMBNAILS[formCategory] || NOTE_CATEGORY_THUMBNAILS['General'];
    const now = new Date().toISOString().split('T')[0];
    setIsSubmitting(true);

    try {
      const isEditing = Boolean(editingNote);
      const payload = {
        ...(isEditing ? { id: editingNote?.id } : {}),
        title: formTitle.trim(),
        topic: formCourse.trim() || formCategory,
        category: formCategory,
        resourceType: formResourceType,
        url: cleanUrl,
        fileSize: formFileSize.trim() || (formResourceType === 'pdf' ? 'PDF File' : 'Google Drive'),
        thumbnail: formThumbnail.trim() || fallbackThumb,
        description: formDescription.trim() || 'Verified revision guide and hand notes.',
        author: formAuthor.trim() || 'Yaswant Pandey',
        pinned: editingNote?.pinned || false,
        starred: editingNote?.starred || false,
        tags: [formCategory].join(', ')
      };

      const token = tokenStorage.get();
      if (token && isAdmin) {
        const action = isEditing ? 'update_note' : 'create_note';
        const res = await fetch(`/api/admin.php?action=${action}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to save to database.');
        }
      }

      // Live state update
      if (editingNote) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === editingNote.id
              ? {
                  ...n,
                  title: formTitle.trim(),
                  url: cleanUrl,
                  courseOrTopic: formCourse.trim() || formCategory,
                  category: formCategory as any,
                  thumbnail: formThumbnail.trim() || fallbackThumb,
                  description: formDescription.trim(),
                  fileSize: formFileSize.trim(),
                  author: formAuthor.trim(),
                  resourceType: formResourceType,
                  previewUrl: cleanUrl,
                  updatedAt: now,
                }
              : n
          )
        );
        addToast('Note Updated', `"${formTitle}" successfully saved to database.`, 'success');
      } else {
        const newNote: StudyNote = {
          id: `note-${Date.now()}`,
          title: formTitle.trim(),
          url: cleanUrl,
          courseOrTopic: formCourse.trim() || formCategory,
          category: formCategory as any,
          thumbnail: formThumbnail.trim() || fallbackThumb,
          description: formDescription.trim() || 'Verified revision guide and hand notes.',
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
        setNotes((prev) => [newNote, ...prev]);
        addToast('Resource Added!', `"${formTitle}" published successfully.`, 'success');
      }

      setIsAddModalOpen(false);
      fetchNotes();
    } catch (err: any) {
      addToast('Error Saving Note', err.message || 'Could not save note to database.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string, title: string) => {
    if (!window.confirm(`Permanently delete "${title}" from study notes?`)) return;

    try {
      const token = tokenStorage.get();
      if (token && isAdmin) {
        const res = await fetch('/api/admin.php?action=delete_note', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id: noteId })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to delete note.');
        }
      }

      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      addToast('Note Removed', `"${title}" has been deleted.`, 'info');
      fetchNotes();
    } catch (err: any) {
      addToast('Delete Failed', err.message || 'Could not delete note.', 'warning');
    }
  };

  const handleToggleStar = (noteId: string) => {
    setStarredNoteIds((prev) => {
      const exists = prev.includes(noteId);
      const next = exists ? prev.filter((id) => id !== noteId) : [...prev, noteId];
      addToast(
        exists ? 'Removed from Starred' : 'Saved to Starred',
        exists ? 'Resource removed from favorites.' : 'Resource pinned to your starred list.',
        'info'
      );
      return next;
    });
  };

  const handleCopyLink = (note: StudyNote) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(note.url);
      setCopiedId(note.id);
      addToast('Direct Link Copied', `${note.title} URL copied to clipboard.`, 'success');
      setTimeout(() => setCopiedId(null), 2500);
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
      addToast('File Selected', `${file.name} attached (${sizeMB} MB).`, 'info');
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold bg-indigo-600/90 text-white shadow-xs backdrop-blur-md">
            <ExternalLink className="w-3 h-3" />
            LINK
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* ─── Hero Header & Mission Bar ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Verified Engineering & B.Tech Handbooks
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              Authored by Yaswant Pandey
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
            Study Notes & Architecture Guides
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Downloadable hand-crafted engineering notes, B.Tech computer science curriculum, data structures, and enterprise architecture summaries — 100% free and open access for students.
          </p>
        </div>

        {/* Top Actions & Admin Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNotes(true)}
            disabled={isRefreshing}
            className="text-xs"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            title="Reload live database notes"
          >
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </Button>

          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAddModal('google_drive')}
                className="border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs"
                icon={<FolderOpen className="w-3.5 h-3.5 text-sky-500" />}
              >
                + Google Link
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenAddModal('pdf')}
                className="bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 text-xs"
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                + Add PDF Note
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ─── Metric KPI Badges Strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/80 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-neutral-900 dark:text-white text-sm">{stats.total} Master Notes</div>
            <div className="text-[11px] text-neutral-500">{stats.pdfCount} PDFs Available</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/80 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-neutral-900 dark:text-white text-sm">{stats.googleCount} Cloud Docs</div>
            <div className="text-[11px] text-neutral-500">Google Drive & Sheets</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/80 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-neutral-900 dark:text-white text-sm">{Object.keys(categoryCounts).length - 1} Domains</div>
            <div className="text-[11px] text-neutral-500">B.Tech, DSA, DevOps</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/80 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="font-bold text-neutral-900 dark:text-white text-sm">{stats.starredCount} Starred</div>
            <div className="text-[11px] text-neutral-500">Saved in Your Library</div>
          </div>
        </div>
      </div>

      {/* ─── Search & View Toolbar ───────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input with Instant Clear */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, topic, DSA, B.Tech, or technology..."
            className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Resource Filter Pills & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format pills */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs">
            <button
              onClick={() => setSelectedResourceType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedResourceType === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setSelectedResourceType('pdf')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedResourceType === 'pdf'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              PDFs ({stats.pdfCount})
            </button>
            <button
              onClick={() => setSelectedResourceType('google')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedResourceType === 'google'
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              Google Links ({stats.googleCount})
            </button>
            <button
              onClick={() => setSelectedResourceType('starred')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                selectedResourceType === 'starred'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Starred ({stats.starredCount})</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-850 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400 ml-1.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-neutral-700 dark:text-neutral-300 font-medium focus:outline-none pr-1 cursor-pointer"
            >
              <option value="recent">Newest First</option>
              <option value="title">Title (A–Z)</option>
              <option value="category">By Category</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-900 shadow-2xs font-bold text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-600'}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-neutral-900 shadow-2xs font-bold text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-600'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Category Horizontal Scroll Bar ──────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar text-xs">
        {NOTE_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const count = categoryCounts[cat] || 0;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold shadow-xs'
                  : 'bg-neutral-50 dark:bg-neutral-850/90 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {CATEGORY_ICONS[cat] || <FileText className="w-3.5 h-3.5" />}
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isActive
                  ? 'bg-white/20 text-white dark:bg-neutral-950/20 dark:text-neutral-950'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Skeleton Loading State ──────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 overflow-hidden animate-pulse h-80 flex flex-col justify-between p-4">
              <div className="h-44 bg-neutral-200 dark:bg-neutral-800 rounded-2xl mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md w-3/4" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-md w-1/2" />
              </div>
              <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        /* ─── Clean Empty State ─── */
        <div className="p-12 text-center rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 max-w-md mx-auto my-8 space-y-3">
          <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="text-base font-bold text-neutral-950 dark:text-white">
            No study notes found
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            No resources match your current filter query. Try selecting another category or clear your search bar.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedResourceType('all');
                setSearchQuery('');
              }}
            >
              Reset All Filters
            </Button>
            {isAdmin && (
              <Button variant="primary" size="sm" onClick={() => handleOpenAddModal('pdf')}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Note
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* ─── Bento Grid View ─── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const isPdf = note.resourceType === 'pdf';
            const thumbUrl = note.thumbnail || NOTE_CATEGORY_THUMBNAILS[note.category] || NOTE_CATEGORY_THUMBNAILS['General'];
            const isStarred = starredNoteIds.includes(note.id) || !!note.starred;

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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Top-Left: Resource Type Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    {renderBadge(note.resourceType)}
                  </div>

                  {/* Top-Right: Quick Pin & Star Icons */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                    {note.pinned && (
                      <span className="p-1.5 rounded-lg backdrop-blur-md bg-indigo-600 text-white shadow-xs" title="Pinned by Instructor">
                        <Pin className="w-3 h-3 fill-white" />
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(note.id);
                      }}
                      className={`p-1.5 rounded-lg backdrop-blur-md transition-colors cursor-pointer ${
                        isStarred
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70'
                      }`}
                      title={isStarred ? 'Remove Star' : 'Save to Starred Library'}
                    >
                      <Star className={`w-3 h-3 ${isStarred ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Bottom-Right: File Size / Pages Pill */}
                  <div className="absolute bottom-2.5 right-3 z-10 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-black/60 backdrop-blur-md text-white/90">
                    {note.fileSize || 'Online Access'}
                  </div>

                  {/* Bottom-Left: Category Tag */}
                  <div className="absolute bottom-2.5 left-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-900 dark:text-white">
                    {note.category}
                  </div>
                </div>

                {/* ── Card Body: Title & Meta ── */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Course/Topic */}
                    <div className="text-[10px] font-mono font-semibold text-neutral-400 truncate mb-1">
                      {note.courseOrTopic || note.category}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-neutral-950 dark:text-white leading-snug tracking-tight mb-1.5 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                      {note.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                      {note.description || 'Verified engineering notes and practical architecture takeaways.'}
                    </p>

                    {/* Author Stamp */}
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium mb-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>{note.author || 'Yaswant Pandey'}</span>
                    </div>
                  </div>

                  {/* ── Action Buttons Footer ── */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                    {isPdf ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <button
                          onClick={() => setPreviewNote(note)}
                          className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
                          title="Download PDF file directly"
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
                          className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-900/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open Link
                        </a>
                        <button
                          onClick={() => setPreviewNote(note)}
                          className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
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
                        className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Copy note URL"
                      >
                        {copiedId === note.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(note)}
                            className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            title="Edit Note (Admin)"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id, note.title)}
                            className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete Note (Admin)"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── Compact Table List Mode ─── */
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredNotes.map((note) => {
                const thumbUrl = note.thumbnail || NOTE_CATEGORY_THUMBNAILS[note.category] || NOTE_CATEGORY_THUMBNAILS['General'];
                const isStarred = starredNoteIds.includes(note.id) || !!note.starred;

                return (
                  <tr key={note.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30 transition-colors">
                    <td className="py-3 px-4 w-16">
                      <img src={thumbUrl} alt="" className="w-12 h-10 object-cover rounded-xl border border-neutral-200 dark:border-neutral-700" />
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center gap-2 mb-0.5">
                        {renderBadge(note.resourceType)}
                        <span className="text-[10px] font-mono text-neutral-400 font-semibold">{note.category}</span>
                      </div>
                      <div className="font-bold text-neutral-950 dark:text-white line-clamp-1">{note.title}</div>
                      <div className="text-[11px] text-neutral-500 line-clamp-1">{note.description}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px] font-mono text-neutral-400 whitespace-nowrap">
                      {note.fileSize || 'Online'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStar(note.id)}
                          className={`p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer ${
                            isStarred ? 'bg-amber-500 text-white' : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                          }`}
                          title="Star note"
                        >
                          <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-white' : ''}`} />
                        </button>
                        <button
                          onClick={() => setPreviewNote(note)}
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 cursor-pointer"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={note.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                          title="Direct Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleCopyLink(note)}
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(note)}
                              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 cursor-pointer"
                              title="Edit Note (Admin)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id, note.title)}
                              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 cursor-pointer"
                              title="Delete Note (Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Add / Edit Modal (Admin Protected) ───────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" />
                {editingNote ? 'Edit Study Note' : 'Add Study Note to MariaDB'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type Selector Pills */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormResourceType('pdf')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  formResourceType === 'pdf'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-600 dark:text-rose-400 shadow-2xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                PDF Document
              </button>
              <button
                type="button"
                onClick={() => setFormResourceType('google_drive')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  formResourceType === 'google_drive'
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-600 dark:text-sky-400 shadow-2xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-sky-500" />
                Google Drive Link
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3.5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Complete Data Structures & Algorithms Hand Notes"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {formResourceType === 'pdf' ? 'PDF URL or Endpoint *' : 'Google Drive Link *'}
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
                  placeholder="https://yaswant.co.in/notes/..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Category & Topic */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Engineering Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                  >
                    {NOTE_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Course / Topic Tag
                  </label>
                  <input
                    type="text"
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    placeholder="e.g. B.Tech CS 3rd Sem"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Cover Photo URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                    Cover Image URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormThumbnail(NOTE_CATEGORY_THUMBNAILS[formCategory] || NOTE_CATEGORY_THUMBNAILS['General'])}
                    className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
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
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono truncate focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  {formThumbnail && (
                    <img src={formThumbnail} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-neutral-200 dark:border-neutral-700" />
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Essential revision notes, algorithm complexities, and visual diagrams."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white resize-none focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* File Size & Author */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    File Size / Page Count
                  </label>
                  <input
                    type="text"
                    value={formFileSize}
                    onChange={(e) => setFormFileSize(e.target.value)}
                    placeholder="e.g. 1.8 MB • 24p"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Author Credit
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="Yaswant Pandey"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2.5">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="bg-rose-600 hover:bg-rose-700 text-white">
                  {editingNote ? 'Save Changes' : 'Publish Note to MariaDB'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Document Previewer Modal ────────────────────────────────────────── */}
      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-5xl h-[88vh] rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/70 dark:bg-neutral-850/70">
              <div className="flex items-center gap-2.5 truncate">
                {renderBadge(previewNote.resourceType)}
                <div className="truncate">
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white truncate">
                    {previewNote.title}
                  </h3>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {previewNote.fileSize || previewNote.courseOrTopic || previewNote.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewNote.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Open in New Window
                </a>

                {previewNote.resourceType === 'pdf' && (
                  <a
                    href={previewNote.url}
                    download
                    className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Direct Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => setPreviewNote(null)}
                  className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
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
                  Having trouble viewing in browser?
                </span>
                <a
                  href={previewNote.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-sky-400 hover:text-sky-300"
                >
                  Click to open PDF directly
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
