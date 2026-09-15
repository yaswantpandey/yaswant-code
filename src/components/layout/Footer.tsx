import React from 'react';
import { useLms } from '../../context/LmsContext';
import { Github, Twitter, Linkedin, ArrowUpRight, ShieldCheck, Heart } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

export const Footer: React.FC = () => {
  const { setCurrentView, brandName } = useLms();

  return (
    <footer className="w-full border-t border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/60 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-2">
            <div className="mb-3">
              <BrandLogo
                size="md"
                brandName={brandName}
                onClick={() => setCurrentView('landing')}
              />
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed mb-4">
              The high-velocity learning environment for serious software engineers, distributed systems architects, and machine learning researchers.
            </p>
            <div className="flex items-center gap-3 text-neutral-400">
              <a href="#" className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors" aria-label="GitHub">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Learn Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Platform & Learning
            </h4>
            <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
              <li>
                <button onClick={() => setCurrentView('courses')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  All Courses
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('projects')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Capstone Projects
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('learning-paths')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Learning Paths
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('certificate')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Digital Credentials
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('community')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Community Forums
                </button>
              </li>
            </ul>
          </div>

          {/* Knowledge & Tools Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Resources & Tools
            </h4>
            <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
              <li>
                <button onClick={() => setCurrentView('blog')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Engineering Blog
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('resources')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Free Architecture Kits
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('notes')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Personal Study Notes
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('tools')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Developer Utilities
                </button>
              </li>
            </ul>
          </div>

          {/* Roles Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Dashboards
            </h4>
            <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
              <li>
                <button onClick={() => setCurrentView('student-dashboard')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Student Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('instructor-dashboard')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Instructor Studio
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('admin-dashboard')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Admin Operations
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('course-creation')} className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Course Builder
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Trust & System
            </h4>
            <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>All Systems Normal</span>
              </li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Academic Honor Code</li>
              <li>SOC2 Type II Certified</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} {brandName}. All rights reserved. Phase 1 Frontend UI/UX Design.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with modern Glassmorphism & subtle Bento architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
