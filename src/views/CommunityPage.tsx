import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { MOCK_DISCUSSIONS } from '../data/mockData';
import { DiscussionThread } from '../types/lms';
import { 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle2, 
  Search, 
  Plus, 
  Filter, 
  Sparkles, 
  Tag, 
  ArrowRight,
  HelpCircle,
  X
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const CommunityPage: React.FC = () => {
  const { addToast } = useLms();
  const [threads, setThreads] = useState<DiscussionThread[]>(MOCK_DISCUSSIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<DiscussionThread['category']>('Frontend');

  const categories = ['All', 'Frontend', 'Backend', 'AI & ML', 'Architecture', 'Career', 'General'];

  const filteredThreads = threads.filter(t => {
    if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchContent = t.content.toLowerCase().includes(q);
      const matchAuthor = t.author.name.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchAuthor) return false;
    }
    return true;
  });

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, upvotes: t.upvotes + 1 };
      }
      return t;
    }));
    addToast("Upvoted", "Discussion thread upvoted!", "success");
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newThread: DiscussionThread = {
      id: `thread-${Date.now()}`,
      title: newTitle,
      content: newContent,
      author: {
        name: 'Alex Mercer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        role: 'Student Engineer'
      },
      category: newCategory,
      tags: ['Discussion', newCategory],
      upvotes: 1,
      repliesCount: 0,
      createdAt: 'Just now',
      hasAcceptedAnswer: false,
      answers: []
    };

    setThreads([newThread, ...threads]);
    setAskModalOpen(false);
    setNewTitle('');
    setNewContent('');
    addToast("Question Published", "Your question was added to the discussion board.", "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
            Peer & Instructor Exchange
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Community Knowledge Exchange
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
            Solve difficult distributed edge cases, discuss architecture RFCs, and get code reviews from peers and staff instructors.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setAskModalOpen(true)}
        >
          Ask a Question
        </Button>
      </div>

      {/* Filter Bar */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions, error messages, architecture topics..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Discussions Feed */}
      <div className="space-y-4">
        {filteredThreads.map((thread) => (
          <GlassCard
            key={thread.id}
            hoverEffect
            className="p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-5 cursor-pointer"
            onClick={() => addToast("Thread Opened", `Viewing discussion: ${thread.title}`, "info")}
          >
            {/* Upvote Button Column */}
            <button
              onClick={(e) => handleUpvote(thread.id, e)}
              className="flex sm:flex-col items-center gap-1.5 px-3 py-2 sm:px-2 sm:py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-750 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shrink-0 group"
            >
              <ThumbsUp className="w-4 h-4 text-neutral-500 group-hover:text-neutral-950 dark:group-hover:text-white" />
              <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">
                {thread.upvotes}
              </span>
            </button>

            {/* Thread Main Content */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                <Badge variant="neutral" size="sm">{thread.category}</Badge>
                <span>•</span>
                <span>Posted by <strong className="text-neutral-700 dark:text-neutral-300">{thread.author.name}</strong></span>
                <span>•</span>
                <span>{thread.createdAt}</span>
                {thread.hasAcceptedAnswer && (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Answered
                  </Badge>
                )}
              </div>

              <h3 className="text-base font-bold text-neutral-950 dark:text-white leading-snug">
                {thread.title}
              </h3>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                {thread.content}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {thread.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-xs text-neutral-400 font-medium">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{thread.repliesCount} responses</span>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Ask Question Modal */}
      {askModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Start a Discussion or Ask a Question
              </h3>
              <button onClick={() => setAskModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to handle concurrent writes in PostgreSQL with Prisma?"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DiscussionThread['category'])}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Career">Career</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Details & Code Context
                </label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe what you tried, logs encountered, or architecture questions..."
                  className="w-full p-3 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setAskModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Post Discussion
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
