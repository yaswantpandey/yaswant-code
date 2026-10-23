import { BlogPost } from '../types/lms';
import { PRIMARY_INSTRUCTOR } from '../config/brand';

export interface StaticArticle extends BlogPost {
  /** ISO date for structured data; `publishedAt` is the display string */
  publishedIso: string;
}

/**
 * Long-form articles that ship with the frontend bundle and render on their
 * own page at /blog/:slug, instead of the reader modal used for posts that
 * come from /api/blog.php.
 */
export const STATIC_ARTICLES: StaticArticle[] = [
  {
    id: 'static-php-vulnerability-landscape-2026',
    slug: 'php-vulnerability-landscape-2026-php2shell',
    title: 'PHP Vulnerability Landscape 2026: PHP2Shell and the Core Disclosures',
    excerpt:
      'PHP2Shell (CVE-2026-109618 & CVE-2026-109619) broke the shared-nothing request model across PHP 5.0 through 8.5.11. A full breakdown of the exploit chain, SAPI exposure, every 2026 core advisory, and what to patch first.',
    coverImage: '/blog/php2shell-cover.svg',
    category: 'Security',
    tags: ['php', 'security', 'cve', 'php2shell', 'php-fpm', 'hardening'],
    author: {
      name: PRIMARY_INSTRUCTOR.name,
      role: PRIMARY_INSTRUCTOR.role,
      avatar: PRIMARY_INSTRUCTOR.avatar,
    },
    publishedAt: 'Oct 22, 2026',
    publishedIso: '2026-10-22',
    readingTime: '14 min read',
    likesCount: 0,
    viewsCount: 0,
    featured: true,
    content: '',
  },
];

export function findStaticArticle(slug: string | undefined): StaticArticle | undefined {
  if (!slug) return undefined;
  return STATIC_ARTICLES.find(a => a.slug === slug.toLowerCase());
}
