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
}
