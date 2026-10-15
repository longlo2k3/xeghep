import {
  Shield,
  Zap,
  MapPin,
  Car,
  Star,
  Heart,
  Headphones,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export function WhyChooseUs() {
  const leftFeatures = [
    {
      num: "01",
      title: "Đội ngũ lái xe dày dạn kinh nghiệm, chuyên nghiệp nhiệt tình",
      subtitle: "Tài xế chuyên nghiệp",
    },
    {
      num: "02",
      title: "Luôn cam kết với mức giá tốt nhất cho khách hàng",
      subtitle: "Tiết kiệm đến 40%",
    },
    {
      num: "03",
      title: "Miễn phí huỷ chuyến khi khách hàng thay đổi lộ trình",
      subtitle: "Linh hoạt tối đa",
    },
  ];

  // 8 icons for the frosted glass grid (2x4)
  const glassIcons = [
    { icon: Shield, label: "Khiên" },
    { icon: Zap, label: "Sét" },
    { icon: MapPin, label: "Định vị" },
    { icon: Car, label: "Ô tô" },
    { icon: Star, label: "Sao" },
    { icon: Heart, label: "Tim" },
    { icon: Headphones, label: "Tai nghe" },
    { icon: Clock, label: "Đồng hồ" },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header Title ở ngoài Bento Grid giống các section khác (tuân thủ AGENTS.md rule 3.2) */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
          <span className="inline-block px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs uppercase tracking-wider shadow-sm">
            Chính Sách Cam Kết Dịch Vụ Vàng
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
            Vì Sao Chọn Xe Ghép Liên Tỉnh
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 italic">
            Đưa đón tận nhà, tối ưu chi phí và mang đến hành trình tiện nghi, an toàn tuyệt đối cho bạn.
          </p>
        </div>

        {/* Bento Grid: 3 columns layout replicating the reference design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* ============================================================ */}
          {/* CARD 1: THẺ LỚN BÊN TRÁI (Dài 2 hàng) — lg:col-span-5       */}
          {/* ============================================================ */}
          <div className="md:col-span-2 lg:col-span-5 lg:row-span-2 flex flex-col justify-between rounded-[28px] overflow-hidden border border-slate-200/60 shadow-2xl shadow-slate-900/15 relative min-h-[580px] group">
            {/* Background Photo with dark gradient scrim */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: "url('/photo01.avif')",
              }}
            />
            {/* Scrim overlay: soft dark gradient at top, strong dark gradient at bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/60 to-slate-950/95" />

            {/* Top Pill Tag */}
            <div className="relative p-6 sm:p-8 z-10">
              <div className="flex justify-center sm:justify-start">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[11px] font-mono tracking-widest uppercase shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  TIÊU CHUẨN VẬN HÀNH
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                </span>
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="relative p-6 sm:p-8 z-10">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight leading-tight mb-2 drop-shadow-md">
                Cam Kết Dịch Vụ Vàng
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mb-6 line-clamp-2">
                Đưa đón tận nhà, tối ưu chi phí và mang đến hành trình tiện
                nghi, an toàn tuyệt đối cho bạn.
              </p>

              {/* 3 Mục Đánh Số 01, 02, 03 (Phong cách giống card trái của ảnh mẫu) */}
              <div className="space-y-3.5 mb-6">
                {leftFeatures.map((item) => (
                  <div
                    key={item.num}
                    className="flex items-center justify-between gap-3 text-xs sm:text-sm border-b border-white/10 pb-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono font-bold text-cyan-400 text-sm">
                        {item.num}
                      </span>
                      <span className="text-cyan-400 font-bold">•</span>
                      <span className="text-slate-100 font-semibold leading-snug">
                        {item.title}
                      </span>
                    </div>
                    <span className="hidden sm:inline-block text-[11px] text-slate-300 font-mono tracking-wider text-right flex-shrink-0">
                      {item.subtitle}
                    </span>
                  </div>
                ))}
              </div>

              {/* Banner Ngang Đỏ Sẫm Nổi Bật Dưới Cùng */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950 via-red-800 to-rose-950 border border-red-500/50 text-white text-center shadow-[0_4px_20px_rgba(220,38,38,0.4)]">
                <p className="text-xs sm:text-[13px] font-black tracking-wider uppercase leading-snug drop-shadow-sm">
                  XE GHÉP – XE TIỆN CHUYẾN MÓNG CÁI – HẠ LONG – HẢI PHÒNG – BẮC
                  NINH – BẮC GIANG – HÀ NỘI.
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CARD 2: THẺ GIỮA PHÍA TRÊN — lg:col-span-3                   */}
          {/* ============================================================ */}
          <div className="md:col-span-1 lg:col-span-3 flex flex-col justify-between rounded-[28px] overflow-hidden bg-gradient-to-b from-[#edf1f5] to-[#d6dde6] text-slate-900 p-6 sm:p-7 shadow-lg shadow-slate-300/50 border border-slate-300/80 relative">
            <div>
              {/* Tag Vàng / Tối */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-widest uppercase font-bold text-slate-700 mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>TIỆN LỢI TỐI ĐA</span>
              </div>

              {/* Trích Dẫn Quote */}
              <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed italic">
                “Phục vụ đưa đón tận nhà, giảm tối đa chi phí và công sức đi lại
                cho khách hàng trong suốt mọi hành trình liên tỉnh.”
              </p>
            </div>

            {/* Dưới cùng: Dòng chữ nhỏ "XE TIỆN CHUYẾN" và "CAM KẾT VÀNG" */}
            <div className="flex items-center justify-between pt-5 mt-6 border-t border-slate-400/30 text-[11px] font-mono tracking-wider font-extrabold text-slate-600 uppercase">
              <span>XE TIỆN CHUYẾN</span>
              <span className="text-amber-600 font-black">CAM KẾT VÀNG</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CARD 4: THẺ PHẢI PHÍA TRÊN — lg:col-span-4                   */}
          {/* ============================================================ */}
          <div className="md:col-span-1 lg:col-span-4 flex flex-col justify-between rounded-[28px] overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-900/10 relative group p-6 sm:p-7 min-h-[290px]">
            {/* Background Photo with dark overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: "url('/photo02.avif')",
              }}
            />
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />

            <div className="relative z-10">
              {/* Tag Vàng */}
              <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase font-bold text-amber-400 mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span>TRẢI NGHIỆM AN TÂM</span>
              </div>

              {/* Đoạn văn ngắn */}
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed mb-4">
                Chất lượng xe đời mới, sạch sẽ, lái xe am hiểu và an toàn tuyệt
                đối.
              </p>
            </div>

            {/* Lưới 8 ô (2x4) dạng ô vuông mờ như kính chứa các icon nhỏ (giống hệt ảnh mẫu) */}
            <div className="relative z-10 grid grid-cols-4 gap-2 pt-2">
              {glassIcons.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-sm hover:bg-white/20 hover:border-cyan-400/50 hover:text-cyan-300 transition-all cursor-default group/icon"
                  title={item.label}
                >
                  <item.icon className="w-5 h-5 group-hover/icon:scale-110 transition-transform" />
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* CARD 3: THẺ GIỮA PHÍA DƯỚI — lg:col-span-3                   */}
          {/* ============================================================ */}
          <div className="md:col-span-1 lg:col-span-3 flex flex-col justify-between rounded-[28px] overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-900/10 relative group p-6 sm:p-7 min-h-[300px]">
            {/* Background Photo with dark overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: "url('/photo03.avif')",
              }}
            />
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px]" />

            <div className="relative z-10">
              {/* Tag Vàng */}
              <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase font-bold text-amber-400 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span>BẢO CHỨNG TRẢI NGHIỆM</span>
              </div>
            </div>

            {/* Chữ số khổng lồ phát sáng trắng ở trung tâm (giống số 300 trong ảnh) */}
            <div className="relative z-10 text-center my-auto py-2">
              <span className="block text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-[0_0_25px_rgba(255,255,255,0.7)] select-none">
                100% - 200%
              </span>
              <span className="block text-[11px] font-mono tracking-widest uppercase font-bold text-cyan-300 mt-1">
                CAM KẾT CHẤT LƯỢNG VÀNG
              </span>
            </div>

            {/* Đoạn text phông chữ nhỏ dễ đọc ở dưới */}
            <div className="relative z-10">
              <p className="text-xs text-slate-300 leading-relaxed font-normal pt-2 border-t border-white/10">
                Chính sách hoàn lại từ 100% đến 200% giá trị nếu dịch vụ và
                chuyến đi không đảm bảo chất lượng.
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CARD 5: THẺ PHẢI PHÍA DƯỚI — lg:col-span-4                   */}
          {/* ============================================================ */}
          <div className="md:col-span-1 lg:col-span-4 flex flex-col justify-between rounded-[28px] overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-900/10 relative group p-6 sm:p-7 min-h-[300px]">
            {/* Background Photo with subtle light gradient scrim */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: "url('/photo04.avif')",
              }}
            />
            {/* Elegant glass overlay resembling bottom-right card in reference */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/60 backdrop-blur-[1px]" />

            {/* Top area with Arrow badge & Tag */}
            <div className="relative z-10 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase font-bold text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>BẢO VỆ QUYỀN LỢI</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-cyan-500 group-hover:border-cyan-400 transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mb-2">
                Miễn Phí Huỷ Chuyến Linh Hoạt
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Chính sách hoàn lại tiền 100% đến 200% về chất lượng dịch vụ.
                Chúng tôi cam kết hoàn tiền nếu xe không đảm bảo chất lượng.
              </p>
            </div>

            {/* Bottom Archive / Notice line */}
            <div className="relative z-10 pt-3 mt-3 border-t border-white/10">
              <p className="text-[11px] text-slate-300 font-mono tracking-wide leading-tight">
                * Cam kết hoàn tiền minh bạch, hỗ trợ đổi chuyến & phản hồi
                nhanh chóng 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
