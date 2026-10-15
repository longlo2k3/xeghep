/** RD-4: mã trạng thái chuyển hướng hợp lệ (enum chặn khi lưu). */
export const REDIRECT_STATUS_CODES = [301, 308, 410] as const;

/** RD-3: chuỗi chuyển hướng tối đa số bước này (spec US6-4). */
export const MAX_REDIRECT_HOPS = 5;

export type RedirectRule = {
  id?: string | number;
  fromUrl?: string | null;
  toUrl?: string | null;
  statusCode?: string | number | null;
};

export type RedirectValidation =
  | { ok: true; fromUrl: string; toUrl: string | null; statusCode: number }
  | { ok: false; message: string };

const fail = (message: string): RedirectValidation => ({ ok: false, message });

function normalizePathPart(raw: string): string {
  const hashIndex = raw.indexOf('#');
  const withoutHash = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw;
  const queryIndex = withoutHash.indexOf('?');
  const pathPart = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const queryPart = queryIndex >= 0 ? withoutHash.slice(queryIndex) : '';

  let path = pathPart.toLowerCase();
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, '');
  if (!path) path = '/';
  return `${path}${queryPart}`;
}

/**
 * RD-1: chuẩn hóa URL chuyển hướng — chữ thường host + path, bỏ port mặc định,
 * bỏ fragment, luôn có leading '/', bỏ '/' cuối (trừ root), GIỮ query string.
 */
export function normalizeRedirectUrl(input: string | null | undefined): string {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(trimmed)) {
    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      return normalizePathPart(trimmed);
    }
    const protocol = url.protocol.toLowerCase();
    const isDefaultPort =
      url.port === '' ||
      (protocol === 'http:' && url.port === '80') ||
      (protocol === 'https:' && url.port === '443');
    const host = url.hostname.toLowerCase() + (!isDefaultPort && url.port ? `:${url.port}` : '');
    return `${protocol}//${host}${normalizePathPart(url.pathname + url.search)}`;
  }

  return normalizePathPart(trimmed);
}

/** Trạng thái "đang hiển thị": route active hoặc bài/trang published (spec US6). */
export function isLiveStatus(status: unknown): boolean {
  return status === 'active' || status === 'published';
}

