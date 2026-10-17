export interface RoutePriceDetail {
  label: string;
  price: string;
  note?: string;
}

export interface RouteItem {
  slug: string;
  name: string;
  bannerLabel?: string;
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  priceFrom: number;
  priceShare1Text: string;
  priceShare2Text?: string;
  priceCharter4to5Text: string;
  priceCharter7Text?: string;
  pricingDetails: RoutePriceDetail[];
  description: string;
  pickups: string[];
  dropoffs: string[];
  faqs: { question: string; answer: string }[];
  regions: string[];
  isBannerTop?: boolean;
  /** Ảnh nền lấy từ ảnh SEO (ogImage) của tuyến trong CMS. */
  imageUrl?: string;
}

export interface CompanyInfoData {
  name: string;
  brandName: string;
  hotline: string;
  hotlineRaw: string;
  hotlineHref: string;
  zaloHref: string;
  smsHref: string;
  email: string;
  website: string;
  domainName: string;
  fanpage: string;
  fanpageUrl: string;
  topBannerLine1: string;
  topBannerLine2: string;
  coverage: string;
  workingHours: string;
  fleetDescription: string;
  bookingPromise: string;
  summary: string;
}
