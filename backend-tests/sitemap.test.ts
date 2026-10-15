import { describe, expect, it } from 'vitest';

import {
  buildSitemapEntries,
  type SitemapArticleInput,
  type SitemapPageInput,
  type SitemapRouteInput,
} from '../src/lib/seo/sitemap';

const NOW = '2026-10-09T09:30:00.000Z';

function page(slug: string, over: Partial<SitemapPageInput> = {}): SitemapPageInput {
  return {
    slug,
    kind: slug.includes('/') ? 'content' : 'system',
    status: 'published',
    seo: { noindex: false },
    updatedAt: NOW,
    ...over,
  } as SitemapPageInput;
}

function route(slug: string, over: Partial<SitemapRouteInput> = {}): SitemapRouteInput {
  return { slug, status: 'active', seo: { noindex: false }, updatedAt: NOW, ...over };
}

function article(slug: string, over: Partial<SitemapArticleInput> = {}): SitemapArticleInput {
  return { slug, status: 'published', seo: { noindex: false }, updatedAt: NOW, ...over };
}

const SYSTEM_SLUGS = ['home', 'gioi-thieu', 'lien-he', 'tuyen-lien-tinh', 'tin-tuc', 'dat-xe'];
const POLICY_SLUGS = ['chinh-sach/bao-mat', 'chinh-sach/dam-bao', 'chinh-sach/thanh-toan'];

describe('buildSitemapEntries — eligibility (spec §2.6 / US2-10)', () => {
  it('includes 6 system pages + 3 policy pages published', () => {
    const entries = buildSitemapEntries({
      pages: [...SYSTEM_SLUGS, ...POLICY_SLUGS].map((slug) => page(slug)),
    });
    const paths = entries.map((e) => e.path);
    expect(paths).toEqual([
      '/',
      '/chinh-sach/bao-mat',
      '/chinh-sach/dam-bao',
      '/chinh-sach/thanh-toan',
      '/dat-xe',
      '/gioi-thieu',
      '/lien-he',
      '/tin-tuc',
      '/tuyen-lien-tinh',
    ]);
    expect(entries.every((e) => e.type === 'page')).toBe(true);
  });

  it('maps home slug → "/" and content slug → "/{slug}"', () => {
    const entries = buildSitemapEntries({
      pages: [page('home'), page('chinh-sach/bao-mat', { kind: 'content' })],
    });
    expect(entries.map((e) => e.path)).toEqual(['/', '/chinh-sach/bao-mat']);
  });

  it('includes active routes under /tuyen-lien-tinh/{slug} and published articles under /tin-tuc/{slug}', () => {
    const entries = buildSitemapEntries({
      routes: [route('hai-phong-ha-long'), route('ha-noi-mong-cai')],
      articles: [article('kinh-nghiem-di-xe-ghep')],
    });
    expect(entries).toEqual([
      { path: '/tin-tuc/kinh-nghiem-di-xe-ghep', lastmod: NOW, type: 'article' },
      { path: '/tuyen-lien-tinh/ha-noi-mong-cai', lastmod: NOW, type: 'route' },
      { path: '/tuyen-lien-tinh/hai-phong-ha-long', lastmod: NOW, type: 'route' },
    ]);
  });

  it('excludes noindex pages, routes and articles', () => {
    const entries = buildSitemapEntries({
      pages: [page('gioi-thieu', { seo: { noindex: true } }), page('lien-he')],
      routes: [route('bai-viet-noindex', { seo: { noindex: true } }), route('hop-le')],
      articles: [article('bai-noindex', { seo: { noindex: true } }), article('bai-hop-le')],
    });
    const paths = entries.map((e) => e.path);
    expect(paths).toEqual(['/lien-he', '/tin-tuc/bai-hop-le', '/tuyen-lien-tinh/hop-le']);
  });

  it('excludes draft pages, inactive/draft routes and unpublished articles', () => {
    const entries = buildSitemapEntries({
      pages: [page('gioi-thieu', { status: 'draft' }), page('lien-he')],
      routes: [route('ngung-hoat-dong', { status: 'inactive' }), route('hop-le')],
      articles: [article('nhap', { status: 'draft' }), article('da-dang')],
    });
    const paths = entries.map((e) => e.path);
    expect(paths).toEqual(['/lien-he', '/tin-tuc/da-dang', '/tuyen-lien-tinh/hop-le']);
  });

  it('excludes any path present in redirect fromUrl (with normalized matching)', () => {
    const entries = buildSitemapEntries({
      pages: [page('gioi-thieu'), page('lien-he')],
      routes: [route('cu', { status: 'active' }), route('moi')],
      redirectFromUrls: ['/gioi-thieu', '/tuyen-lien-tinh/cu/'],
    });
    expect(entries.map((e) => e.path)).toEqual(['/lien-he', '/tuyen-lien-tinh/moi']);
  });

  it('never includes /dat-xe/thanh-cong, /admin or /api paths', () => {
    const entries = buildSitemapEntries({
      pages: [
        page('dat-xe/thanh-cong', { kind: 'content' }),
        page('admin'),
        page('api-docs'),
        page('dat-xe'),
      ],
      routes: [route('thanh-cong')],
      articles: [article('bai-1')],
    });
    const paths = entries.map((e) => e.path);
    expect(paths).not.toContain('/dat-xe/thanh-cong');
    expect(paths).not.toContain('/admin');
    expect(paths.some((p) => p.startsWith('/api'))).toBe(false);
    expect(paths).toContain('/dat-xe');
  });

  it('passes updatedAt through as ISO lastmod', () => {
    const entries = buildSitemapEntries({
      pages: [page('gioi-thieu', { updatedAt: '2026-10-01T02:30:00.000Z' })],
      routes: [route('hop-le', { updatedAt: '2026-09-30T11:00:00.000Z' })],
    });
    expect(entries.map((e) => e.lastmod)).toEqual([
      '2026-10-01T02:30:00.000Z',
      '2026-09-30T11:00:00.000Z',
    ]);
    expect(entries.every((e) => !Number.isNaN(Date.parse(e.lastmod)))).toBe(true);
  });

  it('sorts entries ascending by path', () => {
    const entries = buildSitemapEntries({
      pages: [page('tuyen-lien-tinh'), page('home'), page('chinh-sach/thanh-toan')],
      routes: [route('z-last'), route('a-first')],
      articles: [article('m-mid')],
    });
    const paths = entries.map((e) => e.path);
    expect(paths).toEqual([...paths].sort());
    expect(paths[0]).toBe('/');
  });

  it('handles empty input as empty list', () => {
    expect(buildSitemapEntries({})).toEqual([]);
    expect(buildSitemapEntries({ pages: [], routes: [], articles: [] })).toEqual([]);
  });
});
