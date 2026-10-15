import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { COMPANY_INFO, SIX_COMMITMENTS } from "@/data/company-info";
import { getCompanySettings } from "@/lib/api";
import { ShieldCheck, Award, CheckCircle2, Phone, AlertCircle } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Chính Sách Đảm Bảo & Cam Kết Hoàn Tiền - Xe Ghép Liên Tỉnh",
  description:
    "Chính sách đảm bảo chất lượng dịch vụ tại Xe Ghép Liên Tỉnh. Cam kết hoàn tiền 100%, đền 200% nếu dịch vụ không đúng cam kết, đổi hủy chuyến miễn phí.",
  path: "/chinh-sach/dam-bao",
});

export default async function AssurancePolicyPage() {
  const companySettings = await getCompanySettings();
  const info = companySettings.info ?? COMPANY_INFO;
  const commitments =
    companySettings.commitments && companySettings.commitments.length > 0
      ? companySettings.commitments
      : SIX_COMMITMENTS;

  const breadcrumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Chính sách đảm bảo", path: "/chinh-sach/dam-bao" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 px-3.5 py-1 rounded-full inline-block">
              Cam Kết Vàng
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Chính Sách Đảm Bảo Chất Lượng
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Cam kết dịch vụ 5 sao, chính sách hoàn tiền 100% và đền bù 200% vì quyền lợi tối thượng của hành khách.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8">
            {/* Cam kết hoàn 100% đền 200% */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-300 animate-pulse" />
                <h2 className="text-lg sm:text-xl font-black uppercase">
                  Cam Kết Hoàn Tiền 100% – Đền Bù 200%
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
                Chúng tôi khẳng định chất lượng vượt trội bằng cam kết rõ ràng: nếu chuyến đi không đảm bảo chất lượng như đã thỏa thuận (nhồi nhét khách, tự ý bỏ khách, lái xe có thái độ thiếu tôn trọng, xe không đúng tiêu chuẩn sạch sẽ mát mẻ), {info.name} sẵn sàng <strong>hoàn tiền 100% và đền 200%</strong> cước phí cho hành khách.
              </p>
            </div>

            {/* Chi tiết 6 cam kết */}
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                <span>Nội Dung Cam Kết Tiêu Chuẩn</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {commitments.map((com, idx) => (
                  <div key={com.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{com.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 pl-8 leading-relaxed">{com.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Quy định đổi hủy miễn phí */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-red-600" />
                <span>Quy Định Đổi Và Hủy Chuyến Miễn Phí</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Khi có sự thay đổi lịch trình công tác, việc gia đình hoặc vấn đề phát sinh đột xuất, quý khách chỉ cần thông báo cho tổng đài qua hotline <strong>{info.hotline}</strong> trước giờ xe chạy ít nhất 30 phút. Chúng tôi hỗ trợ dời giờ hoặc hủy chuyến hoàn toàn miễn phí, không thu phí phạt hủy chuyến.
              </p>
            </section>

            {/* Kênh khiếu nại */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Kênh tiếp nhận phản ánh & hỗ trợ bảo hành dịch vụ 24/7</span>
              </div>
              <a
                href={info.hotlineHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Hotline 24/7: {info.hotline}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
