export interface BookingResponse {
  bookingId: string;
  confirmationNumber: string;
  hotelName: string;
  passengerName: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  currency: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  provider: 'PremierStays' | 'BudgetNests';
  roomType: string;
  refundable: boolean;
}
