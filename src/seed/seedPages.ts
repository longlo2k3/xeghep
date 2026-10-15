import { loadEnv } from "payload/node";

import type { Page as PageDoc } from "../payload-types";

(process.env as Record<string, string | undefined>).NODE_ENV = "development";
loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");

/** Dữ liệu create/update — payload-types chưa có contentHtml nên mở rộng thủ công. */
type PageSeedData = Omit<PageDoc, "id" | "createdAt" | "updatedAt"> & {
  contentHtml?: string;
};

/**
 * Seed collection `pages` — 6 trang hệ thống + 3 trang chính sách (spec 4.2.3, §2.2).
 * Nguồn metadata: TestSEO (page.tsx của từng route — title/description truyền vào constructMetadata).
 * Chạy: `npm run seed:pages`. Idempotent: chạy lại = update theo slug.
 */

const BRAND_SUFFIX_LEN = 20; // " | Xe Ghép Liên Tỉnh"

type Inline = { text: string; strong?: boolean; href?: string };
type Block =
  | { type: "heading"; level: 2 | 3 | 4; inlines: Inline[] }
  | { type: "paragraph"; inlines: Inline[] }
  | { type: "list"; ordered?: boolean; items: Inline[][] };

type SeedPage = {
  slug: string;
  kind: "system" | "content";
  title: string;
  metaTitle: string;
  appendBrand: boolean;
  metaDescription: string;
  blocks?: Block[];
};

const t = (text: string): Inline => ({ text });
const b = (text: string): Inline => ({ text, strong: true });
const a = (text: string, href: string): Inline => ({ text, href });

