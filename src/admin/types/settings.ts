import type { MediaDoc } from './media';

export interface CompanySecondaryPhone {
  label?: string | null;
  number?: string | null;
}

export interface AreaServedItem {
  type: 'City' | 'AdministrativeArea';
  name: string;
  id?: string | null;
}

export type CommitmentIcon =
  | 'ShieldCheck'
  | 'MapPin'
  | 'Users'
  | 'BadgePercent'
  | 'Clock'
  | 'Award';

export interface CompanyCommitment {
  title: string;
  description: string;
  iconName: CommitmentIcon;
  id?: string | null;
}

export type PaymentMethodIcon =
  | 'Banknote'
  | 'CreditCard'
  | 'Smartphone'
  | 'CheckCircle'
  | 'QrCode'
  | 'Wallet';

export interface CompanyPaymentMethod {
  title: string;
  description: string;
  iconName: PaymentMethodIcon;
  id?: string | null;
}

export interface CompanyTestimonial {
  author: string;
  location?: string | null;
  content: string;
  rating?: number | null;
  avatarText?: string | null;
  isVisible?: boolean | null;
  id?: string | null;
}

export interface CompanySettings {
  id?: number;
  identity: {
    companyName: string;
    brandName: string;
    website: string;
    taxCode?: string | null;
  };
  contact: {
    hotline: string;
    hotlineRaw: string;
    secondaryPhone?: CompanySecondaryPhone;
    email: string;
    zaloUrl?: string | null;
    fanpageName?: string | null;
    fanpageUrl?: string | null;
  };
  location?: {
    address?: string | null;
    mapEmbedUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  banner?: {
    topBannerLine1?: string | null;
    topBannerLine2?: string | null;
    coverage?: string | null;
    workingHours?: string | null;
    fleetDescription?: string | null;
    bookingPromise?: string | null;
    summary?: string | null;
  };
  brandSeo?: {
    logo?: (number | null) | MediaDoc;
    defaultOgImage?: (number | null) | MediaDoc;
    areaServed?: AreaServedItem[] | null;
    priceRange?: string | null;
  };
  commitments?: CompanyCommitment[] | null;
  paymentMethods?: CompanyPaymentMethod[] | null;
  testimonials?: CompanyTestimonial[] | null;
  hotlineHref?: string | null;
  zaloHref?: string | null;
  smsHref?: string | null;
  domainName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PricingSettings {
  id?: number;
  parcelFromPrice?: number | null;
  parcelDeliveryText?: string | null;
  maxPassengersPerShareTrip?: number | null;
  minLeadTimeMinutes?: number | null;
  freeCancelMinutes?: number | null;
  returningCustomerDiscountPercent?: number | null;
  priceValidUntil: string;
  roundTripDiscountText?: string | null;
  waitingTimeText?: string | null;
  waitingFreeMinutes?: number | null;
  waitingFeePerHour?: number | null;
  waitingMaxHours?: number | null;
  tollsNote?: string | null;
  tollsNoteShort?: string | null;
  overnightNote?: string | null;
  overnightPhone?: string | null;
  holidayNote?: string | null;
  priceValidUntilWarning?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AirportVehicleRates {
  sedan5Seats: number;
  suv7Seats: number;
  van16Seats: number;
}

export interface AirportPricingDoc {
  id: number;
  slug: string;
  district: string;
  fromHanoiToAirport: AirportVehicleRates;
  fromAirportToHanoi: AirportVehicleRates;
  roundTrip: AirportVehicleRates;
  roundTripWarning?: string | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DistanceRateDoc {
  id: number;
  label: string;
  minKm: number;
  maxKm?: number | null;
  sedan5Seats: number;
  suv7Seats: number;
  van16Seats: number;
  sortOrder?: number | null;
  createdAt: string;
  updatedAt: string;
}

