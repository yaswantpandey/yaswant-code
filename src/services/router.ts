import { ActiveView } from '../types/lms';
import {
  setPageTitle,
  setMetaDescription,
  setCanonical,
  setOgTags,
  setRobotsDirective,
  injectSchema,
  removeSchema,
  buildFAQSchema,
  buildBreadcrumbSchema,
  buildRoadmapSchema,
  buildCombinedSchema,
} from './seo';
import { ALL_ROADMAP_TRACKS, FULLSTACK_ROADMAP } from '../data/fullstackRoadmap';

const BRAND = 'Yaswant Code';
const BASE_URL = 'https://yaswant.co.in';

// Views that should NEVER be indexed by search engines
const PRIVATE_VIEWS: ReadonlySet<ActiveView> = new Set([
  'admin-dashboard',
  'settings',
  'quiz',
  'assignment',
  'student-dashboard',
  'student-profile',
  'certificate',
  'learning-interface',
]);

/**
 * Get page title for a given view, course, or roadmap track
 */
export function getTitleForView(view: ActiveView, courseTitle?: string, roadmapSlug?: string): string {
  switch (view) {
    case 'landing':
      return `${BRAND} — Full-Stack Engineering & AI Masterclasses`;
    case 'courses':
      return `Engineering Masterclasses & Online Courses | ${BRAND}`;
    case 'course-detail':
      return courseTitle ? `${courseTitle} | ${BRAND}` : `Course Details | ${BRAND}`;
    case 'learning-interface':
      return courseTitle ? `Learning: ${courseTitle} | ${BRAND}` : `Course Player | ${BRAND}`;
    case 'notes':
      return `Study Notes & Architecture Whitepapers | ${BRAND}`;
    case 'tools':
      return `Developer Tools & Utilities — JSON, Regex, JWT, Cron | ${BRAND}`;
    case 'learning-paths': {
      if (roadmapSlug === 'frontend') {
        return `Frontend Developer Roadmap 2026 — React 19, TypeScript & Modern CSS | ${BRAND}`;
      }
      if (roadmapSlug === 'backend') {
        return `Backend Developer Roadmap 2026 — Node.js, Python, Go & SQL | ${BRAND}`;
      }
      if (roadmapSlug === 'devops') {
        return `DevOps & Cloud Engineer Roadmap 2026 — Docker, Kubernetes & CI/CD | ${BRAND}`;
      }
      return `Full Stack Developer Roadmap 2026 — Step by Step Mind Tree Guide | ${BRAND}`;
    }
    case 'projects':
      return `Capstone Engineering Projects & GitHub Assignments | ${BRAND}`;
    case 'student-dashboard':
      return `Student Learning Dashboard | ${BRAND}`;
    case 'student-profile':
      return `Student Profile & Credentials | ${BRAND}`;
    case 'admin-dashboard':
      return `Security Command Center & Admin | ${BRAND}`;
    case 'settings':
      return `Platform & Account Settings | ${BRAND}`;
    case 'blog':
      return `Engineering Architecture Blog — Distributed Systems, AI, Rust | ${BRAND}`;
    case 'resources':
      return `Free Developer Resources — Blueprints, Roadmaps & Cheat Sheets | ${BRAND}`;
    case 'community':
      return `Engineering Community & Peer Discussions | ${BRAND}`;
    case 'quiz':
      return `Technical Assessment Quiz | ${BRAND}`;
    case 'assignment':
      return `Capstone Project Assignment | ${BRAND}`;
    case 'certificate':
      return `Verifiable Credentials & Digital Certificates | ${BRAND}`;
    default:
      return `${BRAND} — Engineering Education`;
  }
}

/**
 * Get meta description for a given view, course, or roadmap track
 */
