"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { type RouteItem } from "@/lib/types";

export interface RouteSlideItem {
  src: string;
  badge: string;
  caption: string;
  alt: string;
}

// Danh sách hình ảnh slideshow tương ứng cho từng tuyến xe
export const ROUTE_SLIDES_MAP: Record<string, RouteSlideItem[]> = {
  "hai-phong-bac-ninh-bac-giang": [
    {
      src: "/HaiPhong.webp",
      badge: "Hải Phòng",
      caption:
        "Đón trả tận nhà tại nội thành Hải Phòng, Quán Toan, Thủy Nguyên",
      alt: "Xe ghép Hải Phòng Bắc Ninh Bắc Giang đón trả tại Hải Phòng",
    },
    {
      src: "/BacNinh.webp",
      badge: "Bắc Ninh",
      caption: "Trả tận nơi tại TP. Bắc Ninh, KCN Quế Võ, KCN Yên Phong",
      alt: "Xe ghép Hải Phòng đi Bắc Ninh đón trả KCN",
    },
    {
      src: "/BacGiang.webp",
      badge: "Bắc Giang",
      caption: "Trả tận nơi tại TP. Bắc Giang, KCN Quang Châu, KCN Đình Trám",
      alt: "Xe tiện chuyến Hải Phòng đi Bắc Giang",
    },
  ],
  "hai-phong-ha-noi-noi-bai": [
    {
      src: "/HaiPhong.webp",
      badge: "Hải Phòng",
      caption: "Đón trả tận nơi tại nhà riêng, văn phòng trung tâm Hải Phòng",
      alt: "Xe ghép Hải Phòng Hà Nội Nội Bài đón tại Hải Phòng",
    },
    {
      src: "/HaNoi.webp",
      badge: "Hà Nội",
      caption:
        "Trả tận nơi tại các quận nội thành Hà Nội, bệnh viện tuyến trung ương",
      alt: "Xe ghép Hải Phòng lên Hà Nội đón trả tận nhà",
    },
    {
      src: "/NoiBai.webp",
      badge: "Sân bay Nội Bài",
      caption: "Đón trả đúng giờ tại sảnh ga T1 nội địa & T2 quốc tế 24/7",
      alt: "Xe tiện chuyến Hải Phòng đi Sân bay Nội Bài đón sảnh T1 T2",
    },
  ],
  "hai-phong-ha-long": [
    {
      src: "/HaiPhong.webp",
      badge: "Hải Phòng",
      caption: "Đón tận nơi tại Quán Toan, Trung tâm, Thủy Nguyên, An Dương",
      alt: "Xe ghép Hải Phòng đi Hạ Long đón tại Hải Phòng",
    },
    {
      src: "/HaLong.webp",
      badge: "TP. Hạ Long",
      caption:
        "Trả tận nơi Bãi Cháy, Hòn Gai, Tuần Châu, các khách sạn & resort",
      alt: "Xe ghép Hải Phòng Hạ Long qua cầu Bạch Đằng",
    },
  ],
  "hai-phong-mong-cai": [
    {
      src: "/HaiPhong.webp",
      badge: "Hải Phòng",
      caption: "Đón tại nhà riêng toàn TP. Hải Phòng theo giờ hẹn",
      alt: "Xe ghép Hải Phòng Móng Cái xuất phát tại Hải Phòng",
    },
    {
      src: "/MongCai.webp",
      badge: "TP. Móng Cái",
      caption: "Trả tận nơi Cửa khẩu quốc tế Móng Cái, Trà Cổ, Hải Hà",
      alt: "Xe ghép Hải Phòng Móng Cái đến Cửa khẩu",
    },
  ],
  "ha-long-bac-ninh-bac-giang": [
    {
      src: "/HaLong.webp",
      badge: "TP. Hạ Long",
      caption: "Đón tận nhà tại Bãi Cháy, Hòn Gai, Tuần Châu",
      alt: "Xe ghép Hạ Long Bắc Ninh Bắc Giang đón tại Hạ Long",
    },
    {
      src: "/BacNinh.webp",
      badge: "Bắc Ninh",
      caption: "Trả tận nơi TP. Bắc Ninh, Tiên Du, Quế Võ",
      alt: "Xe ghép Hạ Long đi Bắc Ninh",
    },
    {
      src: "/BacGiang.webp",
      badge: "Bắc Giang",
      caption: "Trả tận nơi TP. Bắc Giang, Việt Yên, Yên Dũng",
      alt: "Xe ghép Hạ Long đi Bắc Giang",
    },
  ],
  "ha-noi-mong-cai": [
    {
      src: "/HaNoi.webp",
      badge: "Hà Nội",
      caption: "Đón tại nhà các quận nội thành Hà Nội & Sân bay Nội Bài",
      alt: "Xe ghép Hà Nội Móng Cái đón tại Hà Nội",
    },
    {
      src: "/MongCai.webp",
      badge: "Móng Cái",
      caption: "Trả tận nơi Cửa khẩu quốc tế Móng Cái, bãi biển Trà Cổ",
      alt: "Xe ghép Hà Nội Móng Cái đến cửa khẩu",
    },
  ],
  "ha-noi-ha-long": [
    {
      src: "/HaNoi.webp",
      badge: "Hà Nội",
      caption:
        "Đón tại nhà riêng, văn phòng công ty, sảnh khách sạn trung tâm Hà Nội",
      alt: "Xe ghép Hà Nội Hạ Long đón tại Hà Nội",
    },
    {
      src: "/HaLong.webp",
      badge: "TP. Hạ Long",
      caption:
        "Trả tận sảnh khách sạn Bãi Cháy, Hòn Gai, cảng tàu khách Tuần Châu",
      alt: "Xe tiện chuyến Hà Nội Hạ Long",
    },
  ],
  "hai-phong-hai-duong": [
    {
      src: "/HaiPhong.webp",
      badge: "Hải Phòng",
      caption:
        "Đón tận nơi tại Quán Toan, Hồng Bàng, An Dương, trung tâm Hải Phòng",
      alt: "Xe ghép Hải Phòng Hải Dương đón tại Hải Phòng",
    },
  ],
  "hai-phong-thai-nguyen": [
    {
      src: "/HaiPhong.webp",
      badge: "Hải Phòng",
      caption: "Đón tại nhà ở Hải Phòng đưa lên Thái Nguyên",
      alt: "Xe ghép Hải Phòng Thái Nguyên đón tại Hải Phòng",
    },
    {
      src: "/BacNinh.webp",
      badge: "Lộ trình cao tốc",
      caption: "Lộ trình kết nối cao tốc thông suốt, êm dịu, không say xe",
      alt: "Lộ trình cao tốc Hải Phòng Thái Nguyên",
    },
  ],
};

