import { sanitizeArticleHtml } from "./sanitize";
import { slugify } from "./slugify";

/** Mục lục sinh từ heading cấp 2 — `{ id, text, level }` (spec 4.2.2). */
export type TocEntry = { id: string; text: string; level: number };

const H2_PATTERN = /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi;

const NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

function decodeEntities(text: string): string {
  return text
    .replace(/&(?:amp|lt|gt|quot|nbsp);/g, (entity) => NAMED_ENTITIES[entity] ?? entity)
    .replace(/&#39;|&apos;/g, "'");
}

/** Text hiển thị của heading: bỏ thẻ con, decode entity, gộp khoảng trắng. */
function headingText(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueId(base: string, used: Set<string>): string {
  let id = base;
  let suffix = 2;
  while (used.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  used.add(id);
  return id;
}

/**
 * Sinh mục lục từ mọi `<h2>`: id = slugify(text), trùng lặp hậu tố `-2`, `-3`
 * và gắn đúng id đó vào thẻ h2 trong HTML trả về (US5-1).
 */
export function injectTocIds(html: string | null | undefined): {
  html: string;
  toc: TocEntry[];
} {
  if (!html) return { html: "", toc: [] };

  const toc: TocEntry[] = [];
  const used = new Set<string>();

  const output = html.replace(H2_PATTERN, (_match, _attrs: string | undefined, inner: string) => {
    const text = headingText(inner);
    const base = slugify(text) || `phan-${toc.length + 1}`;
    const id = uniqueId(base, used);
    toc.push({ id, text, level: 2 });
    return `<h2 id="${id}">${inner}</h2>`;
  });

  return { html: output, toc };
}

/** pipeline khi lưu bài: sanitize allowlist → sinh TOC + gắn id (T057). */
export function processArticleContent(raw: string | null | undefined): {
  contentHtml: string;
  tableOfContents: TocEntry[];
} {
  const clean = sanitizeArticleHtml(raw);
  const { html, toc } = injectTocIds(clean);
  return { contentHtml: html, tableOfContents: toc };
}