export function getMetaDescriptionForView(view: ActiveView, courseTitle?: string, roadmapSlug?: string): string {
  switch (view) {
    case 'landing':
      return `Learn full-stack engineering, AI/LLM systems, distributed systems, and cloud-native development from staff engineers. Earn verifiable credentials. Join 140k+ developers on ${BRAND}.`;
    case 'courses':
      return `Browse 197+ expert-authored engineering masterclasses in React 19, Next.js 15, AI/LLM, Rust, Kubernetes, and distributed systems. Start free on ${BRAND}.`;
    case 'course-detail':
      return courseTitle
        ? `Enrol in ${courseTitle} on ${BRAND}. Production-grade curriculum authored by staff engineers. Verifiable digital certificate included.`
        : `Explore this engineering masterclass on ${BRAND}. Learn from principal engineers with real-world production curriculum and earn a verifiable credential.`;
    case 'blog':
      return `Deep-dive technical articles on distributed systems, AI/LLM architecture, React 19, Rust, cloud-native DevOps, and frontend engineering. Written by staff engineers on ${BRAND}.`;
    case 'learning-paths': {
      if (roadmapSlug === 'frontend') {
        return `Comprehensive 2026 Frontend Developer Roadmap. Interactive mind tree covering HTML5 semantic web, CSS3 layouts, JavaScript ES6+, TypeScript, React 19, Next.js 15, and web performance.`;
      }
      if (roadmapSlug === 'backend') {
        return `Production-grade 2026 Backend Developer Roadmap. Interactive mind tree covering Node.js, Express, Python FastAPI, Go, PostgreSQL, Redis caching, RESTful APIs, and microservices.`;
      }
      if (roadmapSlug === 'devops') {
        return `Definitive 2026 DevOps and Cloud Engineer Roadmap. Master Linux, Git, Docker containerization, Kubernetes orchestration, CI/CD pipelines, and cloud architecture.`;
      }
      return `Definitive 2026 Full Stack Developer Roadmap. Interactive mind tree covering web protocols, frontend frameworks, backend runtimes, databases, authentication, Docker, and system design on ${BRAND}.`;
    }
    case 'projects':
      return `Hands-on capstone engineering projects with GitHub repository submissions, automated CI test suites, and instructor code reviews. Build your portfolio on ${BRAND}.`;
    case 'tools':
      return `Free browser-based developer tools: JSON formatter, Regex tester, JWT decoder, Cron expression builder, UUID generator, and more — all on ${BRAND}.`;
    case 'resources':
      return `Free engineering resources: system design blueprints, architecture cheat sheets, tech interview roadmaps, and open-source starter kits from ${BRAND}.`;
    case 'community':
      return `Join the ${BRAND} engineering community. Ask architecture questions, review system designs, and collaborate with senior engineers and staff architects.`;
    case 'notes':
      return `Your personal study notes and architecture whitepapers. Capture learnings from any course and access them anywhere on ${BRAND}.`;
    default:
      return `${BRAND} — The developer-first learning platform for serious software engineers. Master production systems and earn verifiable credentials.`;
  }
}
/**
 * Maps an ActiveView and optional course or roadmapSlug to a clean URL path
 */
export function getPathForView(
  view: ActiveView, 
  course?: { id: string; title?: string } | null,
  roadmapSlug?: string
): string {
  switch (view) {
    case 'landing':
      return '/';
    case 'courses':
      return '/courses';
    case 'course-detail':
      return course?.id ? `/courses/${course.id}` : '/courses';
    case 'learning-interface':
      return course?.id ? `/learn/${course.id}` : '/learn';
    case 'notes':
      return '/notes';
    case 'tools':
      return '/tools';
    case 'learning-paths':
      return roadmapSlug ? `/roadmaps/${roadmapSlug}` : '/roadmaps/full-stack';
    case 'projects':
      return '/projects';
    case 'student-dashboard':
      return '/dashboard';
    case 'student-profile':
      return '/profile';
    case 'admin-dashboard':
      return '/admin';
    case 'settings':
      return '/settings';
    case 'blog':
      return '/blog';
    case 'resources':
      return '/resources';
    case 'community':
      return '/community';
    case 'quiz':
      return '/quiz';
    case 'assignment':
      return '/assignment';
    case 'certificate':
      return '/certificate';
    default:
      return '/';
  }
}

/**
 * Returns true for views that must never be indexed
 */
export function isPrivateView(view: ActiveView): boolean {
  return PRIVATE_VIEWS.has(view);
}

/**
 * Inject the appropriate breadcrumb + page schema for a given view
 */