const SEED_PAGES: SeedPage[] = [
  // ── 6 trang hệ thống (chỉ SEO) ───────────────────────────────────────────
  {
    slug: "home",
    kind: "system",
    title: "Xe Ghép Liên Tỉnh",
    metaTitle: "Xe Ghép Liên Tỉnh - Móng Cái, Hạ Long, Hải Phòng, Bắc Ninh, Bắc Giang",
    appendBrand: false, // title gốc 77 ký tự → đã cắt về 69, không thêm hậu tố (xem báo cáo)
    metaDescription:
      "Dịch vụ xe ghép liên tỉnh chuyên tuyến Móng Cái – Hạ Long – Hải Phòng – Bắc Ninh – Bắc Giang – Hà Nội. 100% xe riêng đời mới, giá trọn gói, phục vụ 24/7.",
  },
  {
    slug: "gioi-thieu",
    kind: "system",
    title: "Giới thiệu về Xe Ghép Liên Tỉnh",
    metaTitle: "Giới Thiệu Về Xe Ghép Liên Tỉnh - Tiện Chuyến Đón Tận Nhà",
    appendBrand: false, // 57 + 20 > 70
    metaDescription:
      "Giới thiệu dịch vụ Xe Ghép Liên Tỉnh chuyên tuyến Móng Cái – Hạ Long – Hải Phòng – Bắc Ninh – Bắc Giang – Hà Nội. 100% xe riêng đời mới, phục vụ 24/7.",
  },
  {
    slug: "lien-he",
    kind: "system",
    title: "Liên hệ",
    metaTitle: "Liên Hệ Đặt Xe Ghép - Phục Vụ 24/7 Toàn Tuyến Liên Tỉnh",
    appendBrand: false, // 55 + 20 > 70
    metaDescription:
      "Tổng đài liên hệ và đặt xe ghép liên tỉnh 24/7. Hỗ trợ đón trả tận nhà, bao xe riêng, gửi hàng hỏa tốc các tuyến Móng Cái – Hạ Long – Hải Phòng – Bắc Ninh.",
  },
  {
    slug: "tuyen-lien-tinh",
    kind: "system",
    title: "Các tuyến xe ghép liên tỉnh",
    metaTitle: "Các Tuyến Xe Ghép Liên Tỉnh - Bảng Giá Mới Nhất 2026",
    appendBrand: false, // 52 + 20 > 70
    metaDescription:
      "Danh sách các tuyến xe ghép liên tỉnh đón trả tận nhà: Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang, Thái Nguyên, Hải Dương.",
  },
  {
    slug: "tin-tuc",
    kind: "system",
    title: "Tin tức",
    metaTitle: "Tin Tức & Cẩm Nang Xe Ghép Liên Tỉnh 2026",
    appendBrand: true,
    metaDescription:
      "Cập nhật tin tức, cẩm nang và kinh nghiệm đi xe ghép liên tỉnh Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang đón trả tận nơi.",
  },
  {
    slug: "dat-xe",
    kind: "system",
    title: "Đặt Xe Trực Tuyến",
    metaTitle: "Đặt Xe Trực Tuyến - Xe Ghép Liên Tỉnh",
    appendBrand: true,
    metaDescription:
      "Đặt xe ghép liên tỉnh Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang 24/7. Nhận báo giá tức thì, đón trả tận nhà, miễn phí hủy chuyến.",
  },

  // ── 3 trang chính sách (kind=content, có contentHtml) ────────────────────
  {
    slug: "chinh-sach/bao-mat",
    kind: "content",
    title: "Chính Sách Bảo Mật Thông Tin - Xe Ghép Liên Tỉnh",
    metaTitle: "Chính Sách Bảo Mật Thông Tin - Xe Ghép Liên Tỉnh",
    appendBrand: true, // 48 + 20 = 68 ≤ 70
    metaDescription:
      "Chính sách bảo mật thông tin hành khách tại Xe Ghép Liên Tỉnh. Cam kết bảo mật số điện thoại, địa chỉ nhà, lộ trình di chuyển 100%.",
    blocks: [
      {
        type: "paragraph",
        inlines: [
          t(
            "Xe Ghép Liên Tỉnh tôn trọng và cam kết bảo vệ quyền riêng tư cũng như dữ liệu cá nhân của quý khách hàng.",
          ),
        ],
      },
      { type: "heading", level: 2, inlines: [t("1. Mục Đích Thu Thập Dữ Liệu")] },
      {
        type: "paragraph",
        inlines: [
          t(
            "Khi quý khách đặt xe trực tuyến hoặc liên hệ tổng đài, chúng tôi chỉ thu thập các thông tin tối thiểu cần thiết để phục vụ hành trình:",
          ),
        ],
      },
      {
        type: "list",
        items: [
          [t("Họ và tên hành khách.")],
          [t("Số điện thoại liên lạc để tài xế hẹn giờ và đón trả.")],
          [t("Địa chỉ điểm đón và điểm đến mong muốn.")],
          [t("Thời gian xuất phát và loại dịch vụ lựa chọn (ghép ghế / bao xe).")],
        ],
      },
      { type: "heading", level: 2, inlines: [t("2. Phạm Vi Sử Dụng Thông Tin")] },
      {
        type: "paragraph",
        inlines: [t("Thông tin của quý khách chỉ được sử dụng nội bộ nhằm mục đích:")],
      },
      {
        type: "list",
        items: [
          [t("Điều phối tài xế gần nhất đến đón khách đúng giờ.")],
          [t("Liên lạc xác nhận chuyến đi hoặc xử lý khiếu nại, phản hồi chất lượng.")],
          [t("Áp dụng chính sách ưu đãi giảm 10% cước phí cho khách hàng cũ.")],
        ],
      },
      {
        type: "heading",
        level: 2,
        inlines: [t("3. Cam Kết Tuyệt Đối Không Chia Sẻ Dữ Liệu")],
      },
      {
        type: "paragraph",
        inlines: [
          t("Chúng tôi cam kết "),
          b("không bán, không chia sẻ, không chuyển nhượng"),
          t(
            " thông tin số điện thoại hay địa chỉ nhà của quý khách cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc tiếp thị làm phiền.",
          ),
        ],
      },
      {
        type: "heading",
        level: 2,
        inlines: [t("4. Quyền Yêu Cầu Xóa Dữ Liệu Của Khách Hàng")],
      },
      {
        type: "paragraph",
        inlines: [
          t(
            "Bất kỳ lúc nào sau khi chuyến đi kết thúc, quý khách có quyền yêu cầu xóa bỏ toàn bộ lịch sử thông tin chuyến đi và số điện thoại khỏi hệ thống tổng đài bằng cách gọi trực tiếp đến hotline ",
          ),
          b("0962.298.293"),
          t(" hoặc gửi email tới "),
          b("xegheplientinhvip@gmail.com"),
          t("."),
        ],
      },
      {
        type: "paragraph",
        inlines: [t("Thắc mắc về quyền riêng tư? Liên hệ tổng đài 24/7.")],
      },
      { type: "paragraph", inlines: [a("0962.298.293", "tel:0962298293")] },
    ],
  },
  {
    slug: "chinh-sach/dam-bao",
    kind: "content",
    title: "Chính Sách Đảm Bảo & Cam Kết Hoàn Tiền - Xe Ghép Liên Tỉnh",
    metaTitle: "Chính Sách Đảm Bảo & Cam Kết Hoàn Tiền - Xe Ghép Liên Tỉnh",
    appendBrand: false, // 58 + 20 > 70
    metaDescription:
      "Chính sách đảm bảo chất lượng dịch vụ tại Xe Ghép Liên Tỉnh. Cam kết hoàn tiền 100%, đền 200% nếu dịch vụ không đúng cam kết, đổi hủy chuyến miễn phí.",
    blocks: [
      {
        type: "paragraph",
        inlines: [
          t(
            "Cam kết dịch vụ 5 sao, chính sách hoàn tiền 100% và đền bù 200% vì quyền lợi tối thượng của hành khách.",
          ),
        ],
      },
      { type: "heading", level: 2, inlines: [t("Cam Kết Hoàn Tiền 100% – Đền Bù 200%")] },
      {
        type: "paragraph",
        inlines: [
          t(
            "Chúng tôi khẳng định chất lượng vượt trội bằng cam kết rõ ràng: nếu chuyến đi không đảm bảo chất lượng như đã thỏa thuận (nhồi nhét khách, tự ý bỏ khách, lái xe có thái độ thiếu tôn trọng, xe không đúng tiêu chuẩn sạch sẽ mát mẻ), Xe Ghép Liên Tỉnh sẵn sàng ",
          ),
          b("hoàn tiền 100% và đền 200%"),
          t(" cước phí cho hành khách."),
        ],
      },
      // Mục "Nội Dung Cam Kết Tiêu Chuẩn" — 6 cam kết lấy từ company_settings ở frontend (bỏ qua ở đây).
      { type: "heading", level: 2, inlines: [t("Nội Dung Cam Kết Tiêu Chuẩn")] },
      { type: "heading", level: 2, inlines: [t("Quy Định Đổi Và Hủy Chuyến Miễn Phí")] },
      {
        type: "paragraph",
        inlines: [
          t(
            "Khi có sự thay đổi lịch trình công tác, việc gia đình hoặc vấn đề phát sinh đột xuất, quý khách chỉ cần thông báo cho tổng đài qua hotline ",
          ),
          b("0962.298.293"),
          t(
            " trước giờ xe chạy ít nhất 30 phút. Chúng tôi hỗ trợ dời giờ hoặc hủy chuyến hoàn toàn miễn phí, không thu phí phạt hủy chuyến.",
          ),
        ],
      },
      {
        type: "paragraph",
        inlines: [t("Kênh tiếp nhận phản ánh & hỗ trợ bảo hành dịch vụ 24/7")],
      },
      { type: "paragraph", inlines: [t("Hotline 24/7: "), a("0962.298.293", "tel:0962298293")] },
    ],
  },
  {
    slug: "chinh-sach/thanh-toan",
    kind: "content",
    title: "Chính Sách Thanh Toán - Xe Ghép Liên Tỉnh",
    metaTitle: "Chính Sách Thanh Toán - Xe Ghép Liên Tỉnh",
    appendBrand: true, // 41 + 20 = 61 ≤ 70
    metaDescription:
      "Quy định và chính sách thanh toán dịch vụ xe ghép, bao xe tại Xe Ghép Liên Tỉnh. Thanh toán sau chuyến đi, tiền mặt hoặc chuyển khoản minh bạch.",
    blocks: [
      {
        type: "paragraph",
        inlines: [
          t(
            "Xe Ghép Liên Tỉnh áp dụng chính sách thanh toán linh hoạt, minh bạch và an toàn tuyệt đối cho khách hàng.",
          ),
        ],
      },
      { type: "heading", level: 2, inlines: [t("1. Nguyên Tắc Thanh Toán Sau Chuyến Đi")] },
      {
        type: "paragraph",
        inlines: [
          t(
            "Để đảm bảo quyền lợi tối đa cho quý khách, đối với các chuyến xe đi ghép ghế thông thường, quý khách ",
          ),
          b("không cần phải đặt cọc trước"),
          t(
            ". Quý khách chỉ thanh toán cước phí sau khi chuyến đi kết thúc an toàn tại đúng điểm đến đã thỏa thuận.",
          ),
        ],
      },
      {
        type: "paragraph",
        inlines: [
          t(
            "Giá cước báo cho khách hàng đã bao gồm toàn bộ phí cầu đường bến bãi cao tốc. Cam kết không thu thêm bất kỳ phụ phí ngoài thỏa thuận.",
          ),
        ],
      },
      // Mục "Các Hình Thức Thanh Toán" — paymentMethods lấy từ company_settings ở frontend (bỏ qua ở đây).
      { type: "heading", level: 2, inlines: [t("2. Các Hình Thức Thanh Toán Chấp Nhận")] },
      {
        type: "heading",
        level: 2,
        inlines: [t("3. Đối Với Hợp Đồng Bao Xe & Gửi Hàng Hóa")],
      },
      {
        type: "list",
        items: [
          [
            b("Bao xe hợp đồng nhiều ngày hoặc lộ trình xa:"),
            t(
              " Quý khách có thể được yêu cầu đặt cọc trước từ 10% – 20% giá trị hợp đồng để đảm bảo xe giữ chỗ đúng ngày giờ yêu cầu.",
            ),
          ],
          [
            b("Gửi hàng hóa hỏa tốc:"),
            t(
              " Người gửi có thể thanh toán trước khi gửi hàng hoặc người nhận thanh toán khi nhận hàng tận tay (Ship COD cước vận chuyển).",
            ),
          ],
        ],
      },
      {
        type: "paragraph",
        inlines: [t("Cần hóa đơn VAT hoặc xuất chứng từ thanh toán cho doanh nghiệp?")],
      },
      {
        type: "paragraph",
        inlines: [t("Liên hệ Hotline: "), a("0962.298.293", "tel:0962298293")],
      },
    ],
  },
];

