import { describe, expect, it } from 'vitest';

import {
  MAX_REDIRECT_HOPS,
  isLiveStatus,
  normalizeRedirectUrl,
  planSlugChangeRedirects,
  slugToPath,
  validateRedirect,
} from '../src/lib/seo/redirectRules';

const rule = (fromUrl: string, toUrl: string) => ({ fromUrl, toUrl });

describe('RD-1 — normalizeRedirectUrl', () => {
  it('lowercases path, ensures leading slash, strips trailing slashes except root', () => {
    expect(normalizeRedirectUrl('/Tuyen-Lien-Tinh/Ha-Noi/')).toBe('/tuyen-lien-tinh/ha-noi');
    expect(normalizeRedirectUrl('tuyen-lien-tinh/ha-noi')).toBe('/tuyen-lien-tinh/ha-noi');
    expect(normalizeRedirectUrl('/Gioi-Thieu///')).toBe('/gioi-thieu');
    expect(normalizeRedirectUrl('/')).toBe('/');
  });

  it('lowercases host and strips default ports, keeps non-default ports', () => {
    expect(normalizeRedirectUrl('https://Example.COM:443/Tuyen/')).toBe('https://example.com/tuyen');
    expect(normalizeRedirectUrl('http://Example.com:80/Gioi-Thieu')).toBe(
      'http://example.com/gioi-thieu',
    );
    expect(normalizeRedirectUrl('https://example.com:8443/Bang-Gia')).toBe(
      'https://example.com:8443/bang-gia',
    );
    expect(normalizeRedirectUrl('HTTPS://Example.com')).toBe('https://example.com/');
  });

  it('keeps query string untouched (case preserved)', () => {
    expect(normalizeRedirectUrl('/A?Foo=Bar&x=1')).toBe('/a?Foo=Bar&x=1');
    expect(normalizeRedirectUrl('https://example.com/A?b=C')).toBe('https://example.com/a?b=C');
    expect(normalizeRedirectUrl('Tim-Kiem?q=Xe+Ghep')).toBe('/tim-kiem?q=Xe+Ghep');
  });

  it('trims input, drops fragment, empty/non-string → empty', () => {
    expect(normalizeRedirectUrl('  /Ha-Noi  ')).toBe('/ha-noi');
    expect(normalizeRedirectUrl('https://example.com/a#muc-luc')).toBe('https://example.com/a');
    expect(normalizeRedirectUrl('')).toBe('');
    expect(normalizeRedirectUrl('   ')).toBe('');
    expect(normalizeRedirectUrl(null)).toBe('');
    expect(normalizeRedirectUrl(undefined)).toBe('');
    expect(normalizeRedirectUrl(42 as unknown as string)).toBe('');
  });

  it('is idempotent', () => {
    const once = normalizeRedirectUrl('https://Example.com:443/Tuyen/?q=1');
    expect(normalizeRedirectUrl(once)).toBe(once);
  });
});

describe('RD-2 — toUrl phải khác fromUrl (đã chuẩn hóa)', () => {
  it('rejects toUrl equal to normalized fromUrl', () => {
    expect(validateRedirect({ fromUrl: '/ha-noi', toUrl: '/ha-noi' }).ok).toBe(false);
    expect(validateRedirect({ fromUrl: '/ha-noi', toUrl: '/Ha-Noi/' }).ok).toBe(false);
    expect(validateRedirect({ fromUrl: 'Ha-Noi/', toUrl: '/ha-noi' }).ok).toBe(false);
  });

  it('accepts differing normalized urls and returns normalized values', () => {
    const res = validateRedirect({ fromUrl: '/Ha-Noi/', toUrl: '/ha-noi-moi' });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.fromUrl).toBe('/ha-noi');
      expect(res.toUrl).toBe('/ha-noi-moi');
      expect(res.statusCode).toBe(301);
    }
  });

  it('rejects empty fromUrl', () => {
    expect(validateRedirect({ fromUrl: '', toUrl: '/b' }).ok).toBe(false);
    expect(validateRedirect({ fromUrl: '   ', toUrl: '/b' }).ok).toBe(false);
    expect(validateRedirect({ toUrl: '/b' }).ok).toBe(false);
  });
});

