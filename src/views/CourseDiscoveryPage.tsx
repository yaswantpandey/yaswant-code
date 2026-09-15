import React, { useState, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { Course } from '../types/lms';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Bookmark, 
  Star, 
  Clock, 
  BookOpen, 
  ChevronDown, 
  X, 
  SlidersHorizontal,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const CourseDiscoveryPage: React.FC = () => {
  const { 
    courses, 
    setCurrentView, 
    setSelectedCourse, 
    bookmarkedCourseIds, 
    toggleBookmark,
    emptyStateSimulated
  } = useLms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedPriceType, setSelectedPriceType] = useState<'All' | 'Free' | 'Paid'>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'price-low' | 'price-high'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories = ['All', 'Web Development', 'AI & Machine Learning', 'Cloud & DevOps', 'Systems & Security', 'Design & UX'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  const filteredCourses = useMemo(() => {
    if (emptyStateSimulated) return [];

    return courses.filter((c) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        const matchesSkills = c.skills.some(s => s.toLowerCase().includes(q));
        const matchesInstructor = c.instructor.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSkills && !matchesInstructor) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && c.category !== selectedCategory) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'All' && c.difficulty !== selectedDifficulty) {
        return false;
      }

      // Rating filter
      if (selectedRating > 0 && c.rating < selectedRating) {
        return false;
      }

      // Price filter
      if (selectedPriceType === 'Free' && c.price > 0) return false;
      if (selectedPriceType === 'Paid' && c.price === 0) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.studentsCount - a.studentsCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });
  }, [courses, searchQuery, selectedCategory, selectedDifficulty, selectedRating, selectedPriceType, sortBy, emptyStateSimulated]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedRating(0);
    setSelectedPriceType('All');
    setSortBy('popular');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
          Catalog & Discovery
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          Explore Technical Masterclasses
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
          Deep-dive coursework in modern web development, distributed backend architecture, machine learning systems, and cloud infrastructure.
        </p>
      </div>

      {/* Search Bar & Primary Filter Controls */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          
          {/* Search Input with quick clear */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, skill, topic, or instructor name..."
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-neutral-100/70 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Category Tabs for Large screens */}
          <div className="hidden xl:flex items-center gap-1 overflow-x-auto">
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & View Mode Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Releases</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Grid / List Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Filter Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            >
              Filters
            </Button>
          </div>

        </div>
      </GlassCard>

      {/* Main Catalog Layout: Left Filters + Right Course List/Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Filter Sidebar */}
        <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6`}>
          <GlassCard className="p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Filter Courses
              </span>
              <button
                onClick={resetFilters}
                className="text-[11px] text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Discipline / Category
              </label>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      selectedCategory === cat
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <span className="text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Experience Level
              </label>
              <div className="space-y-1.5">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      selectedDifficulty === diff
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>{diff}</span>
                    {selectedDifficulty === diff && <span className="text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Minimum Rating
              </label>
              <div className="space-y-1.5">
                {[0, 4.5, 4.8, 4.9].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSelectedRating(rate)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      selectedRating === rate
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>{rate === 0 ? 'All Ratings' : `★ ${rate} & above`}</span>
                    {selectedRating === rate && <span className="text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Pricing
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['All', 'Paid', 'Free'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPriceType(p)}
                    className={`py-1.5 rounded-lg text-xs font-medium text-center transition-colors ${
                      selectedPriceType === p
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

          </GlassCard>
        </div>

        {/* Right Content Area: Results Count + Cards Grid/List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
            <span>
              Showing <strong className="text-neutral-900 dark:text-white">{filteredCourses.length}</strong> masterclasses
            </span>
            {(selectedCategory !== 'All' || selectedDifficulty !== 'All' || searchQuery) && (
              <span className="text-neutral-400">
                Filters applied
              </span>
            )}
          </div>

          {/* Empty State */}
          {filteredCourses.length === 0 ? (
            <GlassCard className="p-12 text-center my-6">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 mx-auto flex items-center justify-center text-neutral-400 mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
                No courses match your criteria
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6 leading-relaxed">
                We couldn't find any courses matching the selected filters or search query. Try adjusting your keywords or clearing filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={resetFilters}
              >
                Reset All Filters
              </Button>
            </GlassCard>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const isBookmarked = bookmarkedCourseIds.includes(course.id);

                return (
                  <GlassCard
                    key={course.id}
                    hoverEffect
                    className="overflow-hidden flex flex-col cursor-pointer group"
                    onClick={() => {
                      setSelectedCourse(course);
                      setCurrentView('course-detail');
                    }}
                  >
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                        {course.isBestseller && (
                          <Badge variant="primary" size="sm">Bestseller</Badge>
                        )}
                        <Badge variant="neutral" size="sm">{course.difficulty}</Badge>
                      </div>

                      {/* Bookmark toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(course.id);
                        }}
                        className={`absolute top-2.5 right-2.5 p-1.5 rounded-xl backdrop-blur-md transition-colors ${
                          isBookmarked
                            ? 'bg-amber-500 text-white'
                            : 'bg-neutral-950/60 text-white hover:bg-neutral-950/90'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Course'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>

                      {/* Duration & Lessons Pill */}
                      <div className="absolute bottom-2.5 right-2.5 bg-neutral-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-mono text-white">
                        {course.durationHours}h • {course.lessonsCount} lessons
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1.5">
                          <span>{course.category}</span>
                          <span className="flex items-center gap-1 font-semibold text-amber-500">
                            ★ {course.rating} <span className="text-neutral-400 font-normal">({course.reviewsCount})</span>
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors line-clamp-2 mb-1.5">
                          {course.title}
                        </h3>

                        <p className="text-xs text-neutral-500 line-clamp-2 mb-3 leading-relaxed">
                          {course.tagline}
                        </p>
                      </div>

                      <div>
                        {/* Enrolled progress indicator if applicable */}
                        {course.enrolled && course.progressPercent !== undefined && (
                          <div className="mb-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-500 mb-1">
                              <span>Enrolled Progress</span>
                              <span className="text-neutral-900 dark:text-white">{course.progressPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${course.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={course.instructor.avatar}
                              alt={course.instructor.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[110px]">
                              {course.instructor.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-neutral-900 dark:text-white">
                              ${course.price}
                            </span>
                            {course.originalPrice && (
                              <span className="text-[11px] text-neutral-400 line-through ml-1 font-mono">
                                ${course.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredCourses.map((course) => {
                const isBookmarked = bookmarkedCourseIds.includes(course.id);

                return (
                  <GlassCard
                    key={course.id}
                    hoverEffect
                    className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-5 cursor-pointer group"
                    onClick={() => {
                      setSelectedCourse(course);
                      setCurrentView('course-detail');
                    }}
                  >
                    <div className="relative w-full sm:w-56 aspect-video sm:aspect-auto sm:h-36 rounded-xl overflow-hidden shrink-0 bg-neutral-900">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        {course.isBestseller && (
                          <Badge variant="primary" size="sm">Bestseller</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="neutral" size="sm">{course.category}</Badge>
                            <span>•</span>
                            <span>{course.difficulty}</span>
                          </div>
                          <span className="flex items-center gap-1 font-semibold text-amber-500">
                            ★ {course.rating} <span className="text-neutral-400 font-normal">({course.reviewsCount})</span>
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-neutral-950 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors mb-1">
                          {course.title}
                        </h3>

                        <p className="text-xs text-neutral-500 line-clamp-2 mb-3 leading-relaxed">
                          {course.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {course.skills.slice(0, 4).map((skill) => (
                            <span key={skill} className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          <span className="flex items-center gap-1.5">
                            <img src={course.instructor.avatar} alt={course.instructor.name} className="w-5 h-5 rounded-full object-cover" />
                            <strong className="text-neutral-700 dark:text-neutral-300">{course.instructor.name}</strong>
                          </span>
                          <span>•</span>
                          <span>{course.durationHours}h total</span>
                          <span>•</span>
                          <span>{course.lessonsCount} lessons</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-base font-bold text-neutral-900 dark:text-white">${course.price}</span>
                            {course.originalPrice && (
                              <span className="text-xs text-neutral-400 line-through ml-1.5 font-mono">${course.originalPrice}</span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(course.id);
                            }}
                            className={`p-2 rounded-xl transition-colors ${
                              isBookmarked
                                ? 'bg-amber-500 text-white'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
