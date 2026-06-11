export interface HotelResult {
  id: string;
  name: string;
  city: string;
  address: string;
  rating: number;
  stars?: number;
  nightlyRate: number;
  currency: string;
  imageUrl: string;
  amenities: readonly string[];
  availableRooms: number;
  refundable: boolean;
  provider: 'PremierStays' | 'BudgetNests';
  roomType: string;
}
