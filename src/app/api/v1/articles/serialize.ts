import { PUBLIC_CACHE_HEADERS, serializeImage, serializeRouteCard, toVietnamIso, type ImageOut } from '../../../../lib/api/serialize';
import type { Article, Route } from '../../../../payload-types';

/** Tag theo contract §0: articles → `articles,sitemap` (revalidate=60s). */
export const ARTICLES_CACHE_HEADERS = {
  ...PUBLIC_CACHE_HEADERS,
  'Cache-Tag': 'articles,sitemap',
} as const;

export const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  'kinh-nghiem': 'Kinh nghiệm đi xe',
  'tin-tuyen': 'Tin tuyến & Báo giá',
  'khuyen-mai': 'Khuyến mãi',
};

export type ArticleSeoDoc = {
  metaTitle?: string | null;
  appendBrand?: boolean | null;
  metaDescription?: string | null;
  ogImage?: unknown;
  noindex?: boolean | null;
};

export type ArticleTocItem = { id: string; text: string; level?: number };

export type RelatedRouteOut = { slug: string; name: string; priceShare1Text: string } | null;

export type ArticleOut = {
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  excerpt: string;
  author: string;
  featuredImage: ImageOut | null;
  publishedAt: string | null;
  updatedAt: string;
};

function categoryName(category: string): string {
  return ARTICLE_CATEGORY_LABELS[category] ?? category;
}

function tocOf(article: Article): ArticleTocItem[] {
  const toc = article.tableOfContents;
  return Array.isArray(toc) ? (toc as ArticleTocItem[]) : [];
}

/** Card list — contract §3 GET /api/v1/articles. */
export function serializeArticleCard(article: Article): ArticleOut {
  return {
    slug: article.slug,
    title: article.title,
    category: article.category,
    categoryName: categoryName(article.category),
    excerpt: article.excerpt,
    author: article.author,
    featuredImage: serializeImage(article.featuredImage),
    publishedAt: article.publishedAt ? toVietnamIso(new Date(article.publishedAt)) : null,
    updatedAt: toVietnamIso(new Date(article.updatedAt)),
  };
}

/** Chi tiết bài đã đăng — card + contentHtml, TOC, authorType, relatedRoute, seo (§3). */
export function serializeArticleDetail(
  article: Article,
  relatedRoute: RelatedRouteOut = null,
): ArticleOut & {
  contentHtml: string;
  tableOfContents: ArticleTocItem[];
  authorType: string | null;
  relatedRoute: RelatedRouteOut;
  seo: {
    metaTitle: string | null;
    appendBrand: boolean;
    metaDescription: string | null;
    ogImage: ImageOut | null;
    noindex: boolean;
  };
} {
  const seo: ArticleSeoDoc | null | undefined = article.seo;
  return {
    ...serializeArticleCard(article),
    contentHtml: article.contentHtml ?? '',
    tableOfContents: tocOf(article),
    authorType: article.authorType ?? null,
    relatedRoute,
    seo: {
      metaTitle: seo?.metaTitle ?? null,
      appendBrand: seo?.appendBrand ?? true,
      metaDescription: seo?.metaDescription ?? null,
      ogImage: serializeImage(seo?.ogImage ?? null),
      noindex: seo?.noindex ?? false,
    },
  };
}

/** Tuyến liên quan xuất đúng 3 field contract §3 (chỉ khi tuyến đang hiển thị). */
export function serializeRelatedRoute(route: Route): RelatedRouteOut {
  if (route.status !== 'active') return null;
  const card = serializeRouteCard(route);
  return { slug: card.slug, name: card.name, priceShare1Text: card.priceShare1Text };
}