// ── Sinh HTML (allowlist: p h2 h3 h4 ul ol li strong em a br) ───────────────
const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function renderInlines(inlines: Inline[], { withLinks }: { withLinks: boolean }): string {
  return inlines
    .map((inline) => {
      let html = escapeHtml(inline.text);
      if (inline.strong) html = `<strong>${html}</strong>`;
      if (withLinks && inline.href) html = `<a href="${inline.href}">${html}</a>`;
      return html;
    })
    .join("");
}

function blocksToHtml(blocks: Block[]): string {
  return blocks
    .map((block) => {
      if (block.type === "heading") {
        return `<h${block.level}>${renderInlines(block.inlines, { withLinks: false })}</h${block.level}>`;
      }
      if (block.type === "list") {
        const tag = block.ordered ? "ol" : "ul";
        const items = block.items
          .map((item) => `<li>${renderInlines(item, { withLinks: true })}</li>`)
          .join("");
        return `<${tag}>${items}</${tag}>`;
      }
      return `<p>${renderInlines(block.inlines, { withLinks: true })}</p>`;
    })
    .join("\n");
}

// ── Sinh Lexical JSON cho trường `content` (richText) ──────────────────────
function toLexicalText(inlines: Inline[]) {
  return inlines.map((inline) => ({
    type: "text",
    text: inline.text,
    format: inline.strong ? 1 : 0,
    version: 1,
  }));
}

