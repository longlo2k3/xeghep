import { describe, expect, it } from 'vitest';

import { articleBeforeChange } from '../src/collections/Articles/index';
import { sanitizeArticleHtml, validateArticleHtml } from '../src/lib/seo/sanitize';
import { injectTocIds, processArticleContent } from '../src/lib/seo/toc';

describe('sanitizeArticleHtml — allowlist (spec 4.2.2 / FR-D01)', () => {
  it('keeps allowlist tags: p, h2, h3, h4, ul/ol/li, strong, em, a, img, table, blockquote, br', () => {
    const out = sanitizeArticleHtml(
      '<p>Chào <strong>mọi người</strong> <em>nhé</em></p>' +
        '<h2>Tiêu đề</h2><h3>Phụ</h3><h4>Nhỏ</h4>' +
        '<ul><li>một</li></ul><ol><li>hai</li></ol>' +
        '<blockquote>trích dẫn</blockquote><br />' +
        '<table><thead><tr><th>cột</th></tr></thead><tbody><tr><td>ô</td></tr></tbody></table>' +
        '<img src="/photo01.avif" alt="Bảng giá" width="800" height="600" />',
    );
    expect(out).toContain('<strong>mọi người</strong>');
    expect(out).toContain('<em>nhé</em>');
    expect(out).toContain('<h2>Tiêu đề</h2>');
    expect(out).toContain('<h3>Phụ</h3>');
    expect(out).toContain('<h4>Nhỏ</h4>');
    expect(out).toContain('<li>một</li>');
    expect(out).toContain('<ol>');
    expect(out).toContain('<blockquote>trích dẫn</blockquote>');
    expect(out).toContain('<th>cột</th>');
    expect(out).toContain('<td>ô</td>');
    expect(out).toContain('alt="Bảng giá"');
    expect(out).toContain('width="800"');
    expect(out).toContain('height="600"');
  });

  it('discards <script>/<style>/<iframe> including their content', () => {
    const out = sanitizeArticleHtml(
      '<p>Trước</p><script>alert("xss")</script>' +
        '<style>p{color:red}</style>' +
        '<iframe src="https://evil.example/embed"></iframe>' +
        '<noscript>bật JS</noscript><p>Sau</p>',
    );
    expect(out).toContain('<p>Trước</p>');
    expect(out).toContain('<p>Sau</p>');
    expect(out).not.toContain('script');
    expect(out).not.toContain('alert("xss")');
    expect(out).not.toContain('color:red');
    expect(out).not.toContain('iframe');
    expect(out).not.toContain('bật JS');
  });

  it('strips event handler attributes and other non-allowlisted attributes', () => {
    expect(sanitizeArticleHtml('<p onclick="steal()" style="color:red" class="x">Nội dung</p>')).toBe(
      '<p>Nội dung</p>',
    );
    expect(
      sanitizeArticleHtml('<a href="/gioi-thieu" onmouseover="steal()" target="_blank">liên kết</a>'),
    ).toBe('<a href="/gioi-thieu">liên kết</a>');
  });

  it('unwraps disallowed tags but keeps their text', () => {
    const out = sanitizeArticleHtml('<div><span>giữ nguyên text</span></div>');
    expect(out).toBe('giữ nguyên text');
  });

  it('drops javascript: and data: URLs', () => {
    const out = sanitizeArticleHtml(
      '<a href="javascript:alert(1)">bad</a> <img src="data:text/html;base64,PHNjcmlwdD4=" alt="x" width="1" height="1" />',
    );
    expect(out).not.toContain('javascript:');
    expect(out).not.toContain('data:');
  });
});

