import React, { useState, useEffect, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  Plus, 
  FolderOpen, 
  FileArchive, 
  Layers, 
  Monitor, 
  Apple, 
  Terminal, 
  Grid, 
  List, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle2, 
  Sparkles,
  Info,
  Tag,
  Share2,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export interface DevToolItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'DevOps & Docker' | 'IDE & Editors' | 'Database GUI' | 'API & Backend' | 'Full-Stack Kits' | 'Utilities';
  downloadType: 'zip' | 'drive' | 'direct';
  downloadUrl: string;
  fileSize: string;
  version: string;
  osSupport: ('Windows' | 'macOS' | 'Linux' | 'Cross-Platform')[];
  thumbnail: string;
  downloadsCount: number;
  featured?: boolean;
  updatedAt: string;
  author: string;
}

export const TOOL_CATEGORY_THUMBNAILS: Record<string, string> = {
  'DevOps & Docker': 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&auto=format&fit=crop&q=80',
  'IDE & Editors': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
  'Database GUI': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
  'API & Backend': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  'Full-Stack Kits': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
  'Utilities': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
};

const TOOLS_STORAGE_KEY = 'yaswant_code_dev_tools_v1';

export const ToolsPage: React.FC = () => {
  const { addToast } = useLms();

  // Load tools from localStorage or empty array
  const [tools, setTools] = useState<DevToolItem[]>(() => {
    try {
      const saved = localStorage.getItem(TOOLS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Fetch live tools from backend API
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const res = await fetch('/api/tools.php');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setTools(json.data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch tools from API:', err);
      }
    };
    fetchTools();
  }, []);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'zip' | 'drive'>('all');
  const [selectedOs, setSelectedOs] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State for Add / Edit Tool
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTool, setEditingTool] = useState<DevToolItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formTagline, setFormTagline] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formCategory, setFormCategory] = useState<DevToolItem['category']>('DevOps & Docker');
  const [formDownloadType, setFormDownloadType] = useState<'zip' | 'drive'>('zip');
  const [formDownloadUrl, setFormDownloadUrl] = useState<string>('');
  const [formFileSize, setFormFileSize] = useState<string>('');
  const [formVersion, setFormVersion] = useState<string>('v1.0.0');
  const [formThumbnail, setFormThumbnail] = useState<string>('');
  const [formOs, setFormOs] = useState<string[]>(['Windows', 'macOS', 'Linux']);
  const [formAuthor, setFormAuthor] = useState<string>('Yaswant Pandey');

  // Load live developer tools from MariaDB database
  useEffect(() => {
    fetch('/api/tools.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setTools(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(TOOLS_STORAGE_KEY, JSON.stringify(tools));
    } catch {
      // ignore
    }
  }, [tools]);

  const categories = [
    'All',
    'DevOps & Docker',
    'IDE & Editors',
    'Database GUI',
    'API & Backend',
    'Full-Stack Kits',
    'Utilities',
  ];

  // Auto-pick thumbnail when category changes
  const handleCategoryChange = (newCat: DevToolItem['category']) => {
    setFormCategory(newCat);
    if (!formThumbnail || Object.values(TOOL_CATEGORY_THUMBNAILS).includes(formThumbnail)) {
      setFormThumbnail(TOOL_CATEGORY_THUMBNAILS[newCat] || TOOL_CATEGORY_THUMBNAILS['Utilities']);
    }
  };

  // Filtered tools
  const filteredTools = useMemo(() => {
    return tools
      .filter((tool) => {
        const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
        const matchesType = selectedType === 'all' || tool.downloadType === selectedType;
        const matchesOs =
          selectedOs === 'All' ||
          tool.osSupport.includes('Cross-Platform') ||
          tool.osSupport.some((os) => os.toLowerCase() === selectedOs.toLowerCase());

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          tool.name.toLowerCase().includes(q) ||
          tool.tagline.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q) ||
          tool.category.toLowerCase().includes(q) ||
          tool.version.toLowerCase().includes(q) ||
          tool.author.toLowerCase().includes(q);

        return matchesCategory && matchesType && matchesOs && matchesSearch;
      })
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [tools, selectedCategory, selectedType, selectedOs, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = tools.length;
    const zipCount = tools.filter((t) => t.downloadType === 'zip').length;
    const driveCount = tools.filter((t) => t.downloadType === 'drive').length;
    const totalDownloads = tools.reduce((acc, t) => acc + (t.downloadsCount || 0), 0);
    return { total, zipCount, driveCount, totalDownloads };
  }, [tools]);

  // Handlers
  const handleOpenAddModal = (type: 'zip' | 'drive' = 'zip') => {
    setEditingTool(null);
    setFormDownloadType(type);
    setFormName('');
    setFormTagline('');
    setFormDescription('');
    setFormCategory('DevOps & Docker');
    setFormDownloadUrl('');
    setFormFileSize(type === 'zip' ? '25 MB • ZIP' : 'Google Drive Link');
    setFormVersion('v1.0.0');
    setFormThumbnail(TOOL_CATEGORY_THUMBNAILS['DevOps & Docker']);
    setFormOs(['Windows', 'macOS', 'Linux']);
    setFormAuthor('Yaswant Pandey');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (tool: DevToolItem) => {
    setEditingTool(tool);
    setFormDownloadType(tool.downloadType === 'drive' ? 'drive' : 'zip');
    setFormName(tool.name);
    setFormTagline(tool.tagline);
    setFormDescription(tool.description);
    setFormCategory(tool.category);
    setFormDownloadUrl(tool.downloadUrl);
    setFormFileSize(tool.fileSize);
    setFormVersion(tool.version);
    setFormThumbnail(tool.thumbnail || TOOL_CATEGORY_THUMBNAILS[tool.category]);
    setFormOs(tool.osSupport);
    setFormAuthor(tool.author);
    setIsAddModalOpen(true);
  };

  const handleSaveTool = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      addToast('Name required', 'Please provide a tool name.', 'warning');
      return;
    }

    if (!formDownloadUrl.trim()) {
      addToast('Download link required', 'Please provide a Google Drive or ZIP URL.', 'warning');
      return;
    }

    let cleanUrl = formDownloadUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const fallbackThumb = TOOL_CATEGORY_THUMBNAILS[formCategory] || TOOL_CATEGORY_THUMBNAILS['Utilities'];
    const now = new Date().toISOString().split('T')[0];

    if (editingTool) {
      setTools((prev) =>
        prev.map((t) =>
          t.id === editingTool.id
            ? {
                ...t,
                name: formName.trim(),
                tagline: formTagline.trim() || formCategory,
                description: formDescription.trim() || 'Developer tool & utility archive.',
                category: formCategory,
                downloadType: formDownloadType,
                downloadUrl: cleanUrl,
                fileSize: formFileSize.trim() || 'Direct Download',
                version: formVersion.trim() || 'v1.0.0',
                osSupport: formOs.length > 0 ? (formOs as any) : ['Cross-Platform'],
                thumbnail: formThumbnail.trim() || fallbackThumb,
                author: formAuthor.trim() || 'Yaswant Pandey',
                updatedAt: now,
              }
            : t
        )
      );
      addToast('Tool Updated', `"${formName}" has been updated.`, 'success');
    } else {
      const newTool: DevToolItem = {
        id: `tool-${Date.now()}`,
        name: formName.trim(),
        tagline: formTagline.trim() || formCategory,
        description: formDescription.trim() || 'Developer tool & utility archive.',
        category: formCategory,
        downloadType: formDownloadType,
        downloadUrl: cleanUrl,
        fileSize: formFileSize.trim() || (formDownloadType === 'zip' ? 'ZIP Archive' : 'Google Drive'),
        version: formVersion.trim() || 'v1.0.0',
        osSupport: formOs.length > 0 ? (formOs as any) : ['Cross-Platform'],
        thumbnail: formThumbnail.trim() || fallbackThumb,
        author: formAuthor.trim() || 'Yaswant Pandey',
        downloadsCount: 1,
        featured: false,
        updatedAt: now,
      };

      setTools([newTool, ...tools]);
      addToast('Tool Added!', `New ${formDownloadType.toUpperCase()} tool card published.`, 'success');
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteTool = (toolId: string, name: string) => {
    if (confirm(`Remove "${name}" from tool directory?`)) {
      setTools((prev) => prev.filter((t) => t.id !== toolId));
      addToast('Tool removed', `"${name}" was deleted.`, 'info');
    }
  };

  const handleCopyLink = (tool: DevToolItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tool.downloadUrl);
      setCopiedId(tool.id);
      addToast('Link copied!', 'Download link copied to clipboard.', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleTriggerDownload = (tool: DevToolItem) => {
    // Increment download counter
    setTools((prev) =>
      prev.map((t) => (t.id === tool.id ? { ...t, downloadsCount: (t.downloadsCount || 0) + 1 } : t))
    );
    addToast('Starting Download', `Downloading ${tool.name}...`, 'info');
  };

  const toggleOsSelection = (os: string) => {
    setFormOs((prev) =>
      prev.includes(os) ? prev.filter((item) => item !== os) : [...prev, os]
    );
  };

  // Render OS Badges
  const renderOsPills = (osList: DevToolItem['osSupport']) => {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-medium">
        {osList.includes('Windows') && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750">
            <Monitor className="w-2.5 h-2.5" /> Windows
          </span>
        )}
        {osList.includes('macOS') && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750">
            <Apple className="w-2.5 h-2.5" /> macOS
          </span>
        )}
        {osList.includes('Linux') && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750">
            <Terminal className="w-2.5 h-2.5" /> Linux
          </span>
        )}
        {osList.includes('Cross-Platform') && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750">
            Cross-Platform
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ─── Top Header & Share Actions ───────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Developer Software & Utilities Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Developer Tools & ZIP Downloads
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Download production developer environments, pre-configured ZIP archives, and shared Google Drive toolkits directly with zero paywalls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenAddModal('drive')}
            className="border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs"
          >
            <FolderOpen className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
            + Google Drive Tool
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenAddModal('zip')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 text-xs"
          >
            <FileArchive className="w-3.5 h-3.5 mr-1.5" />
            + Share ZIP Archive
          </Button>
        </div>
      </div>

      {/* ─── Metric KPI Badges ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-1">
            <span>Total Toolkits</span>
            <Layers className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight">
            {stats.total}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Software & bundles</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-emerald-200/60 dark:border-emerald-900/40 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
            <span>ZIP Archives</span>
            <FileArchive className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {stats.zipCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Direct 1-click downloads</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-sky-200/60 dark:border-sky-900/40 shadow-xs">
          <div className="flex items-center justify-between text-xs text-sky-600 dark:text-sky-400 font-medium mb-1">
            <span>Google Drive Toolkits</span>
            <FolderOpen className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 tracking-tight">
            {stats.driveCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Shared cloud repositories</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-amber-200/60 dark:border-amber-900/40 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
            <span>Total Community Downloads</span>
            <Download className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {stats.totalDownloads.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Verified downloads</div>
        </div>
      </div>

      {/* ─── Search, Filter & View Controls ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools, dockers, environments, extensions..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-950 dark:focus:border-white shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Format pills */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedType === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setSelectedType('zip')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                selectedType === 'zip'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              <FileArchive className="w-3.5 h-3.5 text-emerald-500" />
              ZIP Only ({stats.zipCount})
            </button>
            <button
              onClick={() => setSelectedType('drive')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                selectedType === 'drive'
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-sky-500" />
              Drive Links ({stats.driveCount})
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

      {/* ─── Category Filter Pills ────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold shadow-xs'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── Tool Cards Grid ─────────────────────────────────────────────────── */}
      {filteredTools.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs max-w-sm mx-auto my-12">
          <FileArchive className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-neutral-950 dark:text-white mb-1">
            No tools found
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            Try resetting your filters or upload a new tool ZIP link.
          </p>
          <Button variant="primary" size="sm" onClick={() => handleOpenAddModal('zip')}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add ZIP Tool
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const isZip = tool.downloadType === 'zip';

            return (
              <div
                key={tool.id}
                className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 shadow-xs hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                {/* Top Image with Badges */}
                <div className="relative h-44 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={tool.thumbnail}
                    alt={tool.name}
                    width={640}
                    height={360}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Top-Left: Type Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    {isZip ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold bg-emerald-600/90 text-white shadow-xs backdrop-blur-md">
                        <FileArchive className="w-3 h-3" />
                        ZIP ARCHIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold bg-sky-600/90 text-white shadow-xs backdrop-blur-md">
                        <FolderOpen className="w-3 h-3" />
                        GOOGLE DRIVE
                      </span>
                    )}
                  </div>

                  {/* Top-Right: Version Badge */}
                  <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-white/90">
                    {tool.version}
                  </div>

                  {/* Bottom-Right: File Size */}
                  <div className="absolute bottom-2.5 right-3 z-10 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-white">
                    {tool.fileSize}
                  </div>

                  {/* Bottom-Left: Category Tag */}
                  <div className="absolute bottom-2.5 left-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-900 dark:text-white">
                    {tool.category}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* OS Support Chips */}
                    <div className="mb-2">
                      {renderOsPills(tool.osSupport)}
                    </div>

                    {/* Tool Name */}
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white leading-snug tracking-tight mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {tool.name}
                    </h3>

                    {/* Tagline */}
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 line-clamp-1 mb-2">
                      {tool.tagline}
                    </p>

                    {/* Short Description */}
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                      {tool.description}
                    </p>
                  </div>

                  {/* Metadata & Direct Download Bar */}
                  <div>
                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 font-mono mb-3.5">
                      <span>By {tool.author}</span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-neutral-400" />
                        {tool.downloadsCount} downloads
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {isZip ? (
                        <a
                          href={tool.downloadUrl}
                          download
                          onClick={() => handleTriggerDownload(tool)}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download ZIP
                        </a>
                      ) : (
                        <a
                          href={tool.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleTriggerDownload(tool)}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-600/20"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open Drive Link
                        </a>
                      )}

                      {/* Copy Link */}
                      <button
                        onClick={() => handleCopyLink(tool)}
                        className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Copy Download URL"
                      >
                        {copiedId === tool.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEditModal(tool)}
                        className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Edit Tool Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteTool(tool.id, tool.name)}
                        className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Tool"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Compact Table Mode ── */
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredTools.map((tool) => {
                const isZip = tool.downloadType === 'zip';

                return (
                  <tr key={tool.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30 transition-colors">
                    <td className="py-3 px-4 w-16">
                      <img src={tool.thumbnail} alt="" className="w-12 h-10 object-cover rounded-xl" />
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center gap-2 mb-0.5">
                        {isZip ? (
                          <span className="text-[10px] font-mono font-bold text-emerald-600">ZIP</span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-sky-600">DRIVE</span>
                        )}
                        <span className="text-[10px] font-mono text-neutral-400">{tool.category}</span>
                        <span className="text-[10px] font-mono text-neutral-400">{tool.version}</span>
                      </div>
                      <div className="font-bold text-neutral-950 dark:text-white line-clamp-1">{tool.name}</div>
                      <div className="text-[11px] text-neutral-500 line-clamp-1">{tool.tagline}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderOsPills(tool.osSupport)}
                    </td>
                    <td className="py-3 px-4 text-[11px] font-mono text-neutral-500 whitespace-nowrap">
                      {tool.fileSize}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {isZip ? (
                          <a
                            href={tool.downloadUrl}
                            download
                            onClick={() => handleTriggerDownload(tool)}
                            className="py-1 px-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Download
                          </a>
                        ) : (
                          <a
                            href={tool.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleTriggerDownload(tool)}
                            className="py-1 px-2.5 rounded-lg text-xs font-bold bg-sky-600 text-white flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Drive
                          </a>
                        )}
                        <button
                          onClick={() => handleCopyLink(tool)}
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-950"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteTool(tool.id, tool.name)}
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
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

      {/* ─── Add / Edit Tool Modal ───────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                  {editingTool ? 'Edit Tool Resource' : 'Share Developer Tool / ZIP Link'}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Anyone will be able to download this tool or open the shared Google Drive folder.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type Switcher */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setFormDownloadType('zip')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  formDownloadType === 'zip'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <FileArchive className="w-3.5 h-3.5 text-emerald-500" />
                ZIP Archive Download
              </button>
              <button
                type="button"
                onClick={() => setFormDownloadType('drive')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  formDownloadType === 'drive'
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-600 dark:text-sky-400 shadow-2xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-sky-500" />
                Google Drive Link
              </button>
            </div>

            <form onSubmit={handleSaveTool} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tool Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Full-Stack Docker Development Environment"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-950"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tagline (Short Feature Highlight)
                </label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. One-click stack with MySQL, Redis, Nginx & Node.js"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                />
              </div>

              {/* Download / Drive URL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {formDownloadType === 'zip' ? 'Direct ZIP Download URL *' : 'Google Drive Folder / File URL *'}
                </label>
                <input
                  type="text"
                  required
                  value={formDownloadUrl}
                  onChange={(e) => setFormDownloadUrl(e.target.value)}
                  placeholder={
                    formDownloadType === 'zip'
                      ? 'https://.../download.zip or github zip link'
                      : 'https://drive.google.com/drive/folders/...'
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              {/* Category & Version */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
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
                    Version / Release
                  </label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    placeholder="e.g. v2.4.0 or 2026 Edition"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* OS Compatibility Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Operating System Support
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {['Windows', 'macOS', 'Linux', 'Cross-Platform'].map((os) => (
                    <button
                      key={os}
                      type="button"
                      onClick={() => toggleOsSelection(os)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        formOs.includes(os)
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent font-bold'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {os}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Photo */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                    Cover Photo URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormThumbnail(TOOL_CATEGORY_THUMBNAILS[formCategory] || TOOL_CATEGORY_THUMBNAILS['Utilities'])}
                    className="text-[10px] text-neutral-400 hover:text-neutral-900"
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

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description (1-2 sentences)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explain what is included in this tool / ZIP bundle..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white resize-none"
                />
              </div>

              {/* File Size & Author */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Size / Package
                  </label>
                  <input
                    type="text"
                    value={formFileSize}
                    onChange={(e) => setFormFileSize(e.target.value)}
                    placeholder="e.g. 18.4 MB • ZIP"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Author / Creator
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="e.g. Yaswant Pandey"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2.5">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {editingTool ? 'Save Changes' : 'Publish Tool'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
