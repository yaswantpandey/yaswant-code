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
  Award, 
  Users, 
  FileText, 
  Wrench, 
  LayoutDashboard, 
  ShieldCheck,
  Mail
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, brandName } = useLms();

  const sections: FooterSection[] = [
    {
      label: 'Platform & Learning',
      links: [
        { 
          title: 'All Courses', 
          href: '/courses', 
          icon: BookOpen,
          onClick: (e) => { e.preventDefault(); setCurrentView('courses'); } 
        },
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
          title: 'Digital Credentials', 
          href: '/certificate', 
          icon: Award,
          onClick: (e) => { e.preventDefault(); setCurrentView('certificate'); } 
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
      label: 'Dashboards',
      links: [
        { 
          title: 'Student Dashboard', 
          href: '/dashboard', 
          icon: LayoutDashboard,
          onClick: (e) => { e.preventDefault(); setCurrentView('student-dashboard'); } 
        },
        { 
          title: 'Admin Operations', 
          href: '/admin', 
          icon: ShieldCheck,
          onClick: (e) => { 
            e.preventDefault(); 
            window.location.hash = '#admin'; 
            setCurrentView('admin-dashboard'); 
          } 
        },
      ],
    },
    {
      label: 'Social & Connect',
      links: [
        { 
          title: 'GitHub', 
          href: 'https://github.com/yaswant-pandey', 
          icon: Github 
        },
        { 
          title: 'Twitter / X', 
          href: 'https://twitter.com/yaswantcode', 
          icon: Twitter 
        },
        { 
          title: 'LinkedIn', 
          href: 'https://linkedin.com/in/yaswant-pandey', 
          icon: Linkedin 
        },
        { 
          title: 'Email Support', 
          href: 'mailto:admin@yaswantcode.com', 
          icon: Mail 
        },
      ],
    },
  ];

  const bottomBar = (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
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
      brandDescription="The high-velocity learning environment for serious software engineers, distributed systems architects, and machine learning researchers."
      sections={sections}
      className="mt-20"
      bottomContent={bottomBar}
    />
  );
};
