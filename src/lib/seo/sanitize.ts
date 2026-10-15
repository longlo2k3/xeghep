import sanitizeHtml from "sanitize-html";

/** Allowlist theo spec 4.2.2 / data-model §articles (FR-D01). */
export const ARTICLE_ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "blockquote",
  "br",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "name", "title", "rel"],
  img: ["src", "alt", "width", "height", "title"],
  h2: ["id"],
  h3: ["id"],
  h4: ["id"],
  ol: ["start"],
  th: ["colspan", "rowspan"],
  td: ["colspan", "rowspan"],
};

/** Thẻ bị loại kèm nội dung bên trong (không giữ text con). */
const NON_TEXT_TAGS = ["script", "style", "textarea", "option", "iframe", "object", "embed", "noscript"];

/** Link tuyệt đối http(s) = link ra ngoài → gắn rel="noopener nofollow" (US5-2). */
export function isExternalHref(href: string | null | undefined): boolean {
  if (!href) return false;
  return /^https?:\/\//i.test(href.trim());
}

function pickAttribute(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  if (!match) return null;
  return (match[2] ?? match[3] ?? match[4] ?? "").trim();
}

/** Loại HTML theo allowlist; link ngoài +rel; bỏ script/style/on* attribute/iframe (FR-D01). */
export function sanitizeArticleHtml(input: string | null | undefined): string {
  if (!input) return "";
  return sanitizeHtml(input, {
    allowedTags: [...ARTICLE_ALLOWED_TAGS],
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesAppliedToAttributes: ["href", "src"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    nonTextTags: [...NON_TEXT_TAGS],
    transformTags: {
      a: (tagName, attribs) => {
        if (isExternalHref(attribs.href)) {
          return { tagName, attribs: { ...attribs, rel: "noopener nofollow" } };
        }
        return { tagName, attribs };
      },
    },
  });
}

/**
 * Validate nội dung trước khi lưu: mỗi `<img>` bắt buộc alt + width + height (FR-D02).
 * Trả `true` nếu hợp lệ, ngược lại trả thông báo lỗi tiếng Việt.
 */
export function validateArticleHtml(input: string | null | undefined): true | string {
  if (!input || !input.trim()) return true;

  const errors: string[] = [];
  const images = input.match(/<img\b[^>]*>/gi) ?? [];
  for (const image of images) {
    const alt = pickAttribute(image, "alt");
    if (alt === null || alt === "") {
      errors.push("Thẻ <img> thiếu alt bắt buộc (FR-D02).");
      continue;
    }
    const width = pickAttribute(image, "width");
    const height = pickAttribute(image, "height");
    if (!width || !Number.isFinite(Number(width)) || !height || !Number.isFinite(Number(height))) {
      errors.push(`Thẻ <img> "${alt}" phải có width/height dạng số (FR-D02).`);
    }
  }

  return errors.length > 0 ? errors.join(" ") : true;
}
