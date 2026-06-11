export interface BookingResponse {
  bookingId: string;
  confirmationNumber: string;
  hotelName: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  currency: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}
