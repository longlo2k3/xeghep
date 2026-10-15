/**
 * Dữ liệu seed collection `routes` — ánh xạ từ `src/data/routes.ts` của frontend
 * theo spec v1.1 Phụ lục B (B.1 mapping, B.2 parseVndText, B.3 quy tắc làm sạch).
 *
 * Nguồn (chỉ đọc): TestSEO/src/data/routes.ts,
 * TestSEO/src/components/routes/RouteImageSlideshow.tsx (ROUTE_SLIDES_MAP, DEFAULT_SLIDES),
 * TestSEO/src/components/home/RoutePricingGrid.tsx (ROUTE_LOCATION_IMAGES).
 */
import { assertPriceFrom, parseVndText, type PriceTier } from "../parseVndText";

/** 5 giá trị regions cố định — spec 4.2.1 (dấu en dash trong "Bắc Ninh – Bắc Giang"). */
export const REGION_VALUES = [
  "Hải Phòng",
  "Hà Nội",
  "Hạ Long",
  "Móng Cái",
  "Bắc Ninh – Bắc Giang",
] as const;

export type RegionValue = (typeof REGION_VALUES)[number];

export type SeedTierKey = "share1" | "share2" | "charter45" | "charter7";

export type SeedSlide = {
  alt: string;
  badge: string;
  caption: string;
  filename: string;
};

export type SeedPricingDetail = {
  label: string;
  note?: string;
  tierKey: SeedTierKey;
};

export type SeedRoute = {
  bannerLabel?: string;
  description: string;
  destination: string;
  destinationAliases: string[];
  distance: string;
  dropoffs: string[];
  faqs: { answer: string; question: string }[];
  duration: string;
  isBannerTop: boolean;
  name: string;
  origin: string;
  originAliases: string[];
  pricingDetails: SeedPricingDetail[];
  pickups: string[];
  regions: RegionValue[];
  slug: string;
  slides: SeedSlide[];
  sortOrder: number;
  status: "active";
  thumbnailFilename: string | null;
  tierCharter45: PriceTier | null;
  tierCharter7: PriceTier | null;
  tierShare1: PriceTier | null;
  tierShare2: PriceTier | null;
};

/**
 * Thứ tự 7 tuyến trên banner trang chủ (BANNER_TOP_ROUTES) — KHÔNG thêm field
 * `bannerOrder` vào collection; chỉ dùng để sắp `isBannerTop`/`bannerLabel`.
 */
export const BANNER_ORDER = [
  "hai-phong-hai-duong",
  "hai-phong-ha-long",
  "hai-phong-thai-nguyen",
  "hai-phong-mong-cai",
  "ha-noi-mong-cai",
  "ha-long-bac-ninh-bac-giang",
  "hai-phong-ha-noi-noi-bai",
] as const;

/** Nhãn banner giữ ký tự "⇔" (khác name dùng "⇄") — B.1. */
const BANNER_LABELS: Record<string, string> = {
  "ha-noi-mong-cai": "Hà Nội ⇔ Móng Cái",
  "ha-long-bac-ninh-bac-giang": "Hạ Long ⇔ Bắc Ninh ⇔ Bắc Giang",
  "hai-phong-ha-long": "Hải Phòng ⇔ Hạ Long",
  "hai-phong-ha-noi-noi-bai": "Hải Phòng ⇔ Hà Nội ⇔ Nội Bài",
  "hai-phong-hai-duong": "Hải Phòng ⇔ Hải Dương",
  "hai-phong-mong-cai": "Hải Phòng ⇔ Móng Cái",
  "hai-phong-thai-nguyen": "Hải Phòng ⇔ Thái Nguyên",
  "hai-phong-ha-nam": "Hải Phòng ⇔ Hà Nam",
  "hai-phong-ninh-binh": "Hải Phòng ⇔ Ninh Bình",
  "hai-phong-nam-dinh": "Hải Phòng ⇔ Nam Định",
  "hai-duong-ha-noi": "Hải Dương ⇔ Hà Nội",
};

type SourceSlide = { alt: string; badge: string; caption: string; src: string };

