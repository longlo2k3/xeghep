import { describe, expect, it } from 'vitest';

import { normalizeSlug, resolvePageSlug, serializePage } from '../src/app/api/v1/pages/serialize';

describe('normalizeSlug (multi-level page slug)', () => {
  it("normalizes 'chinh-sach--bao-mat' → 'chinh-sach/bao-mat'", () => {
    expect(normalizeSlug('chinh-sach--bao-mat')).toBe('chinh-sach/bao-mat');
  });

  it('keeps single-level slugs and strips slashes', () => {
    expect(normalizeSlug('home')).toBe('home');
    expect(normalizeSlug('/gioi-thieu/')).toBe('gioi-thieu');
    expect(normalizeSlug('  tin-tuc  ')).toBe('tin-tuc');
  });

  it('accepts already-slash form and percent-encoded input', () => {
    expect(normalizeSlug('chinh-sach/bao-mat')).toBe('chinh-sach/bao-mat');
    expect(normalizeSlug('chinh-sach%2Fbao-mat')).toBe('chinh-sach/bao-mat');
  });
});

describe('resolvePageSlug — ?path wins over :slug', () => {
  it('uses query path when provided', () => {
    expect(resolvePageSlug({ slug: 'home', path: 'chinh-sach/bao-mat' })).toBe('chinh-sach/bao-mat');
    expect(resolvePageSlug({ slug: 'gioi-thieu', path: 'chinh-sach--dam-bao' })).toBe(
      'chinh-sach/dam-bao',
    );
  });

  it('falls back to slug param when path missing/empty', () => {
    expect(resolvePageSlug({ slug: 'chinh-sach--thanh-toan', path: null })).toBe(
      'chinh-sach/thanh-toan',
    );
    expect(resolvePageSlug({ slug: 'chinh-sach--bao-mat', path: '' })).toBe('chinh-sach/bao-mat');
    expect(resolvePageSlug({ slug: null, path: null })).toBe('');
  });
});

describe('serializePage — response data shape', () => {
  const base = {
    slug: 'gioi-thieu',
    kind: 'system' as const,
    title: 'Giới thiệu về Xe Ghép Liên Tỉnh',
    status: 'published' as const,
    updatedAt: '2026-10-09T02:30:00.000Z',
    seo: {
      metaTitle: 'Giới Thiệu Về Xe Ghép Liên Tỉnh - Tiện Chuyến Đón Tận Nhà',
      appendBrand: false,
      metaDescription: 'Giới thiệu dịch vụ Xe Ghép Liên Tỉnh.',
      noindex: false,
    },
  };

  it('system page: no contentHtml / content keys, seo + Vietnam updatedAt', () => {
    const out = serializePage({ ...base, content: null, contentHtml: null });
    expect(out).toEqual({
      slug: 'gioi-thieu',
      title: 'Giới thiệu về Xe Ghép Liên Tỉnh',
      kind: 'system',
      seo: {
        metaTitle: 'Giới Thiệu Về Xe Ghép Liên Tỉnh - Tiện Chuyến Đón Tận Nhà',
        appendBrand: false,
        metaDescription: 'Giới thiệu dịch vụ Xe Ghép Liên Tỉnh.',
        ogImage: null,
        noindex: false,
      },
      updatedAt: '2026-10-09T09:30:00+07:00',
    });
    expect(Object.keys(out)).not.toContain('contentHtml');
    expect(Object.keys(out)).not.toContain('content');
  });

  it('content page: includes contentHtml (non-empty) and Lexical content passthrough', () => {
    const lexical = { root: { type: 'root', children: [{ type: 'paragraph' }] } };
    const out = serializePage({
      ...base,
      slug: 'chinh-sach/bao-mat',
      kind: 'content',
      contentHtml: '<h2>1. Mục Đích Thu Thập Dữ Liệu</h2><p>Nội dung.</p>',
      content: lexical,
    });
    expect(out.contentHtml).toBe(
      '<h2>1. Mục Đích Thu Thập Dữ Liệu</h2><p>Nội dung.</p>',
    );
    expect(out.content).toEqual(lexical);
    expect(out.kind).toBe('content');
  });

  it('content page with empty contentHtml omits the key', () => {
    const out = serializePage({
      ...base,
      slug: 'chinh-sach/dam-bao',
      kind: 'content',
      contentHtml: '',
      content: null,
    });
    expect(Object.keys(out)).not.toContain('contentHtml');
    expect(out.content).toBeNull();
  });

  it('applies seo defaults: appendBrand true, noindex false, ogImage null', () => {
    const out = serializePage({ ...base, seo: undefined });
    expect(out.seo).toEqual({
      metaTitle: null,
      appendBrand: true,
      metaDescription: null,
      ogImage: null,
      noindex: false,
    });
  });
});