describe('sanitizeArticleHtml — external links rel (US5-2)', () => {
  it('adds rel="noopener nofollow" to external http(s) links only', () => {
    const out = sanitizeArticleHtml(
      '<p>' +
        '<a href="https://example.com/bai-viet">ngoài</a> ' +
        '<a href="http://example.org">ngoài 2</a> ' +
        '<a href="/tuyen-lien-tinh/hai-phong-ha-long">nội bộ</a> ' +
        '<a href="tel:0962298293">gọi</a> ' +
        '<a href="mailto:xegheplientinhvip@gmail.com">mail</a>' +
        '</p>',
    );
    const external = out.match(/<a[^>]*example\.com[^>]*>/)?.[0] ?? '';
    expect(external).toContain('href="https://example.com/bai-viet"');
    expect(external).toContain('rel="noopener nofollow"');

    const internal = out.match(/<a[^>]*tuyen-lien-tinh[^>]*>/)?.[0] ?? '';
    expect(internal).toContain('href="/tuyen-lien-tinh/hai-phong-ha-long"');
    expect(internal).not.toContain('nofollow');

    const tel = out.match(/<a[^>]*tel:[^>]*>/)?.[0] ?? '';
    expect(tel).not.toContain('nofollow');

    const mail = out.match(/<a[^>]*mailto:[^>]*>/)?.[0] ?? '';
    expect(mail).not.toContain('nofollow');
  });

  it('overwrites any author-supplied rel on external links', () => {
    const out = sanitizeArticleHtml('<a href="https://example.com" rel="dofollow">x</a>');
    const anchor = out.match(/<a[^>]*example\.com[^>]*>/)?.[0] ?? '';
    expect(anchor).toContain('rel="noopener nofollow"');
    expect(anchor).not.toContain('dofollow');
  });
});

describe('validateArticleHtml — ảnh bắt buộc alt/width/height (FR-D02)', () => {
  it('rejects an <img> without alt', () => {
    const result = validateArticleHtml('<p>ảnh</p><img src="/photo01.avif" width="800" height="600" />');
    expect(result).not.toBe(true);
    expect(String(result)).toContain('alt');
  });

  it('rejects an <img> with empty alt', () => {
    const result = validateArticleHtml('<img src="/photo01.avif" alt="   " width="800" height="600" />');
    expect(result).not.toBe(true);
    expect(String(result)).toContain('alt');
  });

  it('rejects an <img> missing width/height', () => {
    const result = validateArticleHtml('<img src="/photo01.avif" alt="Bảng giá xe ghép" />');
    expect(result).not.toBe(true);
    expect(String(result)).toContain('width');
  });

  it('accepts <img> with alt + width + height (case-insensitive tags/attrs)', () => {
    expect(
      validateArticleHtml('<img src="/photo01.avif" alt="Bảng giá xe ghép" width="800" height="600" />'),
    ).toBe(true);
    expect(validateArticleHtml('<IMG SRC="/photo01.avif" ALT="Bảng giá" WIDTH="800" HEIGHT="600">')).toBe(
      true,
    );
  });

  it('accepts content without images and empty content', () => {
    expect(validateArticleHtml('<p>Không có ảnh.</p>')).toBe(true);
    expect(validateArticleHtml('')).toBe(true);
    expect(validateArticleHtml(null)).toBe(true);
  });
});

describe('injectTocIds — mục lục từ h2 (US5-1)', () => {
  it('extracts h2 → unique slugified ids and injects them into the html', () => {
    const { html, toc } = injectTocIds(
      '<h2>1. Xe ghép liên tỉnh là gì?</h2><p>Nội dung</p><h2>2. Ưu điểm nổi bật</h2>',
    );
    expect(toc).toEqual([
      { id: '1-xe-ghep-lien-tinh-la-gi', text: '1. Xe ghép liên tỉnh là gì?', level: 2 },
      { id: '2-uu-diem-noi-bat', text: '2. Ưu điểm nổi bật', level: 2 },
    ]);
    expect(html).toContain('<h2 id="1-xe-ghep-lien-tinh-la-gi">1. Xe ghép liên tỉnh là gì?</h2>');
    expect(html).toContain('<h2 id="2-uu-diem-noi-bat">2. Ưu điểm nổi bật</h2>');
    expect(html).toContain('<p>Nội dung</p>');
  });

  it('dedupes repeated headings with -2 / -3 suffixes', () => {
    const { html, toc } = injectTocIds('<h2>Giá cước</h2><h2>Giá cước</h2><h2>Giá cước</h2>');
    expect(toc.map((entry) => entry.id)).toEqual(['gia-cuoc', 'gia-cuoc-2', 'gia-cuoc-3']);
    expect(html).toContain('<h2 id="gia-cuoc">');
    expect(html).toContain('<h2 id="gia-cuoc-2">');
    expect(html).toContain('<h2 id="gia-cuoc-3">');
  });

  it('only collects h2 (h3/h4 are headings but not TOC entries)', () => {
    const { html, toc } = injectTocIds('<h2>Mục lớn</h2><h3>Mục phụ</h3><h4>Nhỏ hơn</h4>');
    expect(toc).toHaveLength(1);
    expect(toc[0].text).toBe('Mục lớn');
    expect(html).toContain('<h3>Mục phụ</h3>');
  });

  it('replaces an author-supplied id on h2', () => {
    const { html, toc } = injectTocIds('<h2 id="id-cu">Mục mới</h2>');
    expect(toc[0].id).toBe('muc-moi');
    expect(html).toBe('<h2 id="muc-moi">Mục mới</h2>');
  });

  it('cleans inner tags and decodes entities in heading text', () => {
    const { toc } = injectTocIds('<h2><strong>Ưu điểm</strong> &amp; lợi ích</h2>');
    expect(toc[0].text).toBe('Ưu điểm & lợi ích');
    expect(toc[0].id).toBe('uu-diem-loi-ich');
  });

  it('handles html without h2', () => {
    expect(injectTocIds('<p>Không có mục lục.</p>')).toEqual({
      html: '<p>Không có mục lục.</p>',
      toc: [],
    });
  });
});