describe('RD-3 — chống vòng lặp / chuỗi tối đa 5 bước', () => {
  it('rejects a redirect that closes a loop (B → A đã có, thêm A → B)', () => {
    const res = validateRedirect({ fromUrl: '/a', toUrl: '/b' }, [rule('/b', '/a')]);
    expect(res.ok).toBe(false);
    expect(res.ok === false && res.message).toMatch(/vòng lặp/i);
  });

  it('rejects loop returning to fromUrl within ≤ 5 hops (spec US6-4)', () => {
    const existing = [rule('/b', '/c'), rule('/c', '/d'), rule('/d', '/e'), rule('/e', '/a')];
    const res = validateRedirect({ fromUrl: '/a', toUrl: '/b' }, existing);
    expect(res.ok).toBe(false);
    expect(res.ok === false && res.message).toMatch(/vòng lặp/i);
  });

  it('rejects a loop buried in existing redirects even when fromUrl is not the entry', () => {
    const existing = [rule('/b', '/c'), rule('/c', '/d'), rule('/d', '/c')];
    const res = validateRedirect({ fromUrl: '/a', toUrl: '/b' }, existing);
    expect(res.ok).toBe(false);
    expect(res.ok === false && res.message).toMatch(/vòng lặp/i);
  });

  it(`allows a chain of exactly ${MAX_REDIRECT_HOPS} hops`, () => {
    const existing = [rule('/b', '/c'), rule('/c', '/d'), rule('/d', '/e'), rule('/e', '/f')];
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/b' }, existing).ok).toBe(true);
  });

  it(`rejects a chain longer than ${MAX_REDIRECT_HOPS} hops`, () => {
    const existing = [
      rule('/b', '/c'),
      rule('/c', '/d'),
      rule('/d', '/e'),
      rule('/e', '/f'),
      rule('/f', '/g'),
    ];
    const res = validateRedirect({ fromUrl: '/a', toUrl: '/b' }, existing);
    expect(res.ok).toBe(false);
    expect(res.ok === false && res.message).toMatch(/5 bước/);
  });

  it('treats 410 targets as terminal (no chain beyond)', () => {
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/gone' }, [
      { fromUrl: '/gone', toUrl: '', statusCode: 410 },
    ]).ok).toBe(true);
  });

  it('accepts a redirect with no existing graph', () => {
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/b' }).ok).toBe(true);
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/b' }, []).ok).toBe(true);
  });
});

describe('RD-4 — statusCode ∈ {301, 308, 410}, 410 không có toUrl', () => {
  it('accepts 301, 308 and 410', () => {
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/b', statusCode: 301 }).ok).toBe(true);
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/b', statusCode: '301' }).ok).toBe(true);
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/b', statusCode: 308 }).ok).toBe(true);
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/b', statusCode: '308' }).ok).toBe(true);
    expect(validateRedirect({ fromUrl: '/a', statusCode: 410 }).ok).toBe(true);
    expect(validateRedirect({ fromUrl: '/a', statusCode: '410' }).ok).toBe(true);
  });

  it('rejects other status codes (302, 307, 404, 200…)', () => {
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/b', statusCode: 302 }).ok).toBe(false);
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/b', statusCode: 307 }).ok).toBe(false);
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/b', statusCode: 404 }).ok).toBe(false);
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/b', statusCode: 200 }).ok).toBe(false);
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/b', statusCode: 'abc' }).ok).toBe(false);
  });

  it('defaults statusCode to 301 when omitted', () => {
    const res = validateRedirect({ fromUrl: '/a', toUrl: '/b' });
    expect(res.ok).toBe(true);
    expect(res.ok && res.statusCode).toBe(301);
  });

  it('410 must not carry toUrl; non-410 must carry toUrl', () => {
    expect(validateRedirect({ fromUrl: '/a', toUrl: '/b', statusCode: 410 }).ok).toBe(false);
    expect(validateRedirect({ fromUrl: '/a', toUrl: '  ', statusCode: 410 }).ok).toBe(true);
    const gone = validateRedirect({ fromUrl: '/a', statusCode: 410 });
    expect(gone.ok).toBe(true);
    expect(gone.ok && gone.toUrl).toBeNull();
    expect(validateRedirect({ fromUrl: '/a', statusCode: 301 }).ok).toBe(false);
    expect(validateRedirect({ fromUrl: '/a', toUrl: '', statusCode: 301 }).ok).toBe(false);
  });
});

