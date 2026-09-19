import React from 'react';
import { useLms } from '../../context/LmsContext';
import { Github, Twitter, Linkedin, ShieldCheck, Mail } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

/**
 * Helper: renders a footer nav link as a real <a href> for SEO crawlability
 * while keeping SPA navigation via onClick (e.preventDefault + setCurrentView).
 */
const FooterLink: React.FC<{
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ href, onClick, children }) => (
  <a
    href={href}
    onClick={(e) => { e.preventDefault(); onClick(); }}
    className="hover:text-neutral-950 dark:hover:text-white transition-colors"
  >
    {children}
  </a>
);

export const Footer: React.FC = () => {
  const { setCurrentView, brandName } = useLms();

  return (
    <footer
      className="w-full border-t border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/60 mt-20"
      aria-label="Site footer"
    >
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
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed mb-2">
              The high-velocity learning environment for serious software engineers, distributed systems architects, and machine learning researchers.
            </p>
            {/* Contact / E-E-A-T signal */}
            <a
              href="mailto:admin@yaswantcode.com"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mb-4"
              aria-label="Email Yaswant Code support"
            >
              <Mail className="w-3.5 h-3.5" />
              admin@yaswantcode.com
            </a>
            {/* Social Links — real URLs for entity graph */}
            <div className="flex items-center gap-3 text-neutral-400">
              <a
                href="https://github.com/yaswant-pandey"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
                aria-label="Yaswant Pandey on GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/yaswantcode"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
                aria-label="Yaswant Code on Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/yaswant-pandey"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
                aria-label="Yaswant Pandey on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Learn Col */}
          <nav aria-label="Platform and learning links">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Platform &amp; Learning
            </h4>
            <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
              <li>
                <FooterLink href="/courses" onClick={() => setCurrentView('courses')}>
                  All Courses
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/projects" onClick={() => setCurrentView('projects')}>
                  Capstone Projects
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/roadmaps" onClick={() => setCurrentView('learning-paths')}>
                  Learning Paths
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/certificate" onClick={() => setCurrentView('certificate')}>
                  Digital Credentials
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/community" onClick={() => setCurrentView('community')}>
                  Community Forums
                </FooterLink>
              </li>
            </ul>
          </nav>

          {/* Knowledge & Tools Col */}
          <nav aria-label="Resources and tools links">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Resources &amp; Tools
            </h4>
            <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
              <li>
                <FooterLink href="/blog" onClick={() => setCurrentView('blog')}>
                  Engineering Blog
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/resources" onClick={() => setCurrentView('resources')}>
                  Free Architecture Kits
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/notes" onClick={() => setCurrentView('notes')}>
                  Personal Study Notes
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/tools" onClick={() => setCurrentView('tools')}>
                  Developer Utilities
                </FooterLink>
              </li>
            </ul>
          </nav>

          {/* Roles Col */}
          <nav aria-label="Dashboard links">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Dashboards
            </h4>
            <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
              <li>
                <FooterLink href="/dashboard" onClick={() => setCurrentView('student-dashboard')}>
                  Student Dashboard
                </FooterLink>
              </li>
              <li>
                <a
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.hash = '#admin';
                    setCurrentView('admin-dashboard');
                  }}
                  className="hover:text-amber-500 transition-colors flex items-center gap-1"
                  aria-label="Admin operations panel"
                >
                  <ShieldCheck className="w-3 h-3 text-amber-500" />
                  Admin Operations
                </a>
              </li>
            </ul>
          </nav>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            <span>© {new Date().getFullYear()} {brandName}. All rights reserved.</span>
            {' '}
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            {' '}
            <a
              href="mailto:admin@yaswantcode.com"
              className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              admin@yaswantcode.com
            </a>
          </div>
          <div className="flex items-center gap-1">
            <span>Built with React 19 &amp; Firebase · Made in India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