// Fallback mặc định nếu tuyến chưa có ảnh riêng
const DEFAULT_SLIDES: RouteSlideItem[] = [
  {
    src: "/HaiPhong.webp",
    badge: "Điểm đón",
    caption: "Đón trả tận nhà nội thành và các huyện lân cận",
    alt: "Xe ghép tiện chuyến đón trả tận nhà",
  },
  {
    src: "/HaNoi.webp",
    badge: "Điểm đến",
    caption: "Đưa đón tận nơi theo yêu cầu của hành khách 24/7",
    alt: "Dịch vụ xe ghép liên tỉnh uy tín",
  },
];

interface RouteImageSlideshowProps {
  route: RouteItem;
}

export function RouteImageSlideshow({ route }: RouteImageSlideshowProps) {
  const slides = ROUTE_SLIDES_MAP[route.slug] || DEFAULT_SLIDES;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Tự động chuyển slide mỗi 3.8s (tạm dừng khi rê chuột hoặc tương tác)
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3800);
    return () => clearInterval(interval);
  }, [total, isPaused, nextSlide]);

  // Touch Swipe gestures cho mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    setIsPaused(false);
  };

  const activeSlide = slides[currentIdx] || slides[0];

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-xl aspect-[16/10] bg-slate-950 group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label={`Slideshow hình ảnh tuyến ${route.name}`}
    >
      {/* Các hình ảnh xếp lớp, chuyển đổi mượt mà */}
      {slides.map((slide, idx) => {
        const isActive = idx === currentIdx;
        return (
          <div
            key={slide.src + idx}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              isActive
                ? "opacity-100 scale-100 pointer-events-auto z-10"
                : "opacity-0 scale-105 pointer-events-none z-0"
            }`}
            aria-hidden={!isActive}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              // Ảnh đầu tiên là LCP của route hero: bật priority theo AGENTS.md rule 5.2
              priority={idx === 0}
              loading={idx === 0 ? undefined : "lazy"}
              decoding="async"
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center"
            />
          </div>
        );
      })}

      {/* Lớp gradient tối chân ảnh để chữ nổi bật */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent z-20 pointer-events-none" />

      {/* Badge loại dịch vụ góc trên bên trái */}
      <div className="absolute top-3 left-3 z-30">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
               bg-black/20 backdrop-blur-md
               border border-white/20
               text-white font-bold text-[11px] uppercase tracking-wider
               shadow-sm"
        >
          <Sparkles className="w-3 h-3 text-amber-300" aria-hidden="true" />
          <span>{activeSlide.badge}</span>
        </span>
      </div>

      {/* Nút điều hướng Trước / Sau */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Xem hình ảnh trước"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/50 hover:bg-slate-950/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Xem hình ảnh kế tiếp"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/50 hover:bg-slate-950/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Thông tin tuyến & Chú thích slide dưới đáy */}
      <div className="absolute bottom-2.5 inset-x-3 z-30 text-white text-xs p-1.5 flex flex-col justify-end">
        <p className="font-extrabold text-amber-300 text-sm sm:text-base leading-tight drop-shadow-sm">
          Tuyến {route.name}
        </p>
        <p className="text-[11px] sm:text-xs text-slate-200 line-clamp-1 mt-0.5">
          {activeSlide.caption}
        </p>

        {/* Thanh chấm chỉ số Slide (Dots indicator) */}
        {total > 1 && (
          <div className="flex items-center gap-1.5 mt-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIdx(i)}
                aria-label={`Chuyển đến ảnh ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentIdx
                    ? "w-6 bg-amber-400"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