describe('slugToPath — ánh xạ slug → đường dẫn công khai theo collection', () => {
  it('maps route and article slugs under their base path', () => {
    expect(slugToPath('tuyen-lien-tinh', 'ha-noi')).toBe('/tuyen-lien-tinh/ha-noi');
    expect(slugToPath('/tuyen-lien-tinh/', 'ha-noi')).toBe('/tuyen-lien-tinh/ha-noi');
    expect(slugToPath('tin-tuc', 'kinh-nghiem-di-xe')).toBe('/tin-tuc/kinh-nghiem-di-xe');
  });

  it('maps page slugs (multi-level) and home → "/"', () => {
    expect(slugToPath('', 'gioi-thieu')).toBe('/gioi-thieu');
    expect(slugToPath('', 'chinh-sach/bao-mat')).toBe('/chinh-sach/bao-mat');
    expect(slugToPath('', 'home')).toBe('/');
  });
});

describe('isLiveStatus — chỉ active/published mới tạo redirect', () => {
  it('accepts active and published', () => {
    expect(isLiveStatus('active')).toBe(true);
    expect(isLiveStatus('published')).toBe(true);
  });

  it('rejects draft, inactive, archived and unknown', () => {
    expect(isLiveStatus('draft')).toBe(false);
    expect(isLiveStatus('inactive')).toBe(false);
    expect(isLiveStatus('archived')).toBe(false);
    expect(isLiveStatus(null)).toBe(false);
    expect(isLiveStatus(undefined)).toBe(false);
  });
});