const LEXICAL_PROPS = { direction: "ltr" as const, format: "" as const, indent: 0, version: 1 };

function blocksToLexical(blocks: Block[]) {
  const children = blocks.map((block) => {
    if (block.type === "heading") {
      return { type: "heading", tag: `h${block.level}`, children: toLexicalText(block.inlines), ...LEXICAL_PROPS };
    }
    if (block.type === "list") {
      return {
        type: "list",
        listType: block.ordered ? "number" : "bullet",
        start: 1,
        tag: block.ordered ? "ol" : "ul",
        children: block.items.map((item, index) => ({
          type: "listitem",
          value: index + 1,
          children: toLexicalText(item),
          ...LEXICAL_PROPS,
        })),
        ...LEXICAL_PROPS,
      };
    }
    return { type: "paragraph", children: toLexicalText(block.inlines), ...LEXICAL_PROPS };
  });
  return { root: { type: "root", children, ...LEXICAL_PROPS } };
}

// ── Validate metadata trước khi ghi (SEO-1 / maxLength Payload) ─────────────
function buildSeo(page: SeedPage) {
  const total = page.metaTitle.length + (page.appendBrand ? BRAND_SUFFIX_LEN : 0);
  if (page.metaTitle.length > 70) {
    throw new Error(`metaTitle > 70 ký tự (${page.metaTitle.length}): ${page.slug}`);
  }
  if (total > 70) {
    throw new Error(`metaTitle + hậu tố = ${total} ký tự (> 70): ${page.slug}`);
  }
  if (page.metaDescription.length > 160) {
    throw new Error(`metaDescription > 160 ký tự (${page.metaDescription.length}): ${page.slug}`);
  }
  return {
    metaTitle: page.metaTitle,
    appendBrand: page.appendBrand,
    metaDescription: page.metaDescription,
    noindex: false,
  };
}

