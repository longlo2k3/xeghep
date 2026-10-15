import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ARTICLES as FALLBACK_ARTICLES } from "@/data/articles";
import { getArticles, getRoutes, getCompanySettings } from "@/lib/api";
import { COMPANY_INFO } from "@/data/company-info";
import { Calendar, User, ArrowRight, Tag, Phone, ShieldCheck } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: "Tin Tức & Cẩm Nang Xe Ghép Liên Tỉnh 2026",
  description:
    "Cập nhật tin tức, cẩm nang và kinh nghiệm đi xe ghép liên tỉnh Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang đón trả tận nơi.",
  path: "/tin-tuc",
});

export default async function NewsIndexPage() {
  const [routes, articlesRes, companySettings] = await Promise.all([
    getRoutes().catch(() => []),
    getArticles({ limit: 12 }).catch(() => null),
    getCompanySettings(),
  ]);
  const info = companySettings.info ?? COMPANY_INFO;

  const articles =
    articlesRes?.items && articlesRes.items.length > 0
      ? articlesRes.items
      : FALLBACK_ARTICLES;

  const breadcrumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Tin tức", path: "/tin-tuc" },
  ];

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <div className="py-10 sm:py-16 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header & H1 per spec_v2.md Section 6 */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 px-3.5 py-1 rounded-full inline-block">
              Bản Tin & Cẩm Nang
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Tin tức
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Kinh nghiệm đặt xe, bảng giá liên tỉnh mới nhất và thông tin hữu ích cho chuyến đi của quý khách.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cột chính: Bài nổi bật & Lưới bài viết */}
            <div className="lg:col-span-8 space-y-8">
              {/* Bài nổi bật */}
              {featuredArticle && (
                <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  {featuredArticle.image && (
                    <Link
                      href={`/tin-tuc/${featuredArticle.slug}`}
                      className="block relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-slate-100"
                    >
                      <Image
                        src={featuredArticle.image}
                        alt={featuredArticle.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 768px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  )}
                  <div className="p-6 sm:p-8 space-y-4">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-md">
                      <Tag className="w-3 h-3" />
                      <span>{featuredArticle.categoryName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <time dateTime={featuredArticle.publishedAt}>
                        {new Date(featuredArticle.publishedAt).toLocaleDateString("vi-VN")}
                      </time>
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 hover:text-red-600 transition-colors">
                    <Link href={`/tin-tuc/${featuredArticle.slug}`}>
                      {featuredArticle.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{featuredArticle.author}</span>
                    </span>
                    <Link
                      href={`/tin-tuc/${featuredArticle.slug}`}
                      className="font-bold text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <span>Đọc tiếp</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Lưới các bài viết khác */}
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 uppercase">
                  Cẩm Nang & Bài Viết Mới Nhất
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {otherArticles.map((article) => (
                    <article
                      key={article.slug}
                      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                    >
                      {article.image && (
                        <Link
                          href={`/tin-tuc/${article.slug}`}
                          className="block relative aspect-[16/9] w-full overflow-hidden bg-slate-100"
                        >
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 400px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </Link>
                      )}
                      <div className="p-5 space-y-4 flex flex-col justify-between flex-grow">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded text-[11px]">
                              {article.categoryName}
                            </span>
                            <span>{new Date(article.publishedAt).toLocaleDateString("vi-VN")}</span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 hover:text-red-600 transition-colors leading-snug">
                            <Link href={`/tin-tuc/${article.slug}`}>
                              {article.title}
                            </Link>
                          </h3>

                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {article.excerpt}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500 truncate pr-2">{article.author}</span>
                          <Link
                            href={`/tin-tuc/${article.slug}`}
                            className="font-bold text-red-600 hover:text-red-700 flex items-center gap-1 whitespace-nowrap"
                          >
                            <span>Chi tiết</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar: Tuyến nổi bật & Hotline per spec_v2.md Section 6 */}
            <div className="lg:col-span-4 space-y-6">
              {/* Hotline card */}
              <div className="relative overflow-hidden p-6 rounded-3xl bg-slate-950 text-white shadow-lg border border-red-500/30 group">
                {/* Background image - clearly visible without heavy blur */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 pointer-events-none opacity-80"
                  style={{
                    backgroundImage: "url('/tongdai.webp')",
                  }}
                />
                {/* Subtle dark gradient scrim ensuring text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-red-950/50 to-black/40 pointer-events-none" />

                <div className="relative z-10 space-y-3">
                  <h2 className="text-lg font-black uppercase drop-shadow-sm">
                    Tổng Đài Đặt Xe 24/7
                  </h2>
                  <p className="text-xs text-red-100 leading-relaxed">
                    Đón trả tận nhà, xe chạy liên tục cả ngày lẫn đêm. Gọi ngay để có xe trong 15-30 phút.
                  </p>
                  <div className="pt-2">
                    <a
                      href={info.hotlineHref}
                      className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white text-red-700 font-black text-sm shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Phone className="w-4 h-4 animate-pulse" />
                      <span>GỌI NGAY: {info.hotline}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Tuyến nổi bật */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                <h2 className="text-base font-black text-slate-900 uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span>Tuyến Xe Ghép Nổi Bật</span>
                </h2>

                <ul className="space-y-2.5 text-xs">
                  {routes.slice(0, 6).map((route) => (
                    <li key={route.slug}>
                      <Link
                        href={`/tuyen-lien-tinh/${route.slug}`}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors group"
                      >
                        <span className="font-semibold text-slate-700 group-hover:text-red-700 truncate pr-2">
                          {route.name}
                        </span>
                        <span className="font-bold text-red-600 whitespace-nowrap">
                          {route.priceShare1Text}
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li className="pt-2 border-t border-slate-100">
                    <Link
                      href="/tuyen-lien-tinh"
                      className="text-xs font-bold text-red-600 hover:underline block text-center"
                    >
                      Xem tất cả các tuyến &rarr;
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