describe('planSlugChangeRedirects — logic hook đổi slug (spec US6-1…3)', () => {
  const AUTO_301 = { fromUrl: '/ha-noi', toUrl: '/ha-noi-moi', statusCode: 301, source: 'auto' };

  it('US6-1: đổi slug → tạo redirect /old → /new, nguồn auto, 301', () => {
    const plan = planSlugChangeRedirects({
      oldPath: '/ha-noi',
      newPath: '/ha-noi-moi',
      active: true,
      existing: [],
    });
    expect(plan.create).toEqual(AUTO_301);
    expect(plan.updates).toEqual([]);
    expect(plan.deletes).toEqual([]);
  });

  it('US6-2: redirect sẵn trỏ tới đường dẫn cũ được gộp thẳng sang đích mới (không chuỗi)', () => {
    const plan = planSlugChangeRedirects({
      oldPath: '/ha-noi',
      newPath: '/ha-noi-moi',
      active: true,
      existing: [
        { id: 7, fromUrl: '/x', toUrl: '/ha-noi' },
        { id: 8, fromUrl: '/y', toUrl: '/ha-noi/' },
      ],
    });
    expect(plan.create).toEqual(AUTO_301);
    expect(plan.updates).toEqual([
      { id: 7, toUrl: '/ha-noi-moi' },
      { id: 8, toUrl: '/ha-noi-moi' },
    ]);
    expect(plan.deletes).toEqual([]);
  });

  it('US6-3: bản ghi B → A bị xóa để tránh vòng lặp khi A đổi sang B', () => {
    const plan = planSlugChangeRedirects({
      oldPath: '/ha-noi',
      newPath: '/ha-noi-moi',
      active: true,
      existing: [{ id: 9, fromUrl: '/ha-noi-moi', toUrl: '/ha-noi' }],
    });
    expect(plan.deletes).toEqual([9]);
    expect(plan.updates).toEqual([]);
    expect(plan.create).toEqual(AUTO_301);
  });

  it('xóa mọi redirect có nguồn = đường dẫn mới (đường dẫn mới đã là trang thật)', () => {
    const plan = planSlugChangeRedirects({
      oldPath: '/ha-noi',
      newPath: '/ha-noi-moi',
      active: true,
      existing: [{ id: 1, fromUrl: '/ha-noi-moi', toUrl: '/khac' }],
    });
    expect(plan.deletes).toEqual([1]);
    expect(plan.create).toEqual(AUTO_301);
  });

  it('redirect đã tồn tại ở đường dẫn cũ được cập nhật đích mới thay vì tạo trùng', () => {
    const plan = planSlugChangeRedirects({
      oldPath: '/ha-noi',
      newPath: '/ha-noi-moi',
      active: true,
      existing: [{ id: 3, fromUrl: '/ha-noi', toUrl: '/khac' }],
    });
    expect(plan.create).toBeNull();
    expect(plan.updates).toEqual([{ id: 3, toUrl: '/ha-noi-moi' }]);
    expect(plan.deletes).toEqual([]);
  });

  it('bản ghi 410 ở đường dẫn cũ bị xóa và tạo mới bằng 301', () => {
    const plan = planSlugChangeRedirects({
      oldPath: '/ha-noi',
      newPath: '/ha-noi-moi',
      active: true,
      existing: [{ id: 4, fromUrl: '/ha-noi', toUrl: null, statusCode: 410 }],
    });
    expect(plan.deletes).toEqual([4]);
    expect(plan.create).toEqual(AUTO_301);
  });

  it('gộp chuỗi + xóa loop cùng lúc (hai bản ghi)', () => {
    const plan = planSlugChangeRedirects({
      oldPath: '/ha-noi',
      newPath: '/ha-noi-moi',
      active: true,
      existing: [
        { id: 10, fromUrl: '/x', toUrl: '/ha-noi' },
        { id: 11, fromUrl: '/ha-noi-moi', toUrl: '/ha-noi' },
      ],
    });
    expect(plan.deletes).toEqual([11]);
    expect(plan.updates).toEqual([{ id: 10, toUrl: '/ha-noi-moi' }]);
    expect(plan.create).toEqual(AUTO_301);
  });

  it('no-op khi doc không active/published hoặc slug không đổi', () => {
    expect(
      planSlugChangeRedirects({ oldPath: '/a', newPath: '/b', active: false, existing: [] }),
    ).toEqual({ create: null, updates: [], deletes: [] });
    expect(
      planSlugChangeRedirects({ oldPath: '/a', newPath: '/a', active: true, existing: [] }),
    ).toEqual({ create: null, updates: [], deletes: [] });
    expect(
      planSlugChangeRedirects({ oldPath: '', newPath: '/b', active: true, existing: [] }),
    ).toEqual({ create: null, updates: [], deletes: [] });
  });

  it('idempotent: đã trỏ đúng đích mới → không thao tác gì', () => {
    const plan = planSlugChangeRedirects({
      oldPath: '/ha-noi',
      newPath: '/ha-noi-moi',
      active: true,
      existing: [{ id: 5, fromUrl: '/ha-noi', toUrl: '/ha-noi-moi' }],
    });
    expect(plan).toEqual({ create: null, updates: [], deletes: [] });
  });

  it('chuẩn hóa oldPath/newPath đầu vào trước khi lập kế hoạch', () => {
    const plan = planSlugChangeRedirects({
      oldPath: 'Ha-Noi/',
      newPath: 'ha-noi-moi/',
      active: true,
      existing: [],
    });
    expect(plan.create).toEqual(AUTO_301);
  });
});