/** Ánh xạ slug → đường dẫn công khai: '' (pages) / 'tuyen-lien-tinh' / 'tin-tuc'. */
export function slugToPath(basePath: string, slug: string): string {
  const base = String(basePath ?? '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
  const clean = String(slug ?? '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
  if (!base) {
    if (!clean || clean === 'home') return '/';
    return `/${clean}`;
  }
  if (!clean) return `/${base}`;
  return `/${base}/${clean}`;
}

const walkChain = (fromUrl: string, toUrl: string | null, existing: RedirectRule[]): RedirectValidation => {
  const graph = new Map<string, string>();
  for (const row of existing ?? []) {
    const key = normalizeRedirectUrl(row?.fromUrl);
    const value = normalizeRedirectUrl(row?.toUrl);
    if (key && value) graph.set(key, value);
  }
  if (toUrl) {
    graph.set(fromUrl, toUrl);
  } else {
    graph.delete(fromUrl);
  }

  const visited = new Set<string>();
  let current = fromUrl;
  let hops = 0;
  while (graph.has(current)) {
    if (visited.has(current)) {
      return fail(`Phát hiện vòng lặp chuyển hướng qua "${fromUrl}".`);
    }
    visited.add(current);
    const next = graph.get(current) as string;
    hops += 1;
    if (hops > MAX_REDIRECT_HOPS) {
      return fail(
        `Chuỗi chuyển hướng vượt quá ${MAX_REDIRECT_HOPS} bước (từ "${fromUrl}") — bị từ chối.`,
      );
    }
    if (next === fromUrl) {
      return fail(`Phát hiện vòng lặp chuyển hướng qua "${fromUrl}".`);
    }
    current = next;
  }
  return { ok: true, fromUrl, toUrl, statusCode: 301 };
};

/**
 * Validate RD-1…RD-4 cho một bản ghi chuyển hướng:
 * RD-1 chuẩn hóa fromUrl · RD-2 toUrl ≠ fromUrl · RD-3 chống vòng lặp/chuỗi
 * tối đa 5 bước trên đồ thị `existing` · RD-4 statusCode ∈ {301, 308, 410},
 * 410 không được có toUrl.
 */
export function validateRedirect(
  input: { fromUrl?: string | null; toUrl?: string | null; statusCode?: string | number | null },
  existing: RedirectRule[] = [],
): RedirectValidation {
  const fromUrl = normalizeRedirectUrl(input?.fromUrl);
  if (!fromUrl) return fail('URL cũ (fromUrl) bắt buộc và không được để trống.');

  const rawStatus = input?.statusCode == null || input.statusCode === '' ? 301 : Number(input.statusCode);
  if (!REDIRECT_STATUS_CODES.includes(rawStatus as (typeof REDIRECT_STATUS_CODES)[number])) {
    return fail(`Mã trạng thái không hợp lệ — chỉ chấp nhận ${REDIRECT_STATUS_CODES.join(', ')}.`);
  }

  const rawTo = typeof input?.toUrl === 'string' ? input.toUrl.trim() : '';
  const toUrl = rawTo ? normalizeRedirectUrl(rawTo) : '';

  if (rawStatus === 410) {
    if (toUrl) return fail('Redirect 410 (Gone) không được có URL đích (toUrl).');
  } else {
    if (!toUrl) return fail('Bắt buộc nhập URL đích (toUrl) khi statusCode khác 410.');
    if (toUrl === fromUrl) return fail('URL đích (toUrl) phải khác URL gốc (fromUrl).');
  }

  const chained = walkChain(fromUrl, toUrl || null, existing);
  if (!chained.ok) return chained;
  return { ok: true, fromUrl, toUrl: toUrl || null, statusCode: rawStatus };
}

export type SlugChangePlan = {
  create: { fromUrl: string; toUrl: string; statusCode: 301; source: 'auto' } | null;
  updates: { id: string | number; toUrl: string }[];
  deletes: Array<string | number>;
};

const EMPTY_PLAN: SlugChangePlan = { create: null, updates: [], deletes: [] };

/**
 * Logic hook đổi slug (spec US6-1…3):
 * 1. redirect nguồn = đường dẫn mới → XÓA (đường dẫn mới đã là trang thật);
 * 2. redirect đang ở đường dẫn cũ → cập nhật đích mới (không tạo trùng), bản ghi 410 → xóa + tạo mới;
 * 3. redirect TRỎ VÀO đường dẫn cũ → gộp thẳng sang đường dẫn mới (không chuỗi);
 * 4. tạo mới old → new (301, nguồn auto) khi chưa được cập nhật ở bước 2.
 * Chỉ lập kế hoạch khi `active` (doc active/published) và hai đường dẫn khác nhau.
 */
export function planSlugChangeRedirects(input: {
  oldPath: string;
  newPath: string;
  active: boolean;
  existing?: RedirectRule[];
}): SlugChangePlan {
  const oldPath = normalizeRedirectUrl(input?.oldPath);
  const newPath = normalizeRedirectUrl(input?.newPath);
  if (!input?.active || !oldPath || !newPath || oldPath === newPath) return { ...EMPTY_PLAN };

  const existing = (input.existing ?? []).filter((row) => row && typeof row.fromUrl === 'string');
  const fromOf = (row: RedirectRule) => normalizeRedirectUrl(row.fromUrl);
  const toOf = (row: RedirectRule) => normalizeRedirectUrl(row.toUrl);

  const deletes: Array<string | number> = [];
  const deletedIds = new Set<string | number>();
  const updates: { id: string | number; toUrl: string }[] = [];

  for (const row of existing) {
    if (fromOf(row) === newPath && row.id != null) {
      deletes.push(row.id);
      deletedIds.add(row.id);
    }
  }

  let createNeeded = true;
  for (const row of existing) {
    if (row.id == null || fromOf(row) !== oldPath) continue;
    if (toOf(row) === newPath) {
      createNeeded = false;
      continue;
    }
    if (Number(row.statusCode) === 410) {
      if (!deletedIds.has(row.id)) {
        deletes.push(row.id);
        deletedIds.add(row.id);
      }
      continue;
    }
    updates.push({ id: row.id, toUrl: newPath });
    createNeeded = false;
  }

  for (const row of existing) {
    if (row.id == null || deletedIds.has(row.id)) continue;
    if (fromOf(row) === oldPath) continue;
    if (toOf(row) !== oldPath) continue;
    updates.push({ id: row.id, toUrl: newPath });
  }

  return {
    create: createNeeded
      ? { fromUrl: oldPath, toUrl: newPath, statusCode: 301, source: 'auto' }
      : null,
    updates,
    deletes,
  };
}
