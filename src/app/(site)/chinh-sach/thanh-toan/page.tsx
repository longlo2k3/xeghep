import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { COMPANY_INFO, PAYMENT_METHODS } from "@/data/company-info";
import { getCompanySettings } from "@/lib/api";
import { CreditCard, Banknote, ShieldCheck, CheckCircle2, Phone } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Chính Sách Thanh Toán - Xe Ghép Liên Tỉnh",
  description:
    "Quy định và chính sách thanh toán dịch vụ xe ghép, bao xe tại Xe Ghép Liên Tỉnh. Thanh toán sau chuyến đi, tiền mặt hoặc chuyển khoản minh bạch.",
  path: "/chinh-sach/thanh-toan",
});

export default async function PaymentPolicyPage() {
  const companySettings = await getCompanySettings();
  const info = companySettings.info ?? COMPANY_INFO;
  const paymentMethods =
    companySettings.paymentMethods && companySettings.paymentMethods.length > 0
      ? companySettings.paymentMethods
      : PAYMENT_METHODS;

  const breadcrumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Chính sách thanh toán", path: "/chinh-sach/thanh-toan" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 px-3.5 py-1 rounded-full inline-block">
              Quy Định & Hướng Dẫn
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Chính Sách Thanh Toán
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              {info.name} áp dụng chính sách thanh toán linh hoạt, minh bạch và an toàn tuyệt đối cho khách hàng.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8">
            {/* Nguyên tắc */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                <span>1. Nguyên Tắc Thanh Toán Sau Chuyến Đi</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Để đảm bảo quyền lợi tối đa cho quý khách, đối với các chuyến xe đi ghép ghế thông thường, quý khách <strong>không cần phải đặt cọc trước</strong>. Quý khách chỉ thanh toán cước phí sau khi chuyến đi kết thúc an toàn tại đúng điểm đến đã thỏa thuận.
              </p>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Giá cước báo cho khách hàng đã bao gồm toàn bộ phí cầu đường bến bãi cao tốc. Cam kết không thu thêm bất kỳ phụ phí ngoài thỏa thuận.</span>
              </div>
            </section>

            {/* Các phương thức */}
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600" />
                <span>2. Các Hình Thức Thanh Toán Chấp Nhận</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                      {method.id === "tien-mat" ? <Banknote className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{method.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{method.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Bao xe riêng và hàng hóa */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-red-600" />
                <span>3. Đối Với Hợp Đồng Bao Xe & Gửi Hàng Hóa</span>
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
                <li>
                  <strong>Bao xe hợp đồng nhiều ngày hoặc lộ trình xa:</strong> Quý khách có thể được yêu cầu đặt cọc trước từ 10% – 20% giá trị hợp đồng để đảm bảo xe giữ chỗ đúng ngày giờ yêu cầu.
                </li>
                <li>
                  <strong>Gửi hàng hóa hỏa tốc:</strong> Người gửi có thể thanh toán trước khi gửi hàng hoặc người nhận thanh toán khi nhận hàng tận tay (Ship COD cước vận chuyển).
                </li>
              </ul>
            </section>

            {/* Hỗ trợ thanh toán */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Cần hóa đơn VAT hoặc xuất chứng từ thanh toán cho doanh nghiệp?
              </p>
              <a
                href={info.hotlineHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Liên hệ Hotline: {info.hotline}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
