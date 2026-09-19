/**
 * seo.ts — Centralised Runtime SEO Service
 *
 * Handles all DOM-level SEO mutations for the Yaswant Code LMS SPA.
 * Called by router.ts syncUrlWithView() on every navigation event.
 *
 * Covers: title, meta description, canonical, Open Graph, Twitter Card,
 * robots directive, and JSON-LD schema injection/cleanup.
 */

const BASE_URL = 'https://yaswant.co.in';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.svg`;
const BRAND = 'Yaswant Code';

// ─────────────────────────────────────────────────────────────────────────────
// Meta Tag Utilities
// ─────────────────────────────────────────────────────────────────────────────

function upsertMeta(selector: string, attribute: string, value: string): void {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const parts = selector.match(/\[([^\]]+)="([^\]]+)"\]/);
    if (parts) el.setAttribute(parts[1], parts[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attribute, value);
}

function upsertLink(rel: string, value: string): void {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', value);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Update the page <title> */
export function setPageTitle(title: string): void {
  document.title = title;
}

/** Update <meta name="description"> */
export function setMetaDescription(description: string): void {
  upsertMeta('meta[name="description"]', 'content', description);
}

/** Update <link rel="canonical"> */
export function setCanonical(path: string): void {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  upsertLink('canonical', url);
}

/** Update all Open Graph + Twitter Card meta tags */
export function setOgTags(opts: {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
}): void {
  const { title, description, url, image = DEFAULT_OG_IMAGE, type = 'website' } = opts;
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  upsertMeta('meta[property="og:title"]', 'content', title);
  upsertMeta('meta[property="og:description"]', 'content', description);
  upsertMeta('meta[property="og:url"]', 'content', fullUrl);
  upsertMeta('meta[property="og:image"]', 'content', image);
  upsertMeta('meta[property="og:type"]', 'content', type);
  upsertMeta('meta[property="og:site_name"]', 'content', BRAND);

  upsertMeta('meta[name="twitter:title"]', 'content', title);
  upsertMeta('meta[name="twitter:description"]', 'content', description);
  upsertMeta('meta[name="twitter:image"]', 'content', image);
  upsertMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
}

/** Set robots directive — use "noindex, nofollow" for private routes */
export function setRobotsDirective(directive: string): void {
  upsertMeta('meta[name="robots"]', 'content', directive);
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD Schema Injection
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SCHEMA_ID = 'ld-json-page';

/** Inject or replace a page-level JSON-LD schema block */
export function injectSchema(jsonLd: object): void {
  let el = document.getElementById(PAGE_SCHEMA_ID) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = PAGE_SCHEMA_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(jsonLd, null, 0);
}

/** Remove the page-level JSON-LD schema block */
export function removeSchema(): void {
  document.getElementById(PAGE_SCHEMA_ID)?.remove();
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema Builders
// ─────────────────────────────────────────────────────────────────────────────

export interface FaqItem {
  q: string;
  a: string;
}

/** Build FAQPage schema for landing page or any FAQ section */
export function buildFAQSchema(faqs: FaqItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

export interface CourseSchemaData {
  id: string;
  title: string;
  description: string;
  instructor?: { name: string };
  price?: number;
  difficulty?: string;
  durationHours?: number;
  category?: string;
  thumbnail?: string;
}

/** Build Course schema for a course detail page */
export function buildCourseSchema(course: CourseSchemaData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: `${BASE_URL}/courses/${course.id}`,
    image: course.thumbnail,
    provider: {
      '@type': 'Organization',
      name: BRAND,
      sameAs: BASE_URL,
    },
    ...(course.instructor && {
      instructor: {
        '@type': 'Person',
        name: course.instructor.name,
      },
    }),
    ...(course.price !== undefined && {
      offers: {
        '@type': 'Offer',
        price: course.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `${BASE_URL}/courses/${course.id}`,
      },
    }),
    ...(course.difficulty && {
      educationalLevel: course.difficulty,
    }),
    ...(course.durationHours && {
      timeRequired: `PT${course.durationHours}H`,
    }),
  };
}

export interface ArticleSchemaData {
  id: string;
  title: string;
  excerpt: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  category?: string;
  thumbnail?: string;
  tags?: string[];
}

/** Build Article schema for blog post pages */
export function buildArticleSchema(post: ArticleSchemaData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    url: `${BASE_URL}/blog`,
    image: post.thumbnail,
    datePublished: post.publishedAt || new Date().toISOString(),
    dateModified: post.updatedAt || post.publishedAt || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: post.author || 'Yaswant Pandey',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: BRAND,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog`,
    },
    ...(post.keywords && { keywords: (post as any).keywords }),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/** Build BreadcrumbList schema */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

/** Build combined schema with multiple types */
export function buildCombinedSchema(...schemas: object[]): object {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.map(s => {
      // Remove @context from individual schemas when combining
      const { '@context': _, ...rest } = s as Record<string, unknown>;
      return rest;
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Static Schemas (injected into index.html but also available here)
// ─────────────────────────────────────────────────────────────────────────────

/** Organization schema — represents the Yaswant Code brand entity */
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: BRAND,
  alternateName: 'Yaswant Code LMS',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/logo.svg`,
    width: 200,
    height: 60,
  },
  image: `${BASE_URL}/og-image.svg`,
  description:
    'Yaswant Code is a developer-first online learning platform for serious software engineers. Master full-stack architecture, AI/LLM engineering, distributed systems, and cloud-native development through production-grade courses.',
  foundingDate: '2024',
  founder: {
    '@type': 'Person',
    name: 'Yaswant Pandey',
    url: BASE_URL,
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'admin@yaswantcode.com',
    contactType: 'customer support',
    availableLanguage: 'English',
  },
  sameAs: [
    'https://github.com/yaswant-pandey',
    'https://linkedin.com/in/yaswant-pandey',
    'https://twitter.com/yaswantcode',
  ],
};

/** WebSite schema with SearchAction for sitelinks searchbox */
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: BRAND,
  url: BASE_URL,
  description:
    'Full-Stack Engineering & AI Masterclasses — learn from principal engineers and earn verifiable credentials.',
  publisher: { '@id': `${BASE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/courses?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};
