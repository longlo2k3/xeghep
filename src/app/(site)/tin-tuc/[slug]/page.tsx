import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ARTICLES as FALLBACK_ARTICLES, type Article } from "@/data/articles";
import { getArticle, getArticles, getCompanySettings, isNotFoundError, type ArticleDetail } from "@/lib/api";
import { COMPANY_INFO } from "@/data/company-info";
import { buildArticleSchema } from "@/lib/schema";
import {
  Calendar,
  User,
  PhoneCall,
  List,
  ArrowRight,
  ShieldCheck,
  Car,
} from "lucide-react";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const res = await getArticles();
    if (res.items && res.items.length > 0) {
      return res.items.map((article) => ({ slug: article.slug }));
    }
  } catch {
    // CMS offline fallback
  }
  return FALLBACK_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let article: ArticleDetail | (typeof FALLBACK_ARTICLES)[number] | undefined;

  try {
    article = await getArticle(slug);
  } catch (error) {
    if (isNotFoundError(error)) {
      article = FALLBACK_ARTICLES.find((a) => a.slug === slug);
    } else {
      article = FALLBACK_ARTICLES.find((a) => a.slug === slug);
    }
  }

  if (!article) return {};

  return constructMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/tin-tuc/${article.slug}`,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    author: article.author,
    image: article.image,
  });
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  let article: ArticleDetail | (typeof FALLBACK_ARTICLES)[number] | undefined;

  try {
    article = await getArticle(slug);
  } catch (error) {
    if (isNotFoundError(error)) {
      article = FALLBACK_ARTICLES.find((a) => a.slug === slug);
      if (!article) notFound();
    } else {
      article = FALLBACK_ARTICLES.find((a) => a.slug === slug);
      if (!article) notFound();
    }
  }

  if (!article) {
    notFound();
  }

  const companySettings = await getCompanySettings();
  const info = companySettings.info ?? COMPANY_INFO;

  const breadcrumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Tin tức", path: "/tin-tuc" },
    { name: article.title, path: `/tin-tuc/${article.slug}` },
  ];

  const articleSchema = buildArticleSchema({
    title: article.title,
    description: article.excerpt,
    path: `/tin-tuc/${article.slug}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    authorName: article.author,
    imageUrl: article.image,
  });

  let otherArticles: Article[] = [];
  try {
    const listRes = await getArticles({ limit: 4, excludeSlug: article.slug });
    if (listRes.items && listRes.items.length > 0) {
      otherArticles = listRes.items.slice(0, 3);
    }
  } catch {
    // CMS offline fallback
  }

  if (otherArticles.length === 0) {
    otherArticles = (FALLBACK_ARTICLES as Article[])
      .filter((a) => a.slug !== article.slug)
      .slice(0, 3);
  }

  return (
    <>
      <JsonLd data={articleSchema} />
      <Breadcrumbs items={breadcrumbs} />

      <div className="py-10 sm:py-16 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <article className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-12">
            {/* Header */}
            <header className="mb-8 pb-6 border-b border-slate-200 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                {article.categoryName}
              </span>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <User className="w-4 h-4 text-red-600" aria-hidden="true" />
                  <span>{article.author}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar
                    className="w-4 h-4 text-red-600"
                    aria-hidden="true"
                  />
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
                  </time>
                </span>
              </div>
            </header>

            {/* Featured Article Image */}
            {article.image && (
              <figure className="mb-8 overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm bg-slate-100">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    priority
                    sizes="(max-width: 896px) 100vw, 896px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="p-2.5 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-100 italic">
                  {article.title}
                </figcaption>
              </figure>
            )}

            {/* CTA Giữa bài per spec_v2.md Section 6 */}
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Car className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    Cần đặt xe ghép liên tỉnh đón tận nhà?
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Xe 4–7 chỗ đời mới, chỉ 1–3 khách/chuyến, chạy cao tốc liên
                    tục.
                  </p>
                </div>
              </div>
              <a
                href={info.hotlineHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex-shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                <span>Gọi: {info.hotline}</span>
              </a>
            </div>

            {/* Table of contents */}
            {article.tableOfContents.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-8 space-y-3">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <List className="w-4 h-4 text-red-600" aria-hidden="true" />
                  <span>Mục Lục Bài Viết</span>
                </h2>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                  {article.tableOfContents.map((toc) => (
                    <li key={toc.id}>
                      <a
                        href={`#${toc.id}`}
                        className="hover:text-red-700 hover:underline"
                      >
                        {toc.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Article Content */}
            <div
              className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-5"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* CTA Box Cuối bài per spec_v2.md Section 6 */}
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-black uppercase">
                  Đặt Xe Ghép Nhanh Chóng 24/7
                </h3>
                <p className="text-xs text-red-100">
                  Đón trả tận nhà, cam kết 100% hoàn tiền nếu không hài lòng
                  chất lượng.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 flex-shrink-0">
                <Link
                  href="/tuyen-lien-tinh"
                  className="px-5 py-3 rounded-xl bg-white text-red-700 font-extrabold text-xs sm:text-sm hover:bg-red-50 shadow-md"
                >
                  <span>Xem Các Tuyến</span>
                </Link>

                <a
                  href={info.hotlineHref}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5"
                >
                  <PhoneCall className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Gọi {info.hotline}</span>
                </a>
              </div>
            </div>
          </article>

          {/* Related Articles per spec_v2.md Section 6 */}
          {otherArticles.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase">
                Bài Viết Liên Quan Khác
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherArticles.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/tin-tuc/${item.slug}`}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-red-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden"
                  >
                    <div>
                      {item.image && (
                        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-3 bg-slate-100">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 400px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-red-700 block mb-1">
                        {item.categoryName}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {item.excerpt}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-red-600 font-bold">
                      <span>Đọc bài viết</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
