import React, { useState, useMemo } from 'react';
import { useLms } from '../../context/LmsContext';
import { MOCK_COURSES, MOCK_LEARNING_PATHS, MOCK_INSTRUCTORS, MOCK_DISCUSSIONS } from '../../data/mockData';
import { MOCK_BLOG_POSTS } from '../../data/blogData';
import { MOCK_RESOURCES } from '../../data/resourcesData';
import { MOCK_PROJECTS } from '../../data/projectsData';
import { 
  Search, 
  X, 
  BookOpen, 
  Sparkles, 
  User, 
  MessageSquare, 
  ArrowRight, 
  Command,
  Flame,
  Clock,
  FileText,
  DownloadCloud,
  FolderGit2
} from 'lucide-react';
import { Badge } from './Badge';

export const SearchModal: React.FC = () => {
  const { 
    searchModalOpen, 
    setSearchModalOpen, 
    setCurrentView, 
    setSelectedCourse 
  } = useLms();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'paths' | 'projects' | 'articles' | 'resources'>('all');

  const popularSearches = [
    'Google Drive & Workspace',
    'React 19 Server Actions',
    'PyTorch Transformers',
    'Kubernetes GitOps',
    'Rust eBPF',
    'System Design',
    'Design Tokens'
  ];

  const recentSearches = [
    'Next.js 15 Caching',
    'Distributed Raft Consensus',
    'Dr. Elena Vance'
  ];

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    const matchedCourses = MOCK_COURSES.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) ||
      c.skills.some(s => s.toLowerCase().includes(q))
    );

    const matchedPaths = MOCK_LEARNING_PATHS.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.skillsCovered.some(s => s.toLowerCase().includes(q))
    );

    const matchedInstructors = MOCK_INSTRUCTORS.filter(i => 
      i.name.toLowerCase().includes(q) || 
      i.expertise.some(e => e.toLowerCase().includes(q))
    );

    const matchedDiscussions = MOCK_DISCUSSIONS.filter(d => 
      d.title.toLowerCase().includes(q) || 
      d.tags.some(t => t.toLowerCase().includes(q))
    );

    const matchedArticles = MOCK_BLOG_POSTS.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.excerpt.toLowerCase().includes(q) ||
      b.tags.some(t => t.toLowerCase().includes(q))
    );

    const matchedResources = MOCK_RESOURCES.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q))
    );

    const matchedProjects = MOCK_PROJECTS.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.techStack.some(t => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    );

    return {
      courses: matchedCourses,
      paths: matchedPaths,
      instructors: matchedInstructors,
      discussions: matchedDiscussions,
      articles: matchedArticles,
      resources: matchedResources,
      projects: matchedProjects,
      totalCount: matchedCourses.length + matchedPaths.length + matchedInstructors.length + matchedDiscussions.length + matchedArticles.length + matchedResources.length + matchedProjects.length
    };
  }, [query]);

  if (!searchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-neutral-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, lessons, instructors, discussions, or skills..."
            className="w-full bg-transparent text-base text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setSearchModalOpen(false)}
            className="text-xs font-semibold px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-neutral-50 dark:bg-neutral-950/40 border-b border-neutral-200/60 dark:border-neutral-800/60 overflow-x-auto text-xs">
          {(['all', 'courses', 'projects', 'paths', 'articles', 'resources', 'instructors', 'discussions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full capitalize font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950' 
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {!results ? (
            /* Suggestions & Recents when input is empty */
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                  <Clock className="w-3.5 h-3.5" /> Recent Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((item) => (
                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-xs text-neutral-700 dark:text-neutral-300 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" /> Popular Topics & Queries
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((item) => (
                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-xs text-neutral-700 dark:text-neutral-300 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 flex items-center justify-between">
                <span>Tip: Press <kbd className="font-mono bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded text-[11px] text-neutral-800 dark:text-neutral-200">Cmd + K</kbd> anywhere to bring up global search.</span>
                <Command className="w-4 h-4 text-neutral-400" />
              </div>
            </div>
          ) : results.totalCount === 0 ? (
            /* Empty state for search */
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 mx-auto flex items-center justify-center text-neutral-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">No matching results found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                We couldn't find anything matching &ldquo;{query}&rdquo;. Try searching for broader terms like &ldquo;React&rdquo;, &ldquo;Cloud&rdquo;, or &ldquo;PyTorch&rdquo;.
              </p>
            </div>
          ) : (
            /* Categorized search results */
            <div className="space-y-6">
              {/* Courses */}
              {(activeTab === 'all' || activeTab === 'courses') && results.courses.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Courses</span>
                    <span>{results.courses.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.courses.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => {
                          setSelectedCourse(course);
                          setCurrentView('course-detail');
                          setSearchModalOpen(false);
                        }}
                        className="p-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={course.thumbnail} alt={course.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{course.title}</h4>
                            <p className="text-xs text-neutral-500 truncate">{course.instructor.name} • {course.difficulty} • {course.durationHours} hrs</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Paths */}
              {(activeTab === 'all' || activeTab === 'paths') && results.paths.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Learning Paths</span>
                    <span>{results.paths.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.paths.map((path) => (
                      <div
                        key={path.id}
                        onClick={() => {
                          setCurrentView('learning-paths');
                          setSearchModalOpen(false);
                        }}
                        className="p-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div>
                          <div className="text-sm font-semibold text-neutral-900 dark:text-white">{path.title}</div>
                          <div className="text-xs text-neutral-500">{path.estimatedDuration} • {path.coursesCount} Courses</div>
                        </div>
                        <Badge variant="purple" size="sm">{path.difficulty}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructors */}
              {(activeTab === 'all' || activeTab === 'instructors') && results.instructors.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Instructors</span>
                    <span>{results.instructors.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.instructors.map((inst) => (
                      <div
                        key={inst.id}
                        onClick={() => {
                          setCurrentView('instructor-profile');
                          setSearchModalOpen(false);
                        }}
                        className="p-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img src={inst.avatar} alt={inst.name} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <div className="text-sm font-semibold text-neutral-900 dark:text-white">{inst.name}</div>
                            <div className="text-xs text-neutral-500 truncate max-w-sm">{inst.role}</div>
                          </div>
                        </div>
                        <span className="text-xs text-amber-500 font-bold">★ {inst.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discussions */}
              {(activeTab === 'all' || activeTab === 'discussions') && results.discussions.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Community Threads</span>
                    <span>{results.discussions.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.discussions.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setCurrentView('community');
                          setSearchModalOpen(false);
                        }}
                        className="p-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{d.title}</div>
                          <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                            <span>{d.author.name}</span> • <span>{d.upvotes} upvotes</span> • <span>{d.repliesCount} replies</span>
                          </div>
                        </div>
                        <Badge variant="neutral" size="sm">{d.category}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Engineering Blog Articles */}
              {(activeTab === 'all' || activeTab === 'articles') && results.articles.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Blog & Insights</span>
                    <span>{results.articles.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.articles.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => {
                          setCurrentView('blog');
                          setSearchModalOpen(false);
                        }}
                        className="p-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{art.title}</div>
                          <div className="text-xs text-neutral-500 truncate">{art.author.name} • {art.readTimeMinutes} min read • {art.category}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Free Resources */}
              {(activeTab === 'all' || activeTab === 'resources') && results.resources.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><DownloadCloud className="w-3.5 h-3.5" /> Free Engineering Resources</span>
                    <span>{results.resources.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.resources.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => {
                          setCurrentView('resources');
                          setSearchModalOpen(false);
                        }}
                        className="p-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{res.title}</div>
                          <div className="text-xs text-neutral-500 truncate">{res.category} • {res.format}</div>
                        </div>
                        <Badge variant="blue" size="sm">{res.format}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Capstone Projects */}
              {(activeTab === 'all' || activeTab === 'projects') && results.projects.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><FolderGit2 className="w-3.5 h-3.5 text-emerald-500" /> Capstone Projects</span>
                    <span>{results.projects.length}</span>
                  </div>
                  <div className="space-y-2">
                    {results.projects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => {
                          setCurrentView('projects');
                          setSearchModalOpen(false);
                        }}
                        className="p-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{proj.title}</div>
                          <div className="text-xs text-neutral-500 truncate">{proj.category} • {proj.difficulty} • ~{proj.estimatedHours} hrs</div>
                        </div>
                        <Badge variant="emerald" size="sm">Project</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
