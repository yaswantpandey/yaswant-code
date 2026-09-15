import React, { useState, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { MOCK_RESOURCES } from '../data/resourcesData';
import { ResourceItem } from '../types/lms';
import { 
  Download, 
  Copy, 
  ExternalLink, 
  Search, 
  Layers, 
  Server, 
  Compass, 
  Code, 
  Terminal, 
  ShieldCheck, 
  Database, 
  Cpu, 
  FileText, 
  Check, 
  Sparkles, 
  X,
  Eye
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const FreeResourcesPage: React.FC = () => {
  const { addToast } = useLms();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewResource, setPreviewResource] = useState<ResourceItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    'All',
    'Cheat Sheets',
    'Architecture Blueprints',
    'Roadmaps',
    'Starter Kits',
    'Checklists',
  ];

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers': return <Layers className="w-5 h-5 text-indigo-500" />;
      case 'Server': return <Server className="w-5 h-5 text-emerald-500" />;
      case 'Compass': return <Compass className="w-5 h-5 text-amber-500" />;
      case 'Code': return <Code className="w-5 h-5 text-cyan-500" />;
      case 'Terminal': return <Terminal className="w-5 h-5 text-rose-500" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      case 'Database': return <Database className="w-5 h-5 text-purple-500" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-teal-500" />;
      default: return <FileText className="w-5 h-5 text-neutral-400" />;
    }
  };

  const filteredResources = useMemo(() => {
    return MOCK_RESOURCES.filter((res) => {
      const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
      const matchesSearch = 
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Direct real file download generator using Blob
  const handleDownload = (resource: ResourceItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const fileContent = resource.contentSnippet 
      ? resource.contentSnippet.trim() 
      : `# ${resource.title}\n\n${resource.description}\n\nCategory: ${resource.category}\nFormat: ${resource.format}\nTags: ${resource.tags.join(', ')}\n\n© Yaswant Code LMS Knowledge Base.`;
    
    const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = resource.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.href = url;
    link.download = `${safeTitle}-reference.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast(
      'Download started!',
      `Saving "${resource.title}" as local Markdown reference.`,
      'success'
    );
  };

  const handleCopyCommand = (command: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(command);
      setCopiedId(id);
      addToast('Terminal command copied!', command, 'info');
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            100% Free Open Community Assets
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Engineering Free Resources
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Download production-tested architecture blueprints, terminal cheat sheets, interactive career roadmaps, and ready-to-run GitHub boilerplates.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blueprints, cheat sheets..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-950 dark:focus:border-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-sm'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Resources Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            onClick={() => setPreviewResource(resource)}
            className="group p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Header Row: Icon + Badge + Format */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getCategoryIcon(resource.iconName)}
                </div>

                <div className="flex items-center gap-2">
                  {resource.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {resource.badge}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {resource.format}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-neutral-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 leading-snug">
                {resource.title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed mb-4">
                {resource.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {resource.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[10px] bg-neutral-50 dark:bg-neutral-850 text-neutral-500 dark:text-neutral-400 border border-neutral-150 dark:border-neutral-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
              <div className="text-[11px] text-neutral-400 font-mono">
                {resource.downloadsCount.toLocaleString()} downloads
              </div>

              <div className="flex items-center gap-1.5">
                {resource.copyableCommand ? (
                  <button
                    onClick={(e) => handleCopyCommand(resource.copyableCommand!, resource.id, e)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white flex items-center gap-1.5 transition-colors"
                  >
                    {copiedId === resource.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === resource.id ? 'Copied' : 'Command'}</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleDownload(resource, e)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Get File</span>
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewResource(resource);
                  }}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Community Contribution CTA */}
      <div className="rounded-2xl p-6 sm:p-8 bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
            Want to contribute an architecture blueprint or starter template?
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
            Yaswant Code is committed to open knowledge. Submit your production-tested reference guide or boilerplate to be featured in our official repository catalog.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => addToast('Community contribution hub', 'Submit pull requests to github.com/yaswantcode/resources', 'info')}
          className="whitespace-nowrap"
        >
          Submit a Resource
        </Button>
      </div>

      {/* Preview Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  {getCategoryIcon(previewResource.iconName)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {previewResource.title}
                  </h3>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    {previewResource.category} • {previewResource.format} • {previewResource.downloadsCount.toLocaleString()} downloads
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPreviewResource(null)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Preview */}
            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {previewResource.description}
              </p>

              {previewResource.copyableCommand && (
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    Terminal Quickstart Command
                  </label>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs border border-neutral-800">
                    <span className="truncate pr-2">{previewResource.copyableCommand}</span>
                    <button
                      onClick={() => handleCopyCommand(previewResource.copyableCommand!, previewResource.id)}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] shrink-0"
                    >
                      {copiedId === previewResource.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {previewResource.contentSnippet && (
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    Document Content Preview
                  </label>
                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-xs whitespace-pre-line text-neutral-800 dark:text-neutral-300 leading-relaxed max-h-60 overflow-y-auto">
                    {previewResource.contentSnippet}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {previewResource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2 bg-neutral-50/50 dark:bg-neutral-950/50">
              <Button variant="ghost" size="sm" onClick={() => setPreviewResource(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleDownload(previewResource)}>
                <Download className="w-3.5 h-3.5 mr-1" /> Download Reference File
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