describe('processArticleContent — sanitize + TOC pipeline', () => {
  it('strips forbidden markup, adds link rel and injects toc ids in one pass', () => {
    const { contentHtml, tableOfContents } = processArticleContent(
      '<script>bad()</script>' +
        '<h2>Mục Một</h2>' +
        '<p onclick="hack()">Nội dung <a href="https://example.com">ngoài</a></p>' +
        '<h2>Mục Hai</h2>',
    );
    expect(contentHtml).not.toContain('script');
    expect(contentHtml).not.toContain('onclick');
    expect(contentHtml).toContain('<h2 id="muc-mot">Mục Một</h2>');
    expect(contentHtml).toContain('<h2 id="muc-hai">Mục Hai</h2>');
    expect(contentHtml).toContain('rel="noopener nofollow"');
    expect(tableOfContents).toEqual([
      { id: 'muc-mot', text: 'Mục Một', level: 2 },
      { id: 'muc-hai', text: 'Mục Hai', level: 2 },
    ]);
  });

  it('returns empty outputs for missing content', () => {
    expect(processArticleContent('')).toEqual({ contentHtml: '', tableOfContents: [] });
    expect(processArticleContent(null)).toEqual({ contentHtml: '', tableOfContents: [] });
  });
});

describe('articleBeforeChange — contentHtml/TOC/publishedAt auto (US5-1/5)', () => {
  it('generates contentHtml + tableOfContents from content on save', () => {
    const data = articleBeforeChange({
      data: { status: 'draft', content: '<h2>Mục A</h2><script>bad</script><p>Nội dung</p>' },
      originalDoc: undefined,
    });
    expect(data.contentHtml).toContain('<h2 id="muc-a">Mục A</h2>');
    expect(data.contentHtml).not.toContain('script');
    expect(data.tableOfContents).toEqual([{ id: 'muc-a', text: 'Mục A', level: 2 }]);
  });

  it('regenerates contentHtml from original content when content is not resent (partial update)', () => {
    const data = articleBeforeChange({
      data: { status: 'published' },
      originalDoc: { status: 'draft', content: '<h2>Cũ</h2><p>Nội dung</p>' },
    });
    expect(data.contentHtml).toContain('<h2 id="cu">Cũ</h2>');
    expect(data.tableOfContents).toEqual([{ id: 'cu', text: 'Cũ', level: 2 }]);
  });

  it('sets publishedAt on first transition draft → published', () => {
    const data = articleBeforeChange({
      data: { status: 'published' },
      originalDoc: { status: 'draft' },
    });
    expect(typeof data.publishedAt).toBe('string');
    expect(Number.isNaN(Date.parse(data.publishedAt))).toBe(false);
  });

  it('keeps publishedAt when a published article is re-saved', () => {
    const data = articleBeforeChange({
      data: { status: 'published' },
      originalDoc: { status: 'published', publishedAt: '2026-02-15T08:00:00+07:00' },
    });
    expect(data.publishedAt).toBe('2026-02-15T08:00:00+07:00');
  });

  it('keeps an admin-provided publishedAt', () => {
    const data = articleBeforeChange({
      data: { status: 'published', publishedAt: '2026-03-01T09:00:00+07:00' },
      originalDoc: { status: 'draft' },
    });
    expect(data.publishedAt).toBe('2026-03-01T09:00:00+07:00');
  });

  it('does not set publishedAt while the article stays draft', () => {
    const data = articleBeforeChange({
      data: { status: 'draft' },
      originalDoc: { status: 'draft' },
    });
    expect(data.publishedAt).toBeUndefined();
  });
});
