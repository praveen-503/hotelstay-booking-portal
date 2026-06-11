export interface BookingRequest {
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
  passengerName: string;
  documentType: 'Passport' | 'NationalId';
  documentNumber: string;
}
