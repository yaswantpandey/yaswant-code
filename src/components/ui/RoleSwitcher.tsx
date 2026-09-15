import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { ActiveView, RoleType } from '../../types/lms';
import { 
  Compass, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Settings as SettingsIcon, 
  HelpCircle,
  Eye,
  Sliders,
  ChevronDown,
  X,
  FileText,
  DownloadCloud,
  Edit3,
  Wrench,
  FolderGit2,
  Cloud
} from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    role, 
    setRole, 
    brandName, 
    setBrandName,
    emptyStateSimulated,
    toggleEmptyState
  } = useLms();

  const [expanded, setExpanded] = useState(false);
  const [editingBrand, setEditingBrand] = useState(false);
  const [brandInput, setBrandInput] = useState(brandName);

  const views: { id: ActiveView; label: string; icon: any; category: string }[] = [
    { id: 'landing', label: '1. Landing Page', icon: Compass, category: 'Public' },
    { id: 'courses', label: '2. Course Discovery', icon: BookOpen, category: 'Public' },
    { id: 'course-detail', label: '3. Course Details', icon: BookOpen, category: 'Public' },
    { id: 'blog', label: 'Engineering Blog', icon: FileText, category: 'Public' },
    { id: 'resources', label: 'Free Resources', icon: DownloadCloud, category: 'Public' },
    { id: 'notes', label: 'Study Notes & Pad', icon: Edit3, category: 'Learner' },
    { id: 'tools', label: 'Developer Tools', icon: Wrench, category: 'Learner' },
    { id: 'projects', label: 'Capstone Projects', icon: FolderGit2, category: 'Learner' },
    { id: 'workspace', label: 'Google Workspace Hub', icon: Cloud, category: 'Learner' },
    { id: 'student-dashboard', label: '4. Student Dashboard', icon: GraduationCap, category: 'Learner' },
    { id: 'learning-interface', label: '5. Learning Player', icon: BookOpen, category: 'Learner' },
    { id: 'quiz', label: '6. Quiz Interface', icon: HelpCircle, category: 'Learner' },
    { id: 'assignment', label: '7. Assignment & Project', icon: Sliders, category: 'Learner' },
    { id: 'certificate', label: '8. Certificate Verification', icon: ShieldCheck, category: 'Learner' },
    { id: 'learning-paths', label: '9. Learning Paths', icon: Sparkles, category: 'Learner' },
    { id: 'instructor-profile', label: '10. Instructor Profile', icon: GraduationCap, category: 'Community' },
    { id: 'community', label: '11. Community Discussions', icon: Sparkles, category: 'Community' },
    { id: 'student-profile', label: '12. Public Student Profile', icon: GraduationCap, category: 'Community' },
    { id: 'instructor-dashboard', label: '15. Instructor Dashboard', icon: Sliders, category: 'Instructor' },
    { id: 'course-creation', label: '16. Course Creation Wizard', icon: BookOpen, category: 'Instructor' },
    { id: 'admin-dashboard', label: '17. Admin SaaS Dashboard', icon: ShieldCheck, category: 'Admin' },
    { id: 'settings', label: '19. Settings & Preferences', icon: SettingsIcon, category: 'Account' },
  ];

  const handleBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandInput.trim()) {
      setBrandName(brandInput.trim());
    }
    setEditingBrand(false);
  };

  return (
    <aside aria-label="Demo role and page switcher" className="fixed bottom-20 md:bottom-4 left-2 sm:left-4 z-30 md:z-50 max-w-[calc(100vw-1rem)]">
      <div className="bg-neutral-950/90 text-white backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl p-1.5 flex items-center gap-1.5 sm:gap-2 transition-all">
        {/* Toggle Panel Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 transition-colors"
          title="Browse all 20 designed UI screens"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-neutral-400 hidden sm:inline">Screen:</span>
          <span className="text-white font-bold truncate max-w-[90px] sm:max-w-[140px]">
            {views.find(v => v.id === currentView)?.label.replace(/^\d+\.\s*/, '') || currentView}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Quick Persona Pills */}
        <div className="hidden sm:flex items-center gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800 text-[11px]">
          {(['student', 'instructor', 'admin', 'guest'] as RoleType[]).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                if (r === 'student') setCurrentView('student-dashboard');
                if (r === 'instructor') setCurrentView('instructor-dashboard');
                if (r === 'admin') setCurrentView('admin-dashboard');
                if (r === 'guest') setCurrentView('landing');
              }}
              className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                role === r 
                  ? 'bg-white text-neutral-950 font-bold shadow-sm' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Empty state tester toggle */}
        <button
          onClick={toggleEmptyState}
          className={`px-2 sm:px-2.5 py-1.5 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors ${
            emptyStateSimulated 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
          }`}
          title="Simulate empty/zero-data states across pages"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{emptyStateSimulated ? 'Empty: ON' : 'Empty'}</span>
        </button>
      </div>

      {/* Expanded Quick Navigation Dropdown Modal */}
      {expanded && (
        <div className="absolute bottom-14 left-0 w-[calc(100vw-2rem)] sm:w-96 max-w-sm max-h-[75vh] overflow-y-auto bg-neutral-950/95 backdrop-blur-2xl border border-neutral-800 rounded-2xl shadow-2xl p-4 text-white z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">Design Explorer</div>
              <div className="text-sm font-semibold text-white">Select Any UI Screen</div>
            </div>
            <button 
              onClick={() => setExpanded(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Brand Customizer Affordance */}
          <div className="mb-4 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
            <div className="text-[11px] font-medium text-neutral-400 mb-1">Brand Name Token:</div>
            {editingBrand ? (
              <form onSubmit={handleBrandSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={brandInput}
                  onChange={(e) => setBrandInput(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-700 px-2 py-1 rounded text-xs text-white focus:outline-none focus:border-white"
                  placeholder="e.g. Synthetix LMS"
                  autoFocus
                />
                <button 
                  type="submit"
                  className="bg-white text-neutral-950 px-2 py-1 rounded font-semibold text-xs"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-mono text-emerald-400 font-semibold">{brandName}</span>
                <button 
                  onClick={() => setEditingBrand(true)}
                  className="text-neutral-400 hover:text-white underline text-[11px]"
                >
                  Edit Name
                </button>
              </div>
            )}
          </div>

          {/* Grouped View Links */}
          <div className="space-y-3">
            {['Public', 'Learner', 'Community', 'Instructor', 'Admin', 'Account'].map((cat) => (
              <div key={cat}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 px-2">
                  {cat} Screens
                </div>
                <div className="space-y-1">
                  {views.filter(v => v.category === cat).map((v) => {
                    const Icon = v.icon;
                    const isActive = currentView === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setCurrentView(v.id);
                          setExpanded(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isActive 
                            ? 'bg-white text-neutral-950 font-bold' 
                            : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                          <span className="truncate">{v.label}</span>
                        </div>
                        {isActive && <span className="text-[10px] bg-neutral-900 text-white px-1.5 py-0.5 rounded">Active</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
