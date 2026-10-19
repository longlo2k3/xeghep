import sanitizeHtml from "sanitize-html";

/** Allowlist theo spec 4.2.2 / data-model §articles (FR-D01). */
export const ARTICLE_ALLOWED_TAGS = [
  "article",
  "section",
  "div",
  "span",
  "header",
  "footer",
  "aside",
  "figure",
  "figcaption",
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
  "hr",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  "*": ["style", "class", "title", "aria-*"],
  a: ["href", "name", "title", "rel"],
  img: ["src", "alt", "width", "height", "title"],
  h2: ["id"],
  h3: ["id"],
  h4: ["id"],
  ol: ["start"],
  th: ["colspan", "rowspan"],
  td: ["colspan", "rowspan"],
};

// Keep presentation CSS in articles while excluding properties that can fetch
// resources, cover the page, or execute browser-specific CSS extensions.
const ARTICLE_STYLE_PROPERTIES = [
  "color", "background", "background-color", "border", "border-top",
  "border-right", "border-bottom", "border-left", "border-color",
  "border-style", "border-width", "border-radius", "border-collapse",
  "box-sizing", "display", "flex", "flex-direction", "flex-wrap",
  "flex-grow", "flex-shrink", "flex-basis", "align-items", "align-self",
  "align-content", "justify-content", "gap", "row-gap", "column-gap",
  "grid-template-columns", "grid-template-rows", "grid-column", "grid-row",
  "width", "height", "min-width", "min-height", "max-width", "max-height",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "font-family", "font-size", "font-weight", "font-style", "line-height",
  "letter-spacing", "text-align", "text-decoration", "text-transform",
  "vertical-align", "white-space", "word-break", "overflow-wrap",
  "overflow", "overflow-x", "overflow-y", "opacity", "list-style-type",
] as const;