function applySchemaForView(
  view: ActiveView,
  course?: { id: string; title?: string } | null,
  roadmapSlug?: string
): void {
  switch (view) {
    case 'landing': {
      // FAQ schema is injected by LandingPage.tsx useEffect — skip here
      // Just clean up any leftover page schema from previous routes
      removeSchema();
      break;
    }
    case 'courses': {
      injectSchema(
        buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Courses', url: '/courses' },
        ])
      );
      break;
    }
    case 'course-detail': {
      if (course?.id) {
        injectSchema(
          buildBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Courses', url: '/courses' },
            { name: course.title || 'Course', url: `/courses/${course.id}` },
          ])
        );
      }
      break;
    }
    case 'blog': {
      injectSchema(
        buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Engineering Blog', url: '/blog' },
        ])
      );
      break;
    }
    case 'learning-paths': {
      const slug = roadmapSlug || 'full-stack';
      const track = ALL_ROADMAP_TRACKS.find(t => t.id === slug || t.slug === slug) || FULLSTACK_ROADMAP;
      const breadcrumb = buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Tech Roadmaps', url: '/roadmaps' },
        { name: track.title, url: `/roadmaps/${track.slug}` },
      ]);
      const roadmapSchema = buildRoadmapSchema(track);
      injectSchema(buildCombinedSchema(breadcrumb, roadmapSchema));
      break;
    }
    case 'projects': {
      injectSchema(
        buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Projects', url: '/projects' },
        ])
      );
      break;
    }
    case 'tools': {
      injectSchema(
        buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Developer Tools', url: '/tools' },
        ])
      );
      break;
    }
    case 'resources': {
      injectSchema(
        buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Free Resources', url: '/resources' },
        ])
      );
      break;
    }
    case 'community': {
      injectSchema(
        buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Community', url: '/community' },
        ])
      );
      break;
    }
    default:
      removeSchema();
  }
}

/**
 * Parses current window.location (pathname + hash) into an ActiveView, courseId, and roadmapSlug
 */
export function parseCurrentLocation(): { 
  view: ActiveView; 
  courseId?: string; 
  roadmapSlug?: string; 
  isHashRedirect?: boolean 
} {
  if (typeof window === 'undefined') {
    return { view: 'landing' };
  }

  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');

  // 1. Check Hash Fallback (e.g., #courses, #notes, #admin)
  if (hash) {
    if (hash === 'admin') return { view: 'admin-dashboard', isHashRedirect: true };
    if (hash === 'notes') return { view: 'notes', isHashRedirect: true };
    if (hash === 'tools') return { view: 'tools', isHashRedirect: true };
    if (hash === 'courses') return { view: 'courses', isHashRedirect: true };
    if (hash.startsWith('course/') || hash.startsWith('courses/')) {
      const parts = hash.split('/');
      return { view: 'course-detail', courseId: parts[1], isHashRedirect: true };
    }
    if (hash.startsWith('roadmaps/') || hash.startsWith('paths/')) {
      const parts = hash.split('/');
      return { view: 'learning-paths', roadmapSlug: parts[1], isHashRedirect: true };
    }
    if (hash === 'paths' || hash === 'roadmaps' || hash === 'learning-paths') {
      return { view: 'learning-paths', roadmapSlug: 'full-stack', isHashRedirect: true };
    }
    if (hash === 'projects') return { view: 'projects', isHashRedirect: true };
    if (hash === 'google-hub' || hash === 'workspace') return { view: 'student-dashboard', isHashRedirect: true };
    if (hash === 'dashboard') return { view: 'student-dashboard', isHashRedirect: true };
    if (hash === 'profile') return { view: 'student-profile', isHashRedirect: true };
    if (hash === 'blog') return { view: 'blog', isHashRedirect: true };
    if (hash === 'resources') return { view: 'resources', isHashRedirect: true };
    if (hash === 'community') return { view: 'community', isHashRedirect: true };
    if (hash === 'quiz') return { view: 'quiz', isHashRedirect: true };
    if (hash === 'assignment') return { view: 'assignment', isHashRedirect: true };
    if (hash === 'certificate') return { view: 'certificate', isHashRedirect: true };
    if (hash === 'settings') return { view: 'settings', isHashRedirect: true };
  }

  // 2. Clean Pathname Routing
  if (pathname.startsWith('/admin')) {
    return { view: 'admin-dashboard' };
  }

  if (pathname.startsWith('/courses/') || pathname.startsWith('/course/')) {
    const parts = pathname.split('/').filter(Boolean);
    const courseId = parts[1];
    return { view: 'course-detail', courseId };
  }

  if (pathname === '/courses') {
    return { view: 'courses' };
  }

  if (pathname.startsWith('/learn/') || pathname === '/learn') {
    const parts = pathname.split('/').filter(Boolean);
    const courseId = parts[1];
    return { view: 'learning-interface', courseId };
  }

  if (pathname === '/notes') {
    return { view: 'notes' };
  }

  if (pathname === '/tools') {
    return { view: 'tools' };
  }

  // Dedicated Roadmaps Clean URLs (/roadmaps/full-stack, /roadmaps/frontend, etc.)
  if (pathname.startsWith('/roadmaps/') || pathname.startsWith('/paths/') || pathname.startsWith('/learning-paths/')) {
    const parts = pathname.split('/').filter(Boolean);
    const roadmapSlug = parts[1] || 'full-stack';
    return { view: 'learning-paths', roadmapSlug };
  }

  if (pathname === '/roadmaps' || pathname === '/paths' || pathname === '/learning-paths') {
    return { view: 'learning-paths', roadmapSlug: 'full-stack' };
  }

  if (pathname === '/projects') {
    return { view: 'projects' };
  }

  if (pathname === '/google-hub' || pathname === '/workspace') {
    return { view: 'student-dashboard' };
  }

  if (pathname === '/dashboard') {
    return { view: 'student-dashboard' };
  }

  if (pathname === '/profile') {
    return { view: 'student-profile' };
  }

  if (pathname === '/community') {
    return { view: 'community' };
  }

  if (pathname === '/blog') {
    return { view: 'blog' };
  }

  if (pathname === '/resources') {
    return { view: 'resources' };
  }

  if (pathname === '/quiz') {
    return { view: 'quiz' };
  }

  if (pathname === '/assignment') {
    return { view: 'assignment' };
  }

  if (pathname === '/certificate') {
    return { view: 'certificate' };
  }

  if (pathname === '/settings') {
    return { view: 'settings' };
  }

  return { view: 'landing' };
}

