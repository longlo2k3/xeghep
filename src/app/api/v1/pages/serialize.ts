import { serializeImage, toVietnamIso, type ImageOut } from '../../../../lib/api/serialize';

export type PageSeoDoc = {
  metaTitle?: string | null;
  appendBrand?: boolean | null;
  metaDescription?: string | null;
  ogImage?: unknown;
  noindex?: boolean | null;
};

export type PageDoc = {
  slug: string;
  kind: string;
  title: string;
  content?: unknown;
  contentHtml?: string | null;
  seo?: PageSeoDoc | null;
  updatedAt: string;
};

export type PageOut = {
  slug: string;
  title: string;
  kind: string;
  contentHtml?: string;
  content?: unknown;
  seo: {
    metaTitle: string | null;
    appendBrand: boolean;
    metaDescription: string | null;
    ogImage: ImageOut | null;
    noindex: boolean;
  };
  updatedAt: string;
};

/** `/api/v1/pages/:slug` — slug nhiều cấp truyền dạng `chinh-sach--bao-mat` (§5.4⑤). */
export function normalizeSlug(raw: string | null | undefined): string {
  if (!raw) return '';
  let value = String(raw).trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    // giữ nguyên khi không phải percent-encoding hợp lệ
  }
  const noTrailing = value.replace(/^\/+/, '').replace(/\/+$/, '');
  return noTrailing.replace(/--+/g, '/').replace(/\/{2,}/g, '/');
}

/** Query `?path=chinh-sach/bao-mat` thắng param `:slug` (spec §5.4⑤). */
export function resolvePageSlug(params: {
  slug?: string | null;
  path?: string | null;
}): string {
  const fromPath = normalizeSlug(params.path);
  if (fromPath) return fromPath;
  return normalizeSlug(params.slug);
}

export function serializePage(page: PageDoc): PageOut {
  const seo = page.seo ?? null;
  const isContent = page.kind === 'content';
  const contentHtml =
    isContent && typeof page.contentHtml === 'string' && page.contentHtml.trim().length > 0
      ? page.contentHtml
      : undefined;

  const out: PageOut = {
    slug: page.slug,
    title: page.title,
    kind: page.kind,
    seo: {
      metaTitle: seo?.metaTitle ?? null,
      appendBrand: seo?.appendBrand ?? true,
      metaDescription: seo?.metaDescription ?? null,
      ogImage: serializeImage(seo?.ogImage ?? null),
      noindex: seo?.noindex ?? false,
    },
    updatedAt: toVietnamIso(new Date(page.updatedAt)),
  };

  if (contentHtml !== undefined) out.contentHtml = contentHtml;
  if (isContent) out.content = page.content ?? null;
  return out;
}
