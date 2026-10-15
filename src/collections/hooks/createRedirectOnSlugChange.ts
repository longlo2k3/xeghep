import {
  isLiveStatus,
  planSlugChangeRedirects,
  slugToPath,
  type RedirectRule,
} from "../../lib/seo/redirectRules";

type SlugChangeHookArgs = {
  doc?: Record<string, any>;
  previousDoc?: Record<string, any>;
  req?: any;
  operation?: string;
};

/**
 * Hook factory `afterChange` (spec US6 §2.5 / FR-C09): khi slug của bản ghi
 * active/published đổi → gộp chuỗi redirect cũ thẳng sang đích mới, xóa các
 * bản ghi gây vòng lặp, rồi tạo redirect 301 nguồn "auto" từ URL cũ → URL mới.
 *
 * @param basePath đường dẫn gốc của collection: 'tuyen-lien-tinh' | 'tin-tuc' |
 * '' (pages — slug 'home' → '/'). Slug chứa '/' (chinh-sach/bao-mat) được giữ.
 */
export function createRedirectOnSlugChange(basePath = "") {
  return async ({ doc, previousDoc, req, operation }: SlugChangeHookArgs) => {
    if (operation !== "update" || !doc || !previousDoc || !req?.payload) return doc;

    const previousSlug = previousDoc.slug;
    const nextSlug = doc.slug;
    if (typeof previousSlug !== "string" || typeof nextSlug !== "string") return doc;
    if (previousSlug === nextSlug) return doc;
    if (!isLiveStatus(doc.status ?? previousDoc.status)) return doc;

    const oldPath = slugToPath(basePath, previousSlug);
    const newPath = slugToPath(basePath, nextSlug);

    try {
      const res = await req.payload.find({
        collection: "redirects",
        limit: 2000,
        depth: 0,
        overrideAccess: true,
      });
      const plan = planSlugChangeRedirects({
        oldPath,
        newPath,
        active: true,
        existing: res.docs as unknown as RedirectRule[],
      });

      for (const id of plan.deletes) {
        await req.payload.delete({
          collection: "redirects",
          id,
          req,
          overrideAccess: true,
        });
      }
      for (const update of plan.updates) {
        await req.payload.update({
          collection: "redirects",
          id: update.id,
          data: { toUrl: update.toUrl },
          req,
          overrideAccess: true,
        });
      }
      if (plan.create) {
        await req.payload.create({
          collection: "redirects",
          data: {
            fromUrl: plan.create.fromUrl,
            toUrl: plan.create.toUrl,
            statusCode: String(plan.create.statusCode),
            source: plan.create.source,
            isActive: true,
          },
          req,
          overrideAccess: true,
        });
      }
    } catch (err) {
      // Không chặn lưu admin khi redirect lỗi (FR-E03) — chỉ ghi log.
      console.error(`[redirect] ${oldPath} → ${newPath}`, err);
    }

    return doc;
  };
}
