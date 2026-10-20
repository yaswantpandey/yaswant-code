import React from 'react';
import { useLms } from '../../context/LmsContext';
import { Footer as FooterSectionComponent, type FooterSection } from '../ui/footer-section';
import { BrandLogo } from '../ui/BrandLogo';
import {
  Github,
  Twitter,
  Linkedin,
  BookOpen,
  FolderGit2,
  Map,
  Users,
  FileText,
  Wrench,
  LayoutDashboard,
  Mail
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, brandName } = useLms();

  const sections: FooterSection[] = [
    {
      label: 'Platform & Learning',
      links: [
        {
          title: 'Capstone Projects',
          href: '/projects',
          icon: FolderGit2,
          onClick: (e) => { e.preventDefault(); setCurrentView('projects'); }
        },
        {
          title: 'Tech Roadmaps',
          href: '/roadmaps',
          icon: Map,
          onClick: (e) => { e.preventDefault(); setCurrentView('learning-paths'); }
        },
        {
          title: 'Community Forums',
          href: '/community',
          icon: Users,
          onClick: (e) => { e.preventDefault(); setCurrentView('community'); }
        },
      ],
    },
    {
      label: 'Resources & Tools',
      links: [
        {
          title: 'Engineering Blog',
          href: '/blog',
          icon: FileText,
          onClick: (e) => { e.preventDefault(); setCurrentView('blog'); }
        },
        {
          title: 'Architecture Kits',
          href: '/resources',
          icon: BookOpen,
          onClick: (e) => { e.preventDefault(); setCurrentView('resources'); }
        },
        {
          title: 'Personal Study Notes',
          href: '/notes',
          icon: FileText,
          onClick: (e) => { e.preventDefault(); setCurrentView('notes'); }
        },
        {
          title: 'Developer Utilities',
          href: '/tools',
          icon: Wrench,
          onClick: (e) => { e.preventDefault(); setCurrentView('tools'); }
        },
      ],
    },
    {
      label: 'Account & Legal',
      links: [
        {
          title: 'Student Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          onClick: (e) => { e.preventDefault(); setCurrentView('student-dashboard'); }
        },
        {
          title: 'Privacy Policy',
          href: '/privacy',
          icon: FileText,
        },
        {
          title: 'Terms of Service',
          href: '/terms',
          icon: FileText,
        },
      ],
    },
    {
      label: 'Social & Connect',
      links: [
        {
          title: 'GitHub',
          href: 'https://github.com/yaswantpandey',
          icon: Github
        },
        {
          title: 'Twitter / X',
          href: 'https://x.com/YaswantP86897',
          icon: Twitter
        },
        {
          title: 'LinkedIn',
          href: 'https://linkedin.com/in/yaswantdev',
          icon: Linkedin
        },
        {
          title: 'Email Support',
          href: 'mailto:contact@yaswant.co.in',
          icon: Mail
        },
      ],
    },
  ];

  const bottomBar = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-3">
      <span>© {new Date().getFullYear()} {brandName}. All rights reserved.</span>
      <a href="mailto:contact@yaswant.co.in" className="hover:text-accent transition-colors">
        contact@yaswant.co.in
      </a>
    </div>
  );

  return (
    <FooterSectionComponent
      brandLogo={
        <BrandLogo
          size="md"
          brandName={brandName}
          onClick={() => setCurrentView('landing')}
        />
      }
      brandName={brandName}
      brandDescription="Roadmaps, projects, study notes and developer tools for engineers who want to ship production systems."
      sections={sections}
      className="mt-24"
      bottomContent={bottomBar}
    />
  );
};