/** ROUTE_SLIDES_MAP + DEFAULT_SLIDES (RouteImageSlideshow.tsx). */
const ROUTE_SLIDES_MAP: Record<string, SourceSlide[]> = {
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
  "hai-phong-bac-ninh-bac-giang": [
    {
      src: "/HaiPhong.webp",
      badge: "Hải Phòng",
      caption: "Đón trả tận nhà tại nội thành Hải Phòng, Quán Toan, Thủy Nguyên",
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
  "hai-phong-hai-duong": [
    {
      src: "/HaiPhong.webp",
      badge: "Hải Phòng",
      caption:
        "Đón tận nơi tại Quán Toan, Hồng Bàng, An Dương, trung tâm Hải Phòng",
      alt: "Xe ghép Hải Phòng Hải Dương đón tại Hải Phòng",
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
  "hai-phong-ha-nam": [
    {
      src: "/HaiPhong.webp",
      badge: "Hải Phòng",
      caption: "Đón trả tận nơi tại nhà riêng nội thành Hải Phòng",
      alt: "Xe ghép Hải Phòng đi Hà Nam đón tại Hải Phòng",
    },
    {
      src: "/banner.webp",
      badge: "Hà Nam",
      caption: "Trả tận nơi TP. Phủ Lý, Duy Tiên, KCN Đồng Văn",
      alt: "Xe ghép Hải Phòng trả tại Hà Nam",
    },
  ],
  "hai-phong-ninh-binh": [
    {
      src: "/HaiPhong.webp",
      badge: "Hải Phòng",
      caption: "Đón tại nhà riêng toàn TP. Hải Phòng theo giờ hẹn",
      alt: "Xe ghép Hải Phòng đi Ninh Bình đón tại Hải Phòng",
    },
    {
      src: "/photo03.avif",
      badge: "Ninh Bình",
      caption: "Trả tận nơi TP. Ninh Bình, Tam Điệp, Tràng An, Bái Đính",
      alt: "Xe tiện chuyến Hải Phòng đi Ninh Bình",
    },
  ],
  "hai-phong-nam-dinh": [
    {
      src: "/HaiPhong.webp",
      badge: "Hải Phòng",
      caption: "Đón tận nơi tại Hải Phòng, đưa thẳng Nam Định",
      alt: "Xe ghép Hải Phòng đi Nam Định đón tại Hải Phòng",
    },
    {
      src: "/photo04.avif",
      badge: "Nam Định",
      caption: "Trả tận nơi TP. Nam Định, Ý Yên, Vụ Bản, KCN Hòa Xá",
      alt: "Xe tiện chuyến Hải Phòng đi Nam Định",
    },
  ],
  "hai-duong-ha-noi": [
    {
      src: "/HaiPhong.webp",
      badge: "Hải Dương",
      caption: "Đón tận nơi TP. Hải Dương, Cẩm Giàng, Bình Giang",
      alt: "Xe ghép Hải Dương đi Hà Nội đón tại Hải Dương",
    },
    {
      src: "/HaNoi.webp",
      badge: "Hà Nội",
      caption: "Trả tận nơi các quận nội thành Hà Nội, Sân bay Nội Bài",
      alt: "Xe ghép Hải Dương lên Hà Nội",
    },
  ],
};

const DEFAULT_SLIDES: SourceSlide[] = [
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

/** ROUTE_LOCATION_IMAGES (RoutePricingGrid.tsx) → routes.thumbnail. */
const ROUTE_LOCATION_IMAGES: Record<string, string> = {
  "hai-phong-bac-ninh-bac-giang": "/HaiPhong.webp",
  "hai-phong-ha-noi-noi-bai": "/NoiBai.webp",
  "hai-phong-ha-long": "/HaLong.webp",
  "hai-phong-mong-cai": "/MongCai.webp",
  "ha-long-bac-ninh-bac-giang": "/BacNinh.webp",
  "ha-noi-mong-cai": "/MongCai.webp",
  "ha-noi-ha-long": "/HaLong.webp",
  "hai-phong-hai-duong": "/HaiPhong.webp",
  "hai-phong-thai-nguyen": "/BacNinh.webp",
  "hai-phong-ha-nam": "/HaiPhong.webp",
  "hai-phong-ninh-binh": "/HaiPhong.webp",
  "hai-phong-nam-dinh": "/HaiPhong.webp",
  "hai-duong-ha-noi": "/HaNoi.webp",
};

type SourceRoute = {
  description: string;
  destination: string;
  dropoffs: string[];
  faqs: { answer: string; question: string }[];
  distance: string;
  duration: string;
  name: string;
  origin: string;
  pickups: string[];
  priceCharter4to5Text: string;
  priceCharter7Text?: string;
  priceFrom: number;
  priceShare1Text: string;
  priceShare2Text?: string;
  pricingDetails: { label: string; note?: string; price: string }[];
  regions: string[];
  slug: string;
};

/** POPULAR_ROUTES — 9 tuyến theo đúng thứ tự lưới hiện tại. */
const SOURCE_ROUTES: SourceRoute[] = [
  {
    slug: "hai-phong-bac-ninh-bac-giang",
    name: "Hải Phòng ⇄ Bắc Ninh ⇄ Bắc Giang",
    origin: "Hải Phòng",
    destination: "Bắc Ninh / Bắc Giang",
    distance: "95 - 110 km",
    duration: "1 giờ 45 phút",
    priceFrom: 400000,
    priceShare1Text: "từ 400k",
    priceShare2Text: "từ 700k",
    priceCharter4to5Text: "từ 800k",
    priceCharter7Text: "từ 900k",
    pricingDetails: [
      { label: "Ghép 1 người", price: "từ 400k" },
      { label: "Ghép 2 người", price: "từ 700k" },
      { label: "Bao xe 5 chỗ", price: "từ 800k" },
      { label: "Bao xe 7 chỗ", price: "từ 900k" },
    ],
    description:
      "Tuyến xe ghép Hải Phòng ⇄ Bắc Ninh ⇄ Bắc Giang đón trả tận nhà tại nội thành Hải Phòng, Quán Toan và trả tận nơi tại TP. Bắc Ninh, TP. Bắc Giang và các KCN Quế Võ, Yên Phong, Quang Châu.",
    pickups: ["Hải Phòng (Quán Toan, Hồng Bàng, Lê Chân, Ngô Quyền, Thủy Nguyên, An Dương)"],
    dropoffs: [
      "TP. Bắc Ninh",
      "TP. Bắc Giang",
      "KCN Quế Võ",
      "KCN Yên Phong",
      "KCN Quang Châu",
      "KCN Đình Trám",
    ],
    regions: ["Hải Phòng", "Bắc Ninh – Bắc Giang"],
    faqs: [
      {
        question: "Xe ghép Hải Phòng - Bắc Ninh - Bắc Giang có đón trả tận nhà không?",
        answer:
          "Có, xe đón trả tận nơi tại nhà riêng, cơ quan, khách sạn hoặc các khu công nghiệp theo yêu cầu.",
      },
      {
        question: "Một xe ghép đi tối đa bao nhiêu người?",
        answer:
          "Xe chỉ nhận từ 1 đến 3 khách/chuyến để đảm bảo không gian rộng rãi, thoáng mát, xe chạy thẳng không vòng vèo.",
      },
      {
        question: "Có nhận chở hàng hóa trên tuyến này không?",
        answer:
          "Có, chúng tôi nhận gửi hàng hóa, bưu phẩm hỏa tốc giá chỉ từ 150k giao tận tay trong ngày.",
      },
    ],
  },
  {
    slug: "hai-phong-ha-noi-noi-bai",
    name: "Hải Phòng ⇄ Hà Nội ⇄ Nội Bài",
    origin: "Hải Phòng",
    destination: "Hà Nội / Nội Bài",
    distance: "120 - 145 km",
    duration: "1 giờ 30 phút",
    priceFrom: 400000,
    priceShare1Text: "400k",
    priceShare2Text: "700k",
    priceCharter4to5Text: "từ 900k",
    priceCharter7Text: "từ 950k",
    pricingDetails: [
      { label: "Ghép 1 người", price: "400k" },
      { label: "Ghép 2 người", price: "700k" },
      { label: "Bao xe 5 chỗ", price: "từ 900k" },
      { label: "Bao xe 7 chỗ", price: "từ 950k" },
    ],
    description:
      "Dịch vụ xe ghép và xe tiện chuyến Hải Phòng ⇄ Hà Nội ⇄ Sân bay Nội Bài chạy cao tốc 5B êm ái, đón trả tận nơi tại nhà riêng và các sảnh sân bay 24/7.",
    pickups: ["Quán Toan, Hồng Bàng, Lê Chân, Ngô Quyền, Hải An, Kiến An, Thủy Nguyên"],
    dropoffs: [
      "Các quận nội thành Hà Nội",
      "Sảnh T1 & T2 Sân bay Nội Bài",
      "Các bệnh viện trung ương",
    ],
    regions: ["Hải Phòng", "Hà Nội"],
    faqs: [
      {
        question: "Xe có lên sảnh sân bay Nội Bài đón đúng giờ bay không?",
        answer:
          "Có, tài xế theo dõi lịch bay của quý khách để đón đúng sảnh ga đến hoặc đưa lên sảnh đi kịp giờ check-in.",
      },
      {
        question: "Thời gian di chuyển từ Hải Phòng lên Hà Nội mất bao lâu?",
        answer:
          "Khoảng 1 giờ 30 phút chạy thẳng cao tốc Hà Nội - Hải Phòng không dừng đón khách dọc đường.",
      },
    ],
  },
  {
    slug: "hai-phong-ha-long",
    name: "Hải Phòng ⇄ Hạ Long",
    origin: "Hải Phòng",
    destination: "Hạ Long",
    distance: "55 km",
    duration: "45 phút",
    priceFrom: 250000,
    priceShare1Text: "250k",
    priceCharter4to5Text: "450k",
    priceCharter7Text: "550k",
    pricingDetails: [
      { label: "Ghép 1 khách", price: "250k" },
      { label: "Bao xe 4 chỗ", price: "450k" },
      { label: "Bao xe 7 chỗ", price: "550k" },
    ],
    description:
      "Tuyến cao tốc Hải Phòng ⇄ Hạ Long qua cầu Bạch Đằng kết nối nhanh chóng chỉ 45 phút, phục vụ 2 chiều đón trả tận nơi, bao xe và ghép ghế 24/7.",
    pickups: ["Hải Phòng (Quán Toan, nội thành, Thủy Nguyên)"],
    dropoffs: ["TP. Hạ Long (Bãi Cháy, Hòn Gai, Tuần Châu, Hùng Thắng)"],
    regions: ["Hải Phòng", "Hạ Long"],
    faqs: [
      {
        question: "Xe ghép Hải Phòng đi Hạ Long đón trả những khu vực nào?",
        answer:
          "Đón tại nhà ở Hải Phòng và trả tận nơi tại Bãi Cháy, Hòn Gai, Tuần Châu hoặc các điểm du lịch tại Hạ Long.",
      },
    ],
  },
  {
    slug: "hai-phong-mong-cai",
    name: "Hải Phòng ⇄ Móng Cái",
    origin: "Hải Phòng",
    destination: "Móng Cái",
    distance: "195 km",
    duration: "2 giờ 30 phút",
    priceFrom: 500000,
    priceShare1Text: "500k",
    priceShare2Text: "800k",
    priceCharter4to5Text: "1.400k",
    priceCharter7Text: "1.500k",
    pricingDetails: [
      { label: "Ghép 1 khách", price: "500k" },
      { label: "Ghép 2 khách", price: "800k" },
      { label: "Bao xe 4 chỗ", price: "1.400k" },
      { label: "Bao xe 7 chỗ", price: "1.500k" },
    ],
    description:
      "Tuyến cao tốc Hải Phòng ⇄ Vân Đồn ⇄ Móng Cái chạy êm ru 2.5 tiếng. Nhận ghép khách 1-3 người, bao xe trọn gói và gửi hàng hóa hỏa tốc trong ngày.",
    pickups: ["Hải Phòng (Quán Toan, Trung tâm, Thủy Nguyên, An Dương)"],
    dropoffs: [
      "TP. Móng Cái",
      "Cửa khẩu quốc tế Móng Cái",
      "Trà Cổ",
      "Hải Hà",
    ],
    regions: ["Hải Phòng", "Móng Cái"],
    faqs: [
      {
        question: "Xe chạy thẳng hay có chuyển xe dọc đường không?",
        answer: "Cam kết 100% xe chạy thẳng cao tốc, không chuyển xe, không sang khách.",
      },
    ],
  },
  {
    slug: "ha-long-bac-ninh-bac-giang",
    name: "Hạ Long ⇄ Bắc Ninh ⇄ Bắc Giang",
    origin: "Hạ Long",
    destination: "Bắc Ninh / Bắc Giang",
    distance: "125 km",
    duration: "2 giờ",
    priceFrom: 450000,
    priceShare1Text: "từ 450k",
    priceShare2Text: "từ 700k",
    priceCharter4to5Text: "từ 900k",
    priceCharter7Text: "từ 950k",
    pricingDetails: [
      { label: "Ghép 1 người", price: "từ 450k" },
      { label: "Ghép 2 người", price: "từ 700k" },
      { label: "Bao xe 5 chỗ", price: "từ 900k" },
      { label: "Bao xe 7 chỗ", price: "từ 950k" },
    ],
    description:
      "Xe tiện chuyến và ghép ghế từ Hạ Long (Bãi Cháy, Hòn Gai, Tuần Châu) đi Bắc Ninh và Bắc Giang đón trả tận nhà, phục vụ cả ngày lẫn đêm.",
    pickups: ["TP. Hạ Long (Bãi Cháy, Hòn Gai, Tuần Châu)"],
    dropoffs: [
      "TP. Bắc Ninh",
      "TP. Bắc Giang",
      "Việt Yên",
      "Yên Dũng",
      "Tiên Du",
    ],
    regions: ["Hạ Long", "Bắc Ninh – Bắc Giang"],
    faqs: [
      {
        question: "Giá bao xe 5 chỗ từ Hạ Long sang Bắc Ninh là bao nhiêu?",
        answer: "Bao xe 5 chỗ trọn gói từ 900k, giá đã bao gồm phí cầu đường bến bãi.",
      },
    ],
  },
  {
    slug: "ha-noi-mong-cai",
    name: "Hà Nội ⇄ Móng Cái",
    origin: "Hà Nội",
    destination: "Móng Cái",
    distance: "310 km",
    duration: "3 giờ 30 phút",
    priceFrom: 600000,
    priceShare1Text: "600k",
    priceShare2Text: "1.000k",
    priceCharter4to5Text: "2.100k",
    priceCharter7Text: "2.200k",
    pricingDetails: [
      { label: "Ghép 1 khách", price: "600k" },
      { label: "Ghép 2 khách", price: "1.000k" },
      { label: "Bao xe 4 chỗ", price: "2.100k" },
      { label: "Bao xe 7 chỗ", price: "2.200k" },
    ],
    description:
      "Tuyến cao tốc huyết mạch Hà Nội ⇄ Hải Phòng ⇄ Vân Đồn ⇄ Móng Cái, xe riêng đời mới, đưa đón tận nhà nội thành Hà Nội và tận nơi tại TP. Móng Cái.",
    pickups: ["Các quận nội thành Hà Nội", "Sân bay Nội Bài"],
    dropoffs: [
      "TP. Móng Cái",
      "Cửa khẩu quốc tế Móng Cái",
      "Khu du lịch Trà Cổ",
    ],
    regions: ["Hà Nội", "Móng Cái"],
    faqs: [
      {
        question: "Xe xuất phát vào những khung giờ nào?",
        answer:
          "Chúng tôi phục vụ 24/7 liên tục cả ngày lẫn đêm, chỉ cần đặt trước tổng đài sẽ sắp xếp chuyến phù hợp nhất.",
      },
    ],
  },
  {
    slug: "ha-noi-ha-long",
    name: "Hà Nội ⇄ Hạ Long",
    origin: "Hà Nội",
    destination: "Hạ Long",
    distance: "155 km",
    duration: "2 giờ 15 phút",
    priceFrom: 450000,
    priceShare1Text: "450k",
    priceShare2Text: "800k",
    priceCharter4to5Text: "1.100k",
    priceCharter7Text: "1.200k",
    pricingDetails: [
      { label: "Ghép 1 khách", price: "450k" },
      { label: "Ghép 2 khách", price: "800k" },
      { label: "Bao xe 4 chỗ", price: "1.100k" },
      { label: "Bao xe 7 chỗ", price: "1.200k" },
    ],
    description:
      "Tuyến cao tốc Hà Nội ⇄ Hạ Long đưa đón tận nhà hoặc sảnh khách sạn. Xe đời mới êm ái, máy lạnh sạch sẽ, tài xế lịch sự chu đáo.",
    pickups: ["Các quận nội thành Hà Nội", "Sân bay Nội Bài"],
    dropoffs: [
      "TP. Hạ Long",
      "Bãi Cháy",
      "Hòn Gai",
      "Cảng tàu khách Tuần Châu",
    ],
    regions: ["Hà Nội", "Hạ Long"],
    faqs: [
      {
        question: "Có đón trả tại resort, khách sạn ở Bãi Cháy không?",
        answer:
          "Có, tài xế đón trả tận sảnh resort, khách sạn theo yêu cầu của hành khách.",
      },
    ],
  },
  {
    slug: "hai-phong-hai-duong",
    name: "Hải Phòng ⇄ Hải Dương",
    origin: "Hải Phòng",
    destination: "Hải Dương",
    distance: "45 km",
    duration: "40 phút",
    priceFrom: 250000,
    priceShare1Text: "250k",
    priceShare2Text: "400k",
    priceCharter4to5Text: "500k",
    priceCharter7Text: "550k",
    pricingDetails: [
      { label: "Ghép 1 khách", price: "250k" },
      { label: "Ghép 2 khách", price: "400k" },
      { label: "Bao xe 4 chỗ", price: "500k" },
      { label: "Bao xe 7 chỗ", price: "550k" },
    ],
    description:
      "Tuyến xe ghép nhanh Hải Phòng ⇄ Hải Dương qua Quốc lộ 5 hoặc cao tốc, phục vụ đi làm, công tác, thăm thân đón trả tận nơi.",
    pickups: ["Hải Phòng (Quán Toan, Trung tâm, An Dương)"],
    dropoffs: [
      "TP. Hải Dương",
      "Kim Thành",
      "Cẩm Giàng",
      "KCN Nam Sách",
    ],
    regions: ["Hải Phòng"],
    faqs: [
      {
        question: "Bao xe riêng Hải Phòng - Hải Dương giá bao nhiêu?",
        answer: "Bao trọn xe riêng chỉ 500k trọn gói đón trả tận nhà.",
      },
    ],
  },
  {
    slug: "hai-phong-thai-nguyen",
    name: "Hải Phòng ⇄ Thái Nguyên",
    origin: "Hải Phòng",
    destination: "Thái Nguyên",
    distance: "150 km",
    duration: "2 giờ 15 phút",
    priceFrom: 600000,
    priceShare1Text: "600k",
    priceShare2Text: "900k",
    priceCharter4to5Text: "1.400k",
    priceCharter7Text: "1.500k",
    pricingDetails: [
      { label: "Ghép 1 khách", price: "600k" },
      { label: "Ghép 2 khách", price: "900k" },
      { label: "Bao xe 4 chỗ", price: "1.400k" },
      { label: "Bao xe 7 chỗ", price: "1.500k" },
    ],
    description:
      "Xe ghép tiện chuyến Hải Phòng ⇄ Thái Nguyên chạy cao tốc kết nối đón trả tận nhà tại Hải Phòng và các quận huyện Thái Nguyên, KCN Samsung Yên Bình.",
    pickups: ["Hải Phòng (Quán Toan, trung tâm thành phố)"],
    dropoffs: [
      "TP. Thái Nguyên",
      "TP. Sông Công",
      "TP. Phổ Yên",
      "KCN Samsung Phổ Yên",
    ],
    regions: ["Hải Phòng"],
    faqs: [
      {
        question: "Xe chạy hết bao nhiêu thời gian?",
        answer: "Khoảng 2 giờ 15 phút chạy cao tốc êm ái, xe sạch sẽ không mùi.",
      },
    ],
  },
  {
    slug: "hai-phong-ha-nam",
    name: "Hải Phòng ⇄ Hà Nam",
    origin: "Hải Phòng",
    destination: "Hà Nam",
    distance: "105 km",
    duration: "1 giờ 45 phút",
    priceFrom: 400000,
    priceShare1Text: "400k",
    priceShare2Text: "700k",
    priceCharter4to5Text: "từ 800k",
    priceCharter7Text: "từ 900k",
    pricingDetails: [
      { label: "Ghép 1 khách", price: "400k" },
      { label: "Ghép 2 khách", price: "700k" },
      { label: "Bao xe 4 chỗ", price: "từ 800k" },
      { label: "Bao xe 7 chỗ", price: "từ 900k" },
    ],
    description:
      "Dịch vụ xe ghép và xe tiện chuyến Hải Phòng ⇄ Hà Nam đón trả tận nhà nội thành Hải Phòng đi TP. Phủ Lý, Duy Tiên, KCN Đồng Văn 24/7.",
    pickups: ["Hải Phòng (Quán Toan, Hồng Bàng, Lê Chân, Ngô Quyền, Thủy Nguyên, An Dương)"],
    dropoffs: ["TP. Phủ Lý", "Duy Tiên", "KCN Đồng Văn", "Kim Bảng", "Thanh Liêm"],
    regions: ["Hải Phòng"],
    faqs: [
      {
        question: "Xe ghép Hải Phòng - Hà Nam có đón trả tận nhà không?",
        answer: "Có, xe đón trả tận nơi tại nhà riêng nội thành Hải Phòng và các huyện thị tại Hà Nam.",
      },
      {
        question: "Thời gian di chuyển từ Hải Phòng về Phủ Lý (Hà Nam) mất bao lâu?",
        answer: "Khoảng 1 giờ 45 phút chạy thẳng qua các trục cao tốc thông thoáng.",
      },
    ],
  },
  {
    slug: "hai-phong-ninh-binh",
    name: "Hải Phòng ⇄ Ninh Bình",
    origin: "Hải Phòng",
    destination: "Ninh Bình",
    distance: "130 km",
    duration: "2 giờ 15 phút",
    priceFrom: 450000,
    priceShare1Text: "450k",
    priceShare2Text: "700k",
    priceCharter4to5Text: "từ 900k",
    priceCharter7Text: "từ 1.000k",
    pricingDetails: [
      { label: "Ghép 1 khách", price: "450k" },
      { label: "Ghép 2 khách", price: "700k" },
      { label: "Bao xe 4 chỗ", price: "từ 900k" },
      { label: "Bao xe 7 chỗ", price: "từ 1.000k" },
    ],
    description:
      "Tuyến xe ghép Hải Phòng ⇄ Ninh Bình đón trả tận nơi tại nhà ở Hải Phòng và TP. Ninh Bình, Tam Điệp, Tràng An, Bái Đính 24/7.",
    pickups: ["Hải Phòng (Quán Toan, Hồng Bàng, Lê Chân, Ngô Quyền, Thủy Nguyên, An Dương)"],
    dropoffs: ["TP. Ninh Bình", "TP. Tam Điệp", "Tràng An", "Bái Đính", "Hoa Lư", "Yên Khánh"],
    regions: ["Hải Phòng"],
    faqs: [
      {
        question: "Xe có trả tận nơi các điểm du lịch tại Ninh Bình không?",
        answer: "Có, tài xế trả tận nơi tại khách sạn, resort, Tràng An, Bái Đính, Tam Cốc theo yêu cầu.",
      },
      {
        question: "Bao xe 4 chỗ Hải Phòng đi Ninh Bình giá bao nhiêu?",
        answer: "Giá bao trọn xe 4 chỗ chỉ từ 900k, giá trọn gói không phát sinh thêm chi phí.",
      },
    ],
  },
  {
    slug: "hai-phong-nam-dinh",
    name: "Hải Phòng ⇄ Nam Định",
    origin: "Hải Phòng",
    destination: "Nam Định",
    distance: "90 km",
    duration: "1 giờ 45 phút",
    priceFrom: 400000,
    priceShare1Text: "400k",
    priceShare2Text: "700k",
    priceCharter4to5Text: "từ 900k",
    priceCharter7Text: "từ 1.000k",
    pricingDetails: [
      { label: "Ghép 1 khách", price: "400k" },
      { label: "Ghép 2 khách", price: "700k" },
      { label: "Bao xe 4 chỗ", price: "từ 900k" },
      { label: "Bao xe 7 chỗ", price: "từ 1.000k" },
    ],
    description:
      "Xe tiện chuyến Hải Phòng ⇄ Nam Định đón trả tận nhà tại Hải Phòng và TP. Nam Định, Ý Yên, Vụ Bản, KCN Hòa Xá an toàn, đúng hẹn.",
    pickups: ["Hải Phòng (Quán Toan, Hồng Bàng, Lê Chân, Ngô Quyền, Kiến An, Thủy Nguyên, An Dương)"],
    dropoffs: ["TP. Nam Định", "Ý Yên", "Vụ Bản", "KCN Hòa Xá", "Mỹ Lộc", "Nam Trực"],
    regions: ["Hải Phòng"],
    faqs: [
      {
        question: "Xe ghép Hải Phòng - Nam Định chạy những khung giờ nào?",
        answer: "Xe phục vụ liên tục 24/7 theo giờ hẹn của quý khách.",
      },
      {
        question: "Có nhận gửi hàng hỏa tốc tuyến Hải Phòng - Nam Định không?",
        answer: "Có, chúng tôi nhận gửi hàng hỏa tốc trong ngày giao tận tay người nhận với giá tốt.",
      },
    ],
  },
  {
    slug: "hai-duong-ha-noi",
    name: "Hải Dương ⇄ Hà Nội",
    origin: "Hải Dương",
    destination: "Hà Nội",
    distance: "65 km",
    duration: "50 phút",
    priceFrom: 200000,
    priceShare1Text: "200k",
    priceShare2Text: "300k",
    priceCharter4to5Text: "từ 550k",
    priceCharter7Text: "từ 600k",
    pricingDetails: [
      { label: "Ghép 1 khách", price: "200k" },
      { label: "Ghép 2 khách", price: "300k" },
      { label: "Bao xe 4 chỗ", price: "từ 550k" },
      { label: "Bao xe 7 chỗ", price: "từ 600k" },
    ],
    description:
      "Tuyến xe ghép siêu tốc Hải Dương ⇄ Hà Nội qua cao tốc 5B đón trả tận nhà tại TP. Hải Dương và các quận nội thành Hà Nội chỉ 50 phút.",
    pickups: ["TP. Hải Dương", "Cẩm Giàng", "Bình Giang", "Nam Sách", "Kim Thành", "Gia Lộc"],
    dropoffs: ["Các quận nội thành Hà Nội", "Sân bay Nội Bài", "Các bệnh viện trung ương"],
    regions: ["Hà Nội"],
    faqs: [
      {
        question: "Xe đi cao tốc 5B hay Quốc lộ 5 cũ?",
        answer: "Cam kết 100% chạy cao tốc Hà Nội - Hải Phòng (5B) êm ái, nhanh chóng chỉ khoảng 50 phút.",
      },
      {
        question: "Bao xe 4 chỗ trọn gói Hải Dương lên Hà Nội là bao nhiêu?",
        answer: "Bao xe 4 chỗ trọn gói đón trả tận nhà chỉ từ 550k.",
      },
    ],
  },
];

/** B.3.1: "Hải Phòng (Quán Toan, Hồng Bàng)" → outer "Hải Phòng" + từng địa danh. */
export function splitPlaceEntry(entry: string): { outer: string | null; places: string[] } {
  const trimmed = entry.trim();
  const wrapped = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(trimmed);
  if (wrapped) {
    const outer = wrapped[1].trim();
    const places = wrapped[2]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return { outer: outer || null, places };
  }
  return {
    outer: null,
    places: trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

/** B.3: "Ghép 1…" → share1, "Ghép 2…" → share2, "Bao xe 7…"/"7 chỗ" → charter7, còn lại charter45. */
export function tierKeyOfLabel(label: string): SeedTierKey {
  if (label.includes("Ghép 1")) return "share1";
  if (label.includes("Ghép 2")) return "share2";
  if (label.includes("Bao xe 7") || label.includes("7 chỗ")) return "charter7";
  return "charter45";
}

function toRegions(values: string[]): RegionValue[] {
  return values.map((value) => {
    if (!(REGION_VALUES as readonly string[]).includes(value)) {
      throw new Error(`Region không hợp lệ khi seed routes: "${value}"`);
    }
    return value as RegionValue;
  });
}

function filenameOf(src: string): string {
  return src.replace(/^\//, "");
}

function buildSeedRoute(src: SourceRoute, index: number): SeedRoute {
  const pickupEntries = src.pickups.map(splitPlaceEntry);
  const dropoffEntries = src.dropoffs.map(splitPlaceEntry);

  const pickups = dedupe(pickupEntries.flatMap((entry) => entry.places));
  const dropoffs = dedupe(dropoffEntries.flatMap((entry) => entry.places));

  const destinationKeys = src.destination
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

  const originAliases = dedupe([
    src.origin,
    ...pickupEntries.map((entry) => entry.outer).filter((v): v is string => Boolean(v)),
    ...pickups,
  ]);
  const destinationAliases = dedupe([
    ...destinationKeys,
    ...dropoffEntries.map((entry) => entry.outer).filter((v): v is string => Boolean(v)),
    ...dropoffs,
  ]);

  const slides = (ROUTE_SLIDES_MAP[src.slug] ?? DEFAULT_SLIDES).map((slide) => ({
    alt: slide.alt,
    badge: slide.badge,
    caption: slide.caption,
    filename: filenameOf(slide.src),
  }));

  const bannerLabel = BANNER_LABELS[src.slug];

  return {
    slug: src.slug,
    name: src.name,
    origin: src.origin,
    destination: src.destination,
    distance: src.distance,
    duration: src.duration,
    description: src.description,
    status: "active",
    sortOrder: index + 1,
    tierShare1: parseVndText(src.priceShare1Text),
    tierShare2: parseVndText(src.priceShare2Text ?? null),
    tierCharter45: parseVndText(src.priceCharter4to5Text),
    tierCharter7: parseVndText(src.priceCharter7Text ?? null),
    // Chỉ giữ dòng đang hiển thị + label/note; giá hiển thị lấy từ tier tương ứng.
    pricingDetails: src.pricingDetails.map((detail) => ({
      tierKey: tierKeyOfLabel(detail.label),
      label: detail.label,
      ...(detail.note ? { note: detail.note } : {}),
    })),
    pickups,
    dropoffs,
    originAliases,
    destinationAliases,
    regions: toRegions(src.regions),
    thumbnailFilename: filenameOf(ROUTE_LOCATION_IMAGES[src.slug] ?? "/HaiPhong.webp"),
    slides,
    isBannerTop: Boolean(bannerLabel),
    ...(bannerLabel ? { bannerLabel } : {}),
    faqs: src.faqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
  };
}

export const SEED_ROUTES: SeedRoute[] = SOURCE_ROUTES.map(buildSeedRoute);

/** priceFrom "cũ" trên frontend — dùng assertPriceFrom (B.2) và báo cáo bảng đối soát. */
export const SEED_PRICE_CHECKS: {
  priceFrom: number;
  priceShare1Text: string;
  slug: string;
}[] = SOURCE_ROUTES.map((src) => ({
  priceFrom: src.priceFrom,
  priceShare1Text: src.priceShare1Text,
  slug: src.slug,
}));

for (const check of SEED_PRICE_CHECKS) {
  assertPriceFrom(check);
}
