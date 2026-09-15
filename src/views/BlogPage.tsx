import React, { useState, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { MOCK_BLOG_POSTS } from '../data/blogData';
import { BlogPost } from '../types/lms';
import { 
  BookOpen, 
  Search, 
  Clock, 
  Heart, 
  Eye, 
  Share2, 
  Bookmark, 
  ArrowRight, 
  Sparkles, 
  X, 
  Check, 
  ArrowLeft,
  Flame,
  Tag
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const BlogPage: React.FC = () => {
  const { addToast } = useLms();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});
  const [emailInput, setEmailInput] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const categories = [
    'All',
    'Distributed Systems',
    'AI & ML',
    'Frontend Architecture',
    'Rust & Systems',
    'Cloud Native',
    'DevOps & Tooling',
  ];

  const filteredPosts = useMemo(() => {
    return MOCK_BLOG_POSTS.filter((post) => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = MOCK_BLOG_POSTS.find(p => p.featured) || MOCK_BLOG_POSTS[0];

  const handleToggleLike = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isLiked = !!likedPosts[postId];
    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    if (!isLiked) {
      addToast('Appreciation recorded!', 'Thanks for supporting technical open writing.', 'success');
    }
  };

  const handleToggleBookmark = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isBookmarked = !!bookmarkedPosts[postId];
    setBookmarkedPosts(prev => ({ ...prev, [postId]: !isBookmarked }));
    addToast(
      isBookmarked ? 'Removed from reading list' : 'Saved to reading list',
      'You can access saved articles in your dashboard anytime.',
      'info'
    );
  };

  const handleShare = (post: BlogPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!', post.title, 'success');
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      addToast('Subscribed to Engineering Dispatch!', 'You will receive weekly architectural teardowns.', 'success');
      setEmailInput('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Engineering Knowledge Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Engineering Blog & Deep Dives
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            In-depth architectural breakdowns, zero-copy systems in Rust, React 19 concurrent patterns, and distributed consensus written by staff practitioners.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, tags, authors..."
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

      {/* Featured Post Hero Banner (Shown when no search query and 'All' category) */}
      {!searchQuery && selectedCategory === 'All' && featuredPost && (
        <div 
          onClick={() => setActivePost(featuredPost)}
          className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white mb-12 cursor-pointer group border border-neutral-800 shadow-2xl transition-all hover:border-neutral-700"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px]">
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between z-10">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Featured Article
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    {featuredPost.category}
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {featuredPost.readingTime}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight group-hover:text-neutral-200 transition-colors mb-3">
                  {featuredPost.title}
                </h2>
                <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed max-w-xl">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{featuredPost.author.name}</div>
                    <div className="text-[11px] text-neutral-400">{featuredPost.author.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full overflow-hidden">
              <img
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-neutral-900 via-neutral-900/40 to-transparent" />
            </div>
          </div>
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Latest Technical Articles</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
              {filteredPosts.length}
            </span>
          </h3>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <BookOpen className="w-10 h-10 text-neutral-400 mx-auto mb-3 opacity-50" />
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">No articles found</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-4">
              We couldn't find any articles matching "{searchQuery}". Try selecting a different topic filter.
            </p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const isLiked = !!likedPosts[post.id];
              const isBookmarked = !!bookmarkedPosts[post.id];

              return (
                <article
                  key={post.id}
                  onClick={() => setActivePost(post)}
                  className="group rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-lg transition-all flex flex-col cursor-pointer overflow-hidden"
                >
                  {/* Card Image */}
                  <div className="relative aspect-16/9 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-neutral-950/80 text-white backdrop-blur-md">
                        {post.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleToggleBookmark(post.id, e)}
                        className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                          isBookmarked
                            ? 'bg-neutral-950 text-white'
                            : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950'
                        }`}
                        title="Save to bookmarks"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mb-2">
                        <span>{post.publishedAt}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.readingTime}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-neutral-950 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors leading-snug line-clamp-2 mb-2">
                        {post.title}
                      </h4>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed mb-4">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-xs font-semibold text-neutral-900 dark:text-white leading-tight">
                            {post.author.name}
                          </div>
                          <div className="text-[10px] text-neutral-400 leading-tight">
                            {post.author.role.split(' ')[0]}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-neutral-400 text-xs font-mono">
                        <button
                          onClick={(e) => handleToggleLike(post.id, e)}
                          className={`flex items-center gap-1 hover:text-rose-500 transition-colors ${
                            isLiked ? 'text-rose-500 font-bold' : ''
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                          <span>{post.likesCount + (isLiked ? 1 : 0)}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Newsletter Dispatch Subscription */}
      <div className="rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white p-8 sm:p-12 border border-neutral-800 shadow-xl mb-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">
            The Weekly Systems Dispatch
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">
            Curated engineering whitepapers, real production outage teardowns, and advanced architectural benchmarks delivered straight to your inbox every Thursday. Zero promotional spam.
          </p>

          {subscribed ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> You're on the list! Welcome to the insider dispatch.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="developer@company.com"
                className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:border-white"
              />
              <Button variant="primary" size="md" type="submit">
                Subscribe Free
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Full Article Reader Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900 sticky top-0 z-10">
              <button
                onClick={() => setActivePost(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Articles
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleLike(activePost.id)}
                  className={`p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs flex items-center gap-1.5 transition-colors ${
                    likedPosts[activePost.id] 
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900' 
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${likedPosts[activePost.id] ? 'fill-rose-500' : ''}`} />
                  <span>{activePost.likesCount + (likedPosts[activePost.id] ? 1 : 0)}</span>
                </button>

                <button
                  onClick={() => handleShare(activePost)}
                  className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  title="Share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setActivePost(null)}
                  className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Article Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <span className="font-bold text-neutral-900 dark:text-white uppercase">{activePost.category}</span>
                <span>•</span>
                <span>{activePost.publishedAt}</span>
                <span>•</span>
                <span>{activePost.readingTime}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white leading-tight">
                {activePost.title}
              </h1>

              {/* Author Row */}
              <div className="flex items-center gap-3 py-3 border-y border-neutral-100 dark:border-neutral-800">
                <img
                  src={activePost.author.avatar}
                  alt={activePost.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-bold text-neutral-950 dark:text-white">
                    {activePost.author.name}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {activePost.author.role}
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="rounded-xl overflow-hidden aspect-16/9 bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={activePost.coverImage}
                  alt={activePost.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Markdown Content formatting */}
              <div className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 text-sm leading-relaxed space-y-4">
                <p className="text-base font-medium text-neutral-700 dark:text-neutral-300 leading-relaxed border-l-2 border-neutral-900 dark:border-white pl-4 italic">
                  {activePost.excerpt}
                </p>

                <div className="whitespace-pre-line font-sans text-xs sm:text-sm">
                  {activePost.content}
                </div>
              </div>

              {/* Tags */}
              <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-2">
                {activePost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
