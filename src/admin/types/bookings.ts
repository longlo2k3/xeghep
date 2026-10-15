import type { RouteDoc } from './routes';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type ServiceType = 'passenger' | 'parcel';
export type RideType = 'ghep' | 'bao';
export type BookingVehicleType = '4cho' | '5cho' | '7cho' | '16cho' | 'guihang';
export type AirportDirection = 'to_airport' | 'from_airport' | 'round_trip';
export type BookingPriceType =
  | 'fixed'
  | 'range'
  | 'from'
  | 'negotiable'
  | 'quote_required';
export type PaymentMethod = 'cash' | 'transfer';

export interface BookingDoc {
  id: number;
  bookingCode?: string | null;
  customerName: string;
  customerPhone: string;
  route?: (number | null) | RouteDoc;
  serviceType: ServiceType;
  pickupLocation: string;
  dropoffLocation: string;
  rideType?: RideType | null;
  vehicleType: BookingVehicleType;
  passengerCount?: number | null;
  pickupDatetime: string;
  airportDistrict?: string | null;
  airportDirection?: AirportDirection | null;
  distanceKm?: number | null;
  priceType?: BookingPriceType | null;
  estimatedPrice?: number | null;
  estimatedPriceMax?: number | null;
  finalPrice?: number | null;
  paymentMethod?: PaymentMethod | null;
  depositAmount?: number | null;
  status: BookingStatus;
  note?: string | null;
  dispatcherNote?: string | null;
  sourceIpHash?: string | null;
  createdAt: string;
  updatedAt: string;
}