/**
 * Updates the browser URL bar using HTML5 History API without reloading the page.
 * Also synchronises all SEO meta tags, canonical URL, robots directive, and JSON-LD schema.
 */
export function syncUrlWithView(
  view: ActiveView,
  course?: { id: string; title?: string } | null,
  replace: boolean = false,
  roadmapSlug?: string
): void {
  if (typeof window === 'undefined') return;

  const targetPath = getPathForView(view, course, roadmapSlug);
  const currentPath = window.location.pathname;
  const title = getTitleForView(view, course?.title, roadmapSlug);
  const description = getMetaDescriptionForView(view, course?.title, roadmapSlug);
  const canonicalUrl = targetPath === '/' ? BASE_URL + '/' : BASE_URL + targetPath;
  const ogImage = 'https://yaswant.co.in/og-image.svg';

  // ── 1. Update browser history ──────────────────────────────────────────
  if (window.location.hash) {
    try {
      window.history.replaceState({ view, courseId: course?.id, roadmapSlug }, '', targetPath);
    } catch {
      window.location.hash = '';
    }
  } else if (currentPath !== targetPath) {
    if (replace) {
      window.history.replaceState({ view, courseId: course?.id, roadmapSlug }, '', targetPath);
    } else {
      window.history.pushState({ view, courseId: course?.id, roadmapSlug }, '', targetPath);
    }
  }

  // ── 2. Update all SEO tags ─────────────────────────────────────────────
  setPageTitle(title);
  setMetaDescription(description);
  setCanonical(canonicalUrl);
  setOgTags({
    title,
    description,
    url: canonicalUrl,
    image: ogImage,
    type: view === 'course-detail' ? 'article' : 'website',
  });

  // ── 3. Robots directive: noindex for private routes ────────────────────
  if (isPrivateView(view)) {
    setRobotsDirective('noindex, nofollow');
  } else {
    setRobotsDirective('index, follow');
  }

  // ── 4. Inject page-level JSON-LD schema ────────────────────────────────
  applySchemaForView(view, course, roadmapSlug);
}
