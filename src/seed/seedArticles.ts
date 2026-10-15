import { loadEnv } from "payload/node";

import { processArticleContent } from "../lib/seo/toc";
import { SEED_ARTICLES, type SeedArticle } from "./data/articles";

(process.env as Record<string, string | undefined>).NODE_ENV = "development";
loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");
const { getMediaId, runSeedMedia } = await import("./seedMedia");

/**
 * Seed collection `articles` — 2 bài mẫu từ TestSEO (T061 / FR-D12).
 * Chạy: `npm run seed:articles`. Idempotent: chạy lại = update theo slug.
 * HTML thô → sanitize allowlist + sinh TOC trước khi lưu (hook chạy lại khi lưu).
 */

const BRAND_SUFFIX_LEN = 20; // " | Xe Ghép Liên Tỉnh"

function buildSeo(article: SeedArticle) {
  if (article.title.length > 70) {
    throw new Error(`metaTitle > 70 ký tự (${article.title.length}): ${article.slug}`);
  }
  if (article.excerpt.length > 160) {
    throw new Error(`metaDescription > 160 ký tự (${article.excerpt.length}): ${article.slug}`);
  }
  return {
    metaTitle: article.title,
    appendBrand: false,
    metaDescription: article.excerpt,
    noindex: false,
  };
}

const payload = await getPayload({ config });

const mediaStats = await runSeedMedia(payload);
payload.logger.info(
  `Seed media: ${mediaStats.created} tạo mới, ${mediaStats.updated} cập nhật alt, ${mediaStats.total} bản ghi (${mediaStats.copied} file copy vào media/).`,
);

function requireMediaId(filename: string, slug: string): number {
  const id = getMediaId(filename);
  if (id == null) {
    throw new Error(`Thiếu media "${filename}" cho bài ${slug} — chạy seed:media trước.`);
  }
  return Number(id);
}

async function resolveRouteId(slug: string, articleSlug: string): Promise<number | undefined> {
  const res = await payload.find({
    collection: "routes",
    limit: 1,
    depth: 0,
    where: { slug: { equals: slug } },
    overrideAccess: true,
  });
  if (res.docs.length === 0) {
    payload.logger.warn(`Thiếu tuyến "${slug}" cho bài ${articleSlug} — bỏ qua relatedRoute.`);
    return undefined;
  }
  return Number(res.docs[0].id);
}

let created = 0;
let updated = 0;

for (const article of SEED_ARTICLES) {
  const { contentHtml } = processArticleContent(article.content);
  const relatedRoute = await resolveRouteId(article.relatedRouteSlug, article.slug);

  const data = {
    slug: article.slug,
    title: article.title,
    category: article.category,
    excerpt: article.excerpt,
    content: contentHtml,
    author: article.author,
    authorType: "Organization" as const,
    featuredImage: requireMediaId(article.imageFilename, article.slug),
    ...(relatedRoute !== undefined ? { relatedRoute } : {}),
    status: "published" as const,
    publishedAt: article.publishedAt,
    seo: buildSeo(article),
  };

  const existing = await payload.find({
    collection: "articles",
    limit: 1,
    where: { slug: { equals: article.slug } },
    overrideAccess: true,
  });

  if (existing.docs.length > 0) {
    await payload.update({
      id: existing.docs[0].id,
      collection: "articles",
      data,
      overrideAccess: true,
    });
    updated += 1;
  } else {
    await payload.create({ collection: "articles", data, overrideAccess: true });
    created += 1;
  }
}

payload.logger.info(`Seed articles: ${created} tạo mới, ${updated} cập nhật.`);

// ── Đối soát: đủ 2 bài, TOC khớp số h2, HTML sạch, Ảnh/seo hợp lệ ──────────
const verify = await payload.find({
  collection: "articles",
  limit: 20,
  depth: 1,
  sort: "slug",
  overrideAccess: true,
});

if (verify.totalDocs !== SEED_ARTICLES.length) {
  throw new Error(`Lệch số bản ghi articles: ${verify.totalDocs} ≠ ${SEED_ARTICLES.length}.`);
}

const rows = verify.docs.map((doc) => {
  const html = doc.contentHtml ?? "";
  const toc = Array.isArray(doc.tableOfContents) ? doc.tableOfContents : [];
  const h2Count = (html.match(/<h2\b/g) ?? []).length;
  const image = doc.featuredImage && typeof doc.featuredImage === "object" ? doc.featuredImage : null;

  if (h2Count === 0 || toc.length !== h2Count) {
    throw new Error(`TOC không khớp số h2 ở bài ${doc.slug}: ${toc.length} ≠ ${h2Count}.`);
  }
  if (!html.includes('<h2 id="')) {
    throw new Error(`contentHtml thiếu id trên h2 ở bài ${doc.slug}.`);
  }
  if (/<script|<iframe| onclick=|<style/i.test(html)) {
    throw new Error(`contentHtml chưa được sanitize ở bài ${doc.slug}.`);
  }
  if (!image?.alt) {
    throw new Error(`Thiếu alt trên featuredImage của bài ${doc.slug}.`);
  }
  if (!doc.publishedAt) {
    throw new Error(`Thiếu publishedAt của bài ${doc.slug}.`);
  }

  return {
    slug: doc.slug,
    category: doc.category,
    toc: toc.length,
    h2: h2Count,
    contentHtmlLen: html.length,
    image: image.filename,
    relatedRoute: doc.relatedRoute && typeof doc.relatedRoute === "object" ? doc.relatedRoute.slug : null,
    publishedAt: doc.publishedAt ? String(doc.publishedAt).slice(0, 10) : "",
    displayLen: (doc.seo?.metaTitle ?? "").length + (doc.seo?.appendBrand === false ? 0 : BRAND_SUFFIX_LEN),
  };
});

console.table(rows);

for (const row of rows) {
  if (row.displayLen > 70) {
    throw new Error(`Metadata vượt 70 ký tự ở ${row.slug}`);
  }
}

payload.logger.info(
  `Đối soát articles: ${verify.totalDocs}/${SEED_ARTICLES.length} bản ghi, TOC khớp h2, HTML đã sanitize.`,
);

await payload.destroy();
process.exit(0);
