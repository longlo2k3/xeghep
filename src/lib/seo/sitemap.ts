import type { Payload } from 'payload';

export type SitemapType = 'page' | 'route' | 'article';

export type SitemapEntry = {
  path: string;
  lastmod: string;
  type: SitemapType;
};

type SeoLike = { noindex?: boolean | null } | null | undefined;

export type SitemapPageInput = {
  slug: string;
  kind?: string | null;
  status: string;
  seo?: SeoLike;
  updatedAt: string;
};

export type SitemapRouteInput = {
  slug: string;
  status: string;
  seo?: SeoLike;
  updatedAt: string;
};

export type SitemapArticleInput = {
  slug: string;
  status: string;
  seo?: SeoLike;
  updatedAt: string;
};

export type BuildSitemapInput = {
  pages?: SitemapPageInput[];
  routes?: SitemapRouteInput[];
  articles?: SitemapArticleInput[];
  /** Các URL cũ trong bảng `redirects` (fromUrl) — path không được xuất hiện trong sitemap. */
  redirectFromUrls?: Iterable<string> | Set<string> | null;
};

/** Trang thành công (hardcode noindex ở frontend) + khu quản trị + API — cấm trong sitemap (§2.6). */
const BANNED_EXACT = new Set(['/dat-xe/thanh-cong', '/admin', '/api']);

function normalizePath(path: string): string {
  const trimmed = path.trim().toLowerCase();
  if (!trimmed) return '';
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (withLeading.length > 1) return withLeading.replace(/\/+$/, '');
  return withLeading;
}

function isBanned(path: string): boolean {
  const normalized = normalizePath(path);
  if (BANNED_EXACT.has(normalized)) return true;
  if (normalized.startsWith('/admin')) return true;
  if (normalized.startsWith('/api')) return true;
  return false;
}

function toIso(value: string | null | undefined): string {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

function pagePath(page: SitemapPageInput): string {
  const slug = page.slug.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  if (slug === 'home' || slug === '') return '/';
  return rawPath(`/${slug}`);
}

/** Path thô để trả ra API (không lowercasing); chỉ dùng normalizePath để so sánh. */
function rawPath(path: string): string {
  const trimmed = path.trim();
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeading.length > 1 ? withLeading.replace(/\/+$/, '') : withLeading;
}

export function buildSitemapEntries(input: BuildSitemapInput): SitemapEntry[] {
  const redirects = new Set<string>();
  for (const from of input.redirectFromUrls ?? []) {
    const normalized = normalizePath(from);
    if (normalized) redirects.add(normalized);
  }

  const excluded = (path: string): boolean => isBanned(path) || redirects.has(normalizePath(path));

  const entries: SitemapEntry[] = [];

  for (const page of input.pages ?? []) {
    if (page.status !== 'published' || page.seo?.noindex) continue;
    const path = pagePath(page);
    if (excluded(path)) continue;
    entries.push({ path, lastmod: toIso(page.updatedAt), type: 'page' });
  }

  for (const route of input.routes ?? []) {
    if (route.status !== 'active' || route.seo?.noindex) continue;
    const path = rawPath(`/tuyen-lien-tinh/${route.slug}`);
    if (excluded(path)) continue;
    entries.push({ path, lastmod: toIso(route.updatedAt), type: 'route' });
  }

  for (const article of input.articles ?? []) {
    if (article.status !== 'published' || article.seo?.noindex) continue;
    const path = rawPath(`/tin-tuc/${article.slug}`);
    if (excluded(path)) continue;
    entries.push({ path, lastmod: toIso(article.updatedAt), type: 'article' });
  }

  entries.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return entries;
}

/** Đọc 4 collection (pages/routes/articles/redirects) và trả sitemap entries đã sắp xếp theo path. */
export async function collectSitemapData(payload: Payload): Promise<SitemapEntry[]> {
  const [pagesRes, routesRes, articlesRes, redirectsRes] = await Promise.all([
    payload.find({ collection: 'pages', limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'routes', limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'articles', limit: 100, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'redirects', limit: 2000, depth: 0, overrideAccess: true }),
  ]);

  const redirectFromUrls = redirectsRes.docs
    .filter((row) => (row as { isActive?: boolean | null }).isActive !== false)
    .map((row) => (row as { fromUrl: string }).fromUrl);

  return buildSitemapEntries({
    pages: pagesRes.docs as unknown as SitemapPageInput[],
    routes: routesRes.docs as unknown as SitemapRouteInput[],
    articles: articlesRes.docs as unknown as SitemapArticleInput[],
    redirectFromUrls,
  });
}
