import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { COMPANY_INFO } from "@/data/company-info";
import { getCompanySettings } from "@/lib/api";
import { Lock, ShieldCheck, EyeOff, FileText, Phone } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Chính Sách Bảo Mật Thông Tin - Xe Ghép Liên Tỉnh",
  description:
    "Chính sách bảo mật thông tin hành khách tại Xe Ghép Liên Tỉnh. Cam kết bảo mật số điện thoại, địa chỉ nhà, lộ trình di chuyển 100%.",
  path: "/chinh-sach/bao-mat",
});

export default async function PrivacyPolicyPage() {
  const companySettings = await getCompanySettings();
  const info = companySettings.info ?? COMPANY_INFO;

  const breadcrumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Chính sách bảo mật", path: "/chinh-sach/bao-mat" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 px-3.5 py-1 rounded-full inline-block">
              An Toàn & Riêng Tư
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Chính Sách Bảo Mật Thông Tin
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              {info.name} tôn trọng và cam kết bảo vệ quyền riêng tư cũng như dữ liệu cá nhân của quý khách hàng.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {/* 1. Thu thập thông tin */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <span>1. Mục Đích Thu Thập Dữ Liệu</span>
              </h2>
              <p>
                Khi quý khách đặt xe trực tuyến hoặc liên hệ tổng đài, chúng tôi chỉ thu thập các thông tin tối thiểu cần thiết để phục vụ hành trình:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Họ và tên hành khách.</li>
                <li>Số điện thoại liên lạc để tài xế hẹn giờ và đón trả.</li>
                <li>Địa chỉ điểm đón và điểm đến mong muốn.</li>
                <li>Thời gian xuất phát và loại dịch vụ lựa chọn (ghép ghế / bao xe).</li>
              </ul>
            </section>

            {/* 2. Phạm vi sử dụng */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                <span>2. Phạm Vi Sử Dụng Thông Tin</span>
              </h2>
              <p>
                Thông tin của quý khách chỉ được sử dụng nội bộ nhằm mục đích:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Điều phối tài xế gần nhất đến đón khách đúng giờ.</li>
                <li>Liên lạc xác nhận chuyến đi hoặc xử lý khiếu nại, phản hồi chất lượng.</li>
                <li>Áp dụng chính sách ưu đãi giảm 10% cước phí cho khách hàng cũ.</li>
              </ul>
            </section>

            {/* 3. Cam kết bảo mật */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-red-600" />
                <span>3. Cam Kết Tuyệt Đối Không Chia Sẻ Dữ Liệu</span>
              </h2>
              <p>
                Chúng tôi cam kết <strong>không bán, không chia sẻ, không chuyển nhượng</strong> thông tin số điện thoại hay địa chỉ nhà của quý khách cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc tiếp thị làm phiền.
              </p>
            </section>

            {/* 4. Quyền của hành khách */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                <span>4. Quyền Yêu Cầu Xóa Dữ Liệu Của Khách Hàng</span>
              </h2>
              <p>
                Bất kỳ lúc nào sau khi chuyến đi kết thúc, quý khách có quyền yêu cầu xóa bỏ toàn bộ lịch sử thông tin chuyến đi và số điện thoại khỏi hệ thống tổng đài bằng cách gọi trực tiếp đến hotline <strong>{info.hotline}</strong> hoặc gửi email tới <strong>{info.email}</strong>.
              </p>
            </section>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Thắc mắc về quyền riêng tư? Liên hệ tổng đài 24/7.
              </p>
              <a
                href={info.hotlineHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                <Phone className="w-3.5 h-3.5 text-red-400" />
                <span>{info.hotline}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
