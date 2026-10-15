import type { MediaDoc } from './media';

export type TierKey = 'share1' | 'share2' | 'charter45' | 'charter7';

export type PriceType = 'fixed' | 'range' | 'from' | 'negotiable';

export type RouteStatus = 'draft' | 'active' | 'inactive' | 'archived';

export interface PriceTier {
  min?: number | null;
  max?: number | null;
  from?: boolean | null;
  negotiable?: boolean | null;
}

export interface PricingDetail {
  tierKey: TierKey;
  label: string;
  note?: string | null;
  id?: string | null;
}

export interface RouteSlide {
  image: number | MediaDoc;
  badge: string;
  caption: string;
  alt?: string | null;
  id?: string | null;
}

export interface RouteFaq {
  question: string;
  answer: string;
  id?: string | null;
}

export interface LocationAlias {
  text: string;
  id?: string | null;
}

export type RouteRegion =
  | 'Hải Phòng'
  | 'Hà Nội'
  | 'Hạ Long'
  | 'Móng Cái'
  | 'Bắc Ninh – Bắc Giang';

export interface RouteDoc {
  id: number;
  slug: string;
  name: string;
  origin: string;
  destination: string;
  distance?: string | null;
  duration?: string | null;
  tierShare1?: PriceTier | null;
  tierShare2?: PriceTier | null;
  tierCharter45?: PriceTier | null;
  tierCharter4to5?: PriceTier | null;
  tierCharter7?: PriceTier | null;
  priceFrom?: number | null;
  priceValidUntil?: string | null;
  pricingDetails?: PricingDetail[] | null;
  description: string;
  detailedContent?: Record<string, unknown> | null;
  operatingHoursText?: string | null;
  frequencyText?: string | null;
  pickups?: LocationAlias[] | null;
  dropoffs?: LocationAlias[] | null;
  originAliases?: LocationAlias[] | null;
  destinationAliases?: LocationAlias[] | null;
  regions?: RouteRegion[] | null;
  thumbnail?: (number | null) | MediaDoc;
  slides?: RouteSlide[] | null;
  faqs?: RouteFaq[] | null;
  relatedRoutes?: (number | RouteDoc)[] | null;
  isBannerTop?: boolean | null;
  bannerLabel?: string | null;
  sortOrder: number;
  status: RouteStatus;
  seo?: {
    metaTitle?: string | null;
    appendBrand?: boolean | null;
    metaDescription?: string | null;
    ogImage?: (number | null) | MediaDoc;
    noindex?: boolean | null;
  };
  createdAt: string;
  updatedAt: string;
}
