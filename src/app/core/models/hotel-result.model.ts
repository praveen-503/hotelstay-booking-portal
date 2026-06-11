export interface HotelResult {
  id: string;
  name: string;
  city: string;
  address: string;
  rating: number;
  nightlyRate: number;
  currency: string;
  imageUrl: string;
  amenities: readonly string[];
  availableRooms: number;
  refundable: boolean;
}