const payload = await getPayload({ config });

let created = 0;
let updated = 0;

for (const page of SEED_PAGES) {
  const data: PageSeedData = {
    slug: page.slug,
    kind: page.kind,
    title: page.title,
    status: "published",
    seo: buildSeo(page),
    ...(page.blocks
      ? {
          content: blocksToLexical(page.blocks) as PageDoc["content"],
          contentHtml: blocksToHtml(page.blocks),
        }
      : {}),
  };

  const existing = await payload.find({
    collection: "pages",
    limit: 1,
    where: { slug: { equals: page.slug } },
    overrideAccess: true,
  });

  if (existing.docs.length > 0) {
    await payload.update({
      id: existing.docs[0].id,
      collection: "pages",
      data,
      overrideAccess: true,
    });
    updated += 1;
  } else {
    await payload.create({ collection: "pages", data, overrideAccess: true });
    created += 1;
  }
}

payload.logger.info(`Seed pages: ${created} tạo mới, ${updated} cập nhật.`);

// ── Đối soát: đủ 9 bản ghi + in bảng metadata ──────────────────────────────
const verify = await payload.find({
  collection: "pages",
  limit: 20,
  depth: 0,
  sort: "slug",
  overrideAccess: true,
});

if (verify.totalDocs !== SEED_PAGES.length) {
  throw new Error(`Lệch số bản ghi pages: ${verify.totalDocs} ≠ ${SEED_PAGES.length}.`);
}

const rows = verify.docs.map((doc) => {
  const seo = (doc.seo ?? {}) as {
    metaTitle?: string | null;
    appendBrand?: boolean | null;
    metaDescription?: string | null;
  };
  const metaTitle = seo.metaTitle ?? "";
  const appendBrand = seo.appendBrand !== false;
  const docAny = doc as unknown as { contentHtml?: string | null };
  return {
    slug: doc.slug,
    title: doc.title,
    titleLen: doc.title.length,
    metaTitle,
    metaTitleLen: metaTitle.length,
    displayLen: metaTitle.length + (appendBrand ? BRAND_SUFFIX_LEN : 0),
    appendBrand,
    descLen: (seo.metaDescription ?? "").length,
    contentHtmlLen: docAny.contentHtml ? docAny.contentHtml.length : 0,
    status: doc.status,
  };
});

console.table(rows);

for (const row of rows) {
  if (row.metaTitleLen > 70 || row.displayLen > 70 || row.descLen > 160) {
    throw new Error(`Metadata vượt giới hạn ở ${row.slug}`);
  }
}

payload.logger.info(
  `Đối soát pages: ${verify.totalDocs}/${SEED_PAGES.length} bản ghi, mọi metaTitle + hậu tố ≤ 70.`,
);

await payload.destroy();
process.exit(0);