// sanitize-html parses each declaration before applying these rules. Block
// external CSS resources and escapes while allowing var(), clamp() and gradients.
const SAFE_ARTICLE_STYLE_VALUE =
  /^(?!.*(?:url\s*\(|expression\s*\(|image-set\s*\(|https?:|[;{}<>\\@!]))[a-z0-9#%.,():+*/\s-]+$/i;

function articleAllowedStyles(input: string): sanitizeHtml.IOptions["allowedStyles"] {
  const properties: Record<string, RegExp[]> = Object.fromEntries(
    ARTICLE_STYLE_PROPERTIES.map((property) => [property, [SAFE_ARTICLE_STYLE_VALUE]]),
  );
  // Custom properties are scoped to the article element that defines them.
  for (const match of input.matchAll(/(?:^|[;"'])\s*(--[a-z][a-z0-9-]*)\s*:/gi)) {
    properties[match[1]] = [SAFE_ARTICLE_STYLE_VALUE];
  }
  return { "*": properties };
}

/** Thẻ bị loại kèm nội dung bên trong (không giữ text con). */
const NON_TEXT_TAGS = [
  "script",
  "style",
  "textarea",
  "option",
  "iframe",
  "object",
  "embed",
  "noscript",
];

/** Link tuyệt đối http(s) = link ra ngoài → gắn rel="noopener nofollow" (US5-2). */
export function isExternalHref(href: string | null | undefined): boolean {
  if (!href) return false;
  return /^https?:\/\//i.test(href.trim());
}

function pickAttribute(tag: string, name: string): string | null {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  if (!match) return null;
  return (match[2] ?? match[3] ?? match[4] ?? "").trim();
}

/** Loại HTML theo allowlist; link ngoài +rel; bỏ script/style/on* attribute/iframe (FR-D01). */
export function sanitizeArticleHtml(input: string | null | undefined): string {
  if (!input) return "";
  return sanitizeHtml(input, {
    allowedTags: [...ARTICLE_ALLOWED_TAGS],
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedStyles: articleAllowedStyles(input),
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

/** HTML bảng giá do quản trị viên nhập: giữ cấu trúc bảng và các hook CSS/JS, loại script và thuộc tính sự kiện. */

export function sanitizeRoutePricingHtml(
  input: string | null | undefined,
): string {
  if (!input) return "";

  return sanitizeHtml(input, {
    allowedTags: [
      // Semantic & layout
      "div",
      "section",
      "article",
      "header",
      "footer",
      "main",
      "aside",
      "nav",
      "figure",
      "figcaption",

      // Text
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "span",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "small",
      "mark",
      "sub",
      "sup",
      "blockquote",
      "pre",
      "code",

      // Lists
      "ul",
      "ol",
      "li",
      "dl",
      "dt",
      "dd",

      // Table
      "table",
      "caption",
      "colgroup",
      "col",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",

      // Links & interactive-looking elements
      "a",
      "button",

      // Other common elements
      "br",
      "hr",
      "abbr",
      "time",
      "details",
      "summary",
    ],

    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      button: ["type", "disabled"],
      th: ["scope", "colspan", "rowspan", "width", "height"],
      td: ["colspan", "rowspan", "width", "height"],
      col: ["span", "width"],
      colgroup: ["span", "width"],
      table: ["width", "height", "cellpadding", "cellspacing"],
      time: ["datetime"],
      abbr: ["title"],
      ol: ["start", "reversed", "type"],
      li: ["value"],
      details: ["open"],
      "*": [
        "class",
        "id",
        "style",
        "role",
        "title",
        "hidden",
        "dir",
        "lang",
        "width",
        "height",
        "data-*",
        "aria-*",
      ],
    },

    allowedStyles: {
      "*": {
        // Text colors
        color: [
          /^#[0-9a-f]{3,8}$/i,
          /^rgb\([\d\s,.%]+\)$/i,
          /^rgba\([\d\s,.%]+\)$/i,
          /^hsl\([\d\s,.%deg]+\)$/i,
          /^hsla\([\d\s,.%]+\)$/i,
          /^[a-z]{3,20}$/i,
        ],

        // Background
        "background-color": [
          /^#[0-9a-f]{3,8}$/i,
          /^rgb\([\d\s,.%]+\)$/i,
          /^rgba\([\d\s,.%]+\)$/i,
          /^hsl\([\d\s,.%deg]+\)$/i,
          /^hsla\([\d\s,.%]+\)$/i,
          /^[a-z]{3,20}$/i,
          /^transparent$/i,
        ],

        // Dimensions
        width: [
          /^(auto|100%|fit-content|max-content|min-content|\d+(\.\d+)?(px|rem|em|%|vw))$/i,
        ],
        height: [
          /^(auto|100%|fit-content|max-content|min-content|\d+(\.\d+)?(px|rem|em|%|vh))$/i,
        ],
        "min-width": [/^(auto|0|100%|\d+(\.\d+)?(px|rem|em|%|vw))$/i],
        "max-width": [/^(none|100%|fit-content|\d+(\.\d+)?(px|rem|em|%|vw))$/i],
        "min-height": [/^(auto|0|100%|\d+(\.\d+)?(px|rem|em|%|vh))$/i],
        "max-height": [/^(none|100%|\d+(\.\d+)?(px|rem|em|%|vh))$/i],

        // Spacing
        margin: [/^((auto|0|-?\d+(\.\d+)?(px|rem|em|%))\s*){1,4}$/i],
        "margin-top": [/^(auto|0|-?\d+(\.\d+)?(px|rem|em|%))$/i],
        "margin-right": [/^(auto|0|-?\d+(\.\d+)?(px|rem|em|%))$/i],
        "margin-bottom": [/^(auto|0|-?\d+(\.\d+)?(px|rem|em|%))$/i],
        "margin-left": [/^(auto|0|-?\d+(\.\d+)?(px|rem|em|%))$/i],
        padding: [/^((0|\d+(\.\d+)?(px|rem|em|%))\s*){1,4}$/i],
        "padding-top": [/^(0|\d+(\.\d+)?(px|rem|em|%))$/i],
        "padding-right": [/^(0|\d+(\.\d+)?(px|rem|em|%))$/i],
        "padding-bottom": [/^(0|\d+(\.\d+)?(px|rem|em|%))$/i],
        "padding-left": [/^(0|\d+(\.\d+)?(px|rem|em|%))$/i],

        // Border
        border: [
          /^(none|0|\d+(\.\d+)?(px|rem|em)\s+(solid|dashed|dotted|double)\s+([#a-z0-9(),.%\s]+))$/i,
        ],
        "border-width": [/^(0|\d+(\.\d+)?(px|rem|em))$/i],
        "border-style": [/^(none|solid|dashed|dotted|double)$/i],
        "border-color": [/^#[0-9a-f]{3,8}$/i, /^[a-z]{3,20}$/i],
        "border-radius": [/^((0|\d+(\.\d+)?(px|rem|em|%))\s*){1,4}$/i],
        "border-collapse": [/^(collapse|separate)$/i],

        // Typography
        "text-align": [/^(left|right|center|justify|start|end)$/i],
        "vertical-align": [/^(top|middle|bottom|baseline|sub|super)$/i],
        "font-weight": [/^(normal|bold|[1-9]00)$/i],
        "font-style": [/^(normal|italic|oblique)$/i],
        "font-size": [/^\d+(\.\d+)?(px|rem|em|%)$/i],
        "font-family": [/^[a-z0-9\s,"'-]+$/i],
        "line-height": [/^(normal|\d+(\.\d+)?(px|rem|em|%)?)$/i],
        "letter-spacing": [/^(normal|-?\d+(\.\d+)?(px|rem|em))$/i],
        "text-decoration": [/^(none|underline|overline|line-through)$/i],
        "text-transform": [/^(none|uppercase|lowercase|capitalize)$/i],
        "white-space": [
          /^(normal|nowrap|pre|pre-wrap|pre-line|break-spaces)$/i,
        ],
        "word-break": [/^(normal|break-all|keep-all|break-word)$/i],
        "overflow-wrap": [/^(normal|anywhere|break-word)$/i],

        // Layout
        display: [
          /^(block|inline|inline-block|flex|inline-flex|grid|inline-grid|none|table|table-row|table-cell|table-header-group|table-row-group)$/i,
        ],
        "box-sizing": [/^(border-box|content-box)$/i],
        overflow: [/^(visible|hidden|auto|scroll|clip)$/i],
        "overflow-x": [/^(visible|hidden|auto|scroll|clip)$/i],
        "overflow-y": [/^(visible|hidden|auto|scroll|clip)$/i],
        "flex-direction": [/^(row|row-reverse|column|column-reverse)$/i],
        "flex-wrap": [/^(nowrap|wrap|wrap-reverse)$/i],
        "flex-grow": [/^\d+(\.\d+)?$/],
        "flex-shrink": [/^\d+(\.\d+)?$/],
        "flex-basis": [/^(auto|0|100%|\d+(\.\d+)?(px|rem|em|%))$/i],
        "justify-content": [
          /^(start|end|center|flex-start|flex-end|space-between|space-around|space-evenly)$/i,
        ],
        "align-items": [
          /^(start|end|center|stretch|baseline|flex-start|flex-end)$/i,
        ],
        "align-self": [
          /^(auto|start|end|center|stretch|baseline|flex-start|flex-end)$/i,
        ],
        "align-content": [
          /^(start|end|center|stretch|space-between|space-around|space-evenly|flex-start|flex-end)$/i,
        ],
        gap: [
          /^(0|\d+(\.\d+)?(px|rem|em|%)|\d+(\.\d+)?(px|rem|em|%)\s+\d+(\.\d+)?(px|rem|em|%))$/i,
        ],
        "row-gap": [/^(0|\d+(\.\d+)?(px|rem|em|%))$/i],
        "column-gap": [/^(0|\d+(\.\d+)?(px|rem|em|%))$/i],
        "grid-template-columns": [
          /^(none|repeat\(\d+,\s*(\d+(\.\d+)?fr|\d+(\.\d+)?(px|rem|em|%))\)|(\d+(\.\d+)?(px|rem|em|%|fr|auto)\s*)+)$/i,
        ],
        "grid-template-rows": [
          /^(none|repeat\(\d+,\s*(\d+(\.\d+)?fr|\d+(\.\d+)?(px|rem|em|%))\)|(\d+(\.\d+)?(px|rem|em|%|fr|auto)\s*)+)$/i,
        ],
        "grid-column": [/^(auto|span \d+|\d+(\s*\/\s*(auto|\d+|span \d+))?)$/i],
        "grid-row": [/^(auto|span \d+|\d+(\s*\/\s*(auto|\d+|span \d+))?)$/i],

        // Table
        "table-layout": [/^(auto|fixed)$/i],
        "caption-side": [/^(top|bottom)$/i],
        "empty-cells": [/^(show|hide)$/i],

        // Other safe visual properties
        opacity: [/^(0|1|0?\.\d+|1\.0+)$/],
        cursor: [/^(auto|default|pointer|text|not-allowed|help|move|wait)$/i],
        "object-fit": [/^(fill|contain|cover|none|scale-down)$/i],
        "object-position": [/^(center|top|bottom|left|right|\d+%(\s+\d+%)?)$/i],
        "list-style-type": [
          /^(none|disc|circle|square|decimal|decimal-leading-zero|lower-alpha|upper-alpha|lower-roman|upper-roman)$/i,
        ],
      },
    },

    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    nonTextTags: [...NON_TEXT_TAGS],

    transformTags: {
      "*": (tagName, attribs) => {
        const { classname, ...rest } = attribs;

        const normalized =
          classname && !rest.class ? { ...rest, class: classname } : rest;

        if (tagName === "a") {
          if (isExternalHref(normalized.href)) {
            normalized.rel = "noopener noreferrer nofollow";
            normalized.target = "_blank";
          }

          // Prevent javascript:, data:, vbscript: and other unsafe URLs
          // through sanitize-html's URL validation as well.
        }

        if (tagName === "button") {
          normalized.type = "button";
        }

        return {
          tagName: tagName === "h1" || tagName === "h2" ? "h3" : tagName,
          attribs: normalized,
        };
      },
    },
  });
}

/**
 * Validate nội dung trước khi lưu: mỗi `<img>` bắt buộc alt + width + height (FR-D02).
 * Trả `true` nếu hợp lệ, ngược lại trả thông báo lỗi tiếng Việt.
 */
export function validateArticleHtml(
  input: string | null | undefined,
): true | string {
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
    if (
      !width ||
      !Number.isFinite(Number(width)) ||
      !height ||
      !Number.isFinite(Number(height))
    ) {
      errors.push(`Thẻ <img> "${alt}" phải có width/height dạng số (FR-D02).`);
    }
  }

  return errors.length > 0 ? errors.join(" ") : true;
}
