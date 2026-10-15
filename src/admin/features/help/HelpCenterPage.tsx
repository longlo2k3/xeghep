import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  MapPin,
  Command,
  PhoneCall,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  Lightbulb,
  Check,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Sparkles,
  BookOpen,
  ArrowRight,
  FileText,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/admin/components/ui/Button";
import {
  SIDEBAR_GUIDES,
  ROLE_NAMES,
  ROLE_BADGE_COLORS,
  type SidebarGuideItem,
} from "./helpData";

type TabKey = "sidebar" | "workflow" | "routes" | "shortcuts" | "support";

export function HelpCenterPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = (searchParams.get("tab") as TabKey) || "sidebar";
  const selectedSidebarId = searchParams.get("item") || "dashboard";

  const [sidebarFilterSection, setSidebarFilterSection] =
    useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const setActiveTab = (tab: TabKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  };

  const setSelectedSidebarId = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("item", id);
      return next;
    });
  };

  // Lọc danh sách hướng dẫn sidebar
  const filteredSidebarGuides = useMemo(() => {
    return SIDEBAR_GUIDES.filter((item) => {
      if (
        sidebarFilterSection !== "all" &&
        item.section !== sidebarFilterSection
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.name.toLowerCase().includes(q) ||
          item.shortDesc.toLowerCase().includes(q) ||
          item.sectionName.toLowerCase().includes(q) ||
          item.purpose.some((p) => p.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [sidebarFilterSection, searchQuery]);

  const activeSidebarItem: SidebarGuideItem = useMemo(() => {
    return (
      SIDEBAR_GUIDES.find((item) => item.id === selectedSidebarId) ||
      SIDEBAR_GUIDES[0]
    );
  }, [selectedSidebarId]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Tài liệu Hướng dẫn Vận hành Toàn diện</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Cẩm nang Hướng dẫn & Trợ giúp Vận hành CMS
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Chi tiết cách sử dụng 9 phân hệ chức năng trên Sidebar, quy trình
              tiếp nhận & điều phối đơn đặt xe, tối ưu tuyến đường giá cước và
              các mẹo thực chiến giúp nâng cao hiệu suất làm việc.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/bookings")}
              className="bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-sm"
            >
              <Car className="w-4 h-4 mr-1.5" />
              Xem danh sách đặt xe
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("shortcuts")}
              className="bg-white/10 text-white hover:bg-white/20 border-white/30 text-xs font-semibold rounded-xl"
            >
              <Command className="w-4 h-4 mr-1.5" />
              Phím tắt (Ctrl+K)
            </Button>
          </div>
        </div>

        {/* Background decorative glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl text-xs font-semibold border border-slate-200 overflow-x-auto shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("sidebar")}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer select-none ${
            activeTab === "sidebar"
              ? "bg-white text-blue-600 font-bold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>9 Chức năng Sidebar</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("workflow")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer select-none ${
            activeTab === "workflow"
              ? "bg-white text-blue-600 font-bold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Car className="w-4 h-4 shrink-0" />
          <span>Quy trình Xử lý đơn</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("routes")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer select-none ${
            activeTab === "routes"
              ? "bg-white text-blue-600 font-bold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <MapPin className="w-4 h-4 shrink-0" />
          <span>Tuyến xe & Giá</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("shortcuts")}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer select-none ${
            activeTab === "shortcuts"
              ? "bg-white text-blue-600 font-bold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Command className="w-4 h-4 shrink-0" />
          <span>Phím tắt & Mẹo</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("support")}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer select-none ${
            activeTab === "support"
              ? "bg-white text-blue-600 font-bold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <PhoneCall className="w-4 h-4 shrink-0" />
          <span>Hỗ trợ</span>
        </button>
      </div>

      {/* 3. Tab 1 Content: 9 Chức năng Sidebar */}
      {activeTab === "sidebar" && (
        <div className="space-y-4">
          {/* Filter Bar & Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <button
                type="button"
                onClick={() => setSidebarFilterSection("all")}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                  sidebarFilterSection === "all"
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                Tất cả (9)
              </button>
              <button
                type="button"
                onClick={() => setSidebarFilterSection("operations")}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                  sidebarFilterSection === "operations"
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                Vận hành xe (2)
              </button>
              <button
                type="button"
                onClick={() => setSidebarFilterSection("content")}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                  sidebarFilterSection === "content"
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                Nội dung & SEO (4)
              </button>
              <button
                type="button"
                onClick={() => setSidebarFilterSection("system")}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                  sidebarFilterSection === "system"
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                Hệ thống (2)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tính năng sidebar..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Two-column layout: Left List & Right Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left list (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-2 space-y-1.5 shadow-2xs">
              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Danh sách phân hệ</span>
                <span className="text-slate-500 font-semibold">
                  {filteredSidebarGuides.length} chức năng
                </span>
              </div>

              {filteredSidebarGuides.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Không tìm thấy tính năng nào phù hợp với từ khóa "
                  {searchQuery}"
                </div>
              ) : (
                filteredSidebarGuides.map((item) => {
                  const Icon = item.icon;
                  const isSelected = item.id === activeSidebarItem.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedSidebarId(item.id)}
                      className={`w-full p-3 rounded-xl text-left transition cursor-pointer flex items-center justify-between gap-3 border ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-200 shadow-2xs"
                          : "bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-bold truncate ${
                                isSelected ? "text-blue-900" : "text-slate-800"
                              }`}
                            >
                              {item.name}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.shortDesc}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition ${
                          isSelected ? "text-blue-600" : "text-slate-300"
                        }`}
                      />
                    </button>
                  );
                })
              )}
            </div>

            {/* Right Details (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Header card of selected item */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20 shrink-0">
                      <activeSidebarItem.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                          {activeSidebarItem.name}
                        </h2>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                          {activeSidebarItem.sectionName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activeSidebarItem.shortDesc}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(activeSidebarItem.href)}
                    className="rounded-xl text-xs font-semibold gap-1.5 shrink-0"
                  >
                    <span>Mở trang</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Phân quyền vai trò */}
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
                  <Shield className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-700">
                    Phân quyền vai trò:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeSidebarItem.roles.map((role) => (
                      <span
                        key={role}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${ROLE_BADGE_COLORS[role]}`}
                      >
                        {ROLE_NAMES[role]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 1: DÙNG LÀM GÌ? */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                  <Info className="w-4 h-4" />
                  <span>DÙNG LÀM GÌ? (MỤC ĐÍCH & VAI TRÒ CỐT LÕI)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {activeSidebarItem.purpose.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 2: DÙNG NHƯ THẾ NÀO? */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>DÙNG NHƯ NÀO? (HƯỚNG DẪN CÁC BƯỚC THAO TÁC)</span>
                </div>
                <div className="space-y-3">
                  {activeSidebarItem.howToUse.map((item) => (
                    <div
                      key={item.step}
                      className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                        {item.step}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-xs">
                          {item.title}
                        </h4>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: MẸO HAY & LƯU Ý THỰC CHIẾN */}
              <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5 text-xs text-amber-950">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>MẸO HAY & LƯU Ý THỰC CHIẾN</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {activeSidebarItem.tips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-amber-900/90"
                    >
                      <span className="text-amber-600 font-bold">•</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab 2 Content: Quy trình Xử lý đơn */}
      {activeTab === "workflow" && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 text-sm">
                Quy tắc vàng 5 phút:
              </p>
              <p className="mt-1 text-xs text-amber-900 leading-relaxed">
                Khách hàng đặt xe thường đang cần di chuyển gấp hoặc đang đối
                chiếu nhiều nhà xe khác nhau. Hãy liên hệ với khách hàng trong
                vòng <strong>5-10 phút</strong> kể từ khi có đơn mới để nâng cao
                tỷ lệ chốt chuyến lên trên 85%.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                1
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">
                  Tiếp nhận đơn Chờ duyệt (Pending)
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Đơn mới do khách đặt trên website sẽ xuất hiện tại bảng tổng
                  quan hoặc mục <strong>Đơn đặt xe</strong> với nhãn màu cam
                  "Chờ duyệt". Chuông thông báo sẽ reo báo hiệu có đơn phát
                  sinh.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                2
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">
                  Xem chi tiết & Gọi điện xác nhận
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Bấm vào mã đơn hoặc nút "Xem & Xử lý". Kiểm tra điểm đón trả
                  tận nơi, số lượng người, hành lý cồng kềnh và gọi điện báo giá
                  cước chuẩn cho khách hàng.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                3
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">
                  Xác nhận đơn (Confirmed) & Khởi hành
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Sau khi khách đồng ý và đã gán tài xế, đổi trạng thái thành{" "}
                  <strong>Đã xác nhận (Confirmed)</strong> để giữ chỗ. Khi tài
                  xế xuất phát đón khách, đổi sang{" "}
                  <strong>Đang chạy (In Progress)</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                4
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">
                  Hoàn thành chuyến hoặc Hủy đơn có lý do
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Sau khi tài xế đón trả khách an toàn và thu tiền cước, đổi
                  sang <strong>Hoàn thành (Completed)</strong> để hệ thống ghi
                  nhận doanh thu. Nếu khách đổi lịch hoặc hủy xe, bấm Hủy đơn và
                  bắt buộc chọn lý do.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Cần thực hành xử lý đơn hàng thực tế ngay bây giờ?
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/bookings")}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <span>Vào trang Đơn đặt xe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* 5. Tab 3 Content: Tuyến xe & Giá */}
      {activeTab === "routes" && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 flex items-start gap-3.5">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-950 text-sm">
                Ghim Banner Top là gì?
              </p>
              <p className="mt-1 text-xs text-emerald-900 leading-relaxed">
                Là tính năng ghim tuyến xe trọng điểm (như Hải Phòng ⇄ Hà Nội,
                Nội Bài ⇄ các tỉnh) lên thanh trượt và banner đầu trang chủ
                khách hàng để kích thích tối đa lượt đặt xe của người truy cập.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Đặt tên tuyến chuẩn SEO</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đặt tên rõ ràng dạng <code>Điểm đi ⇄ Điểm đến</code>, ví dụ:
                "Hải Phòng ⇄ Hà Nội". Hệ thống sẽ tự động tạo URL slug thân
                thiện đạt chuẩn Google Tìm kiếm.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Cấu hình 4 hạng vé cước & Giá từ</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cung cấp đầy đủ 4 hạng vé: Ghép 1 người, Ghép 2 người, Bao xe
                4-5 chỗ, Bao xe 7 chỗ. Hệ thống tự động tính "Giá từ" thấp nhất
                để hiển thị ra trang chủ.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Bật Ghim Banner Top trang chủ</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cài đặt thời hạn áp dụng giá (Price Valid Until) để quản lý biểu
                phí dịp lễ tết và bật công tắc ghim banner lên đầu trang chủ thu
                hút khách.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <ArrowRightLeft className="w-4 h-4 text-rose-600" />
                <span>Tự động cảnh báo 301 Redirect</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Khi đổi URL slug của tuyến đang hoạt động (Active), hệ thống tự
                động cảnh báo tạo bản ghi 301 để bảo vệ thứ hạng từ khóa Google,
                tránh lỗi 404.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Muốn thiết lập hoặc cập nhật bảng giá tuyến xe liên tỉnh?
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/routes")}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <span>Vào Quản lý Tuyến đường & Giá</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* 6. Tab 4 Content: Phím tắt & Mẹo */}
      {activeTab === "shortcuts" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  Tìm kiếm nhanh toàn hệ thống
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mở Command Palette tìm đơn xe, tuyến đường, bài viết
                </p>
              </div>
              <kbd className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-800 shadow-2xs">
                Ctrl + K
              </kbd>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  Đóng cửa sổ / Thoát thao tác
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đóng popup đang mở hoặc huỷ biểu mẫu
                </p>
              </div>
              <kbd className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-800 shadow-2xs">
                Esc
              </kbd>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-blue-950">
                Mẹo hay tra cứu đơn xe & khách quen:
              </p>
              <p className="leading-relaxed">
                Trên bất kỳ bảng dữ liệu nào (Đơn đặt xe, Tuyến đường, Bài
                viết), bạn chỉ cần gõ <strong>số điện thoại khách</strong> hoặc{" "}
                <strong>mã đơn</strong> vào ô tìm kiếm để lọc kết quả tức thì mà
                không cần tải lại trang.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 5 Content: Hỗ trợ kỹ thuật */}
      {activeTab === "support" && (
        <div className="space-y-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Đội ngũ Kỹ thuật & Quản trị Hệ thống
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hỗ trợ vận hành, xử lý lỗi kỹ thuật, phân quyền tài khoản &
                  hướng dẫn nghiệp vụ 24/7
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-slate-500 text-[11px] font-medium">
                  Hotline kỹ thuật nội bộ:
                </p>
                <p className="font-extrabold text-slate-900 text-base mt-0.5">
                  0962.298.293
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-slate-500 text-[11px] font-medium">
                  Email hỗ trợ:
                </p>
                <p className="font-extrabold text-slate-900 text-base mt-0.5">
                  xegheplientinhvip@gmail.com
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Phiên bản CMS: <strong>v1.2.0 (Ổn định)</strong>
            </span>
            <span className="text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
              Trực tuyến
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpCenterPage;
