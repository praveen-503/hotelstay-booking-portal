export interface BookingRequest {
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
}
