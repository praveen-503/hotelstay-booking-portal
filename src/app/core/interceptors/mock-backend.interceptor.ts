import { HttpEvent, HttpResponse, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { HotelResult, BookingResponse } from '../models';

const MOCK_HOTELS: readonly HotelResult[] = [
  {
    id: '1',
    name: 'Grand Premier Plaza',
    city: 'New York',
    country: 'USA',
    address: '768 5th Ave',
    rating: 4.8,
    stars: 5,
    nightlyRate: 299,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    amenities: ['Free WiFi', 'Swimming Pool', 'Luxury Spa', 'Fitness Center', 'Valet Parking'],
    availableRooms: 5,
    refundable: true,
    provider: 'PremierStays',
    roomType: 'Deluxe King Suite'
  },
  {
    id: '2',
    name: 'Manhattan Budget Nest',
    city: 'New York',
    country: 'USA',
    address: '123 W 34th St',
    rating: 3.9,
    stars: 3,
    nightlyRate: 119,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    amenities: ['Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Breakfast Included'],
    availableRooms: 12,
    refundable: false,
    provider: 'BudgetNests',
    roomType: 'Standard Queen Room'
  },
  {
    id: '3',
    name: 'Miami Premier Beach Resort',
    city: 'Miami',
    country: 'USA',
    address: '1020 Ocean Dr',
    rating: 4.6,
    stars: 5,
    nightlyRate: 349,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    amenities: ['Ocean View', 'Free WiFi', 'Infinity Pool', 'Private Beach Access', 'Restaurant & Bar'],
    availableRooms: 3,
    refundable: true,
    provider: 'PremierStays',
    roomType: 'Oceanfront Double Queen'
  },
  {
    id: '4',
    name: 'Sunny Budget Nest Miami',
    city: 'Miami',
    country: 'USA',
    address: '456 Collins Ave',
    rating: 4.1,
    stars: 2,
    nightlyRate: 89,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    amenities: ['Free WiFi', 'Outdoor Pool', 'Kitchenette', 'Pet Friendly'],
    availableRooms: 8,
    refundable: true,
    provider: 'BudgetNests',
    roomType: 'Basic Twin Studio'
  },
  {
    id: '5',
    name: 'Premier Executive Capital',
    city: 'Washington',
    country: 'USA',
    address: '1500 Pennsylvania Ave NW',
    rating: 4.7,
    stars: 4,
    nightlyRate: 249,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    amenities: ['Free WiFi', '24/7 Business Center', 'Free Airport Shuttle', 'Executive Club Lounge'],
    availableRooms: 4,
    refundable: true,
    provider: 'PremierStays',
    roomType: 'Executive Business Room'
  },
  {
    id: '6',
    name: 'Capitol Budget Cozy Nest',
    city: 'Washington',
    country: 'USA',
    address: '789 K St NW',
    rating: 3.5,
    nightlyRate: 79,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80',
    amenities: ['Free WiFi', 'In-room Coffee Maker', 'Shared Lounge & Games Room'],
    availableRooms: 15,
    refundable: false,
    provider: 'BudgetNests',
    roomType: 'Economy Single Room'
  },
  {
    id: '7',
    name: 'London Premier Tower',
    city: 'London',
    country: 'United Kingdom',
    address: '35 Tower Hill',
    rating: 4.8,
    stars: 5,
    nightlyRate: 180,
    currency: 'GBP',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?auto=format&fit=crop&w=800&q=80',
    amenities: ['Free WiFi', 'Fitness Center', 'Restaurant', 'Bar', 'Room Service'],
    availableRooms: 6,
    refundable: true,
    provider: 'PremierStays',
    roomType: 'Superior Double Room'
  }
];

const DEFAULT_BOOKING: BookingResponse = {
  bookingId: 'bk_default',
  confirmationNumber: 'HS-777777',
  hotelName: 'Grand Premier Plaza',
  passengerName: 'Jane Doe',
  checkInDate: '2026-06-15',
  checkOutDate: '2026-06-18',
  totalAmount: 1794, // 299 * 2 rooms * 3 nights = 1794
  currency: 'USD',
  status: 'confirmed',
  provider: 'PremierStays',
  roomType: 'Deluxe King Suite',
  refundable: true
};

const getStoredBookings = (): BookingResponse[] => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [DEFAULT_BOOKING];
  }
  try {
    const data = localStorage.getItem('mock_bookings');
    const bookings = data ? JSON.parse(data) : [];
    if (!bookings.some((b: any) => b.confirmationNumber === 'HS-777777')) {
      bookings.push(DEFAULT_BOOKING);
    }
    return bookings;
  } catch {
    return [DEFAULT_BOOKING];
  }
};

const storeBooking = (booking: BookingResponse) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  try {
    const bookings = getStoredBookings();
    bookings.push(booking);
    localStorage.setItem('mock_bookings', JSON.stringify(bookings));
  } catch {}
};

export const mockBackendInterceptor: HttpInterceptorFn = (request, next) => {
  const { url, method, params } = request;

  // Intercept Search
  if (url.endsWith('/hotels/search') && method === 'GET') {
    const destination = params.get('destination')?.toLowerCase() || '';

    // Filter hotels by destination matching city, country or address
    const filteredHotels = MOCK_HOTELS.filter(
      (hotel) =>
        hotel.city.toLowerCase().includes(destination) ||
        hotel.country.toLowerCase().includes(destination) ||
        hotel.address.toLowerCase().includes(destination) ||
        destination.includes(hotel.city.toLowerCase())
    );

    return of(new HttpResponse({ status: 200, body: filteredHotels })).pipe(delay(600));
  }

  // Intercept Get Booking by Reference
  const bookingRefMatch = url.match(/\/hotels\/booking\/([^/]+)$/);
  if (bookingRefMatch && method === 'GET') {
    const reference = bookingRefMatch[1];
    const bookings = getStoredBookings();
    const booking = bookings.find((b) => b.confirmationNumber === reference);

    if (booking) {
      return of(new HttpResponse({ status: 200, body: booking })).pipe(delay(400));
    } else {
      return throwError(() => new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: `Booking with reference number ${reference} not found.` },
        url
      })).pipe(delay(300));
    }
  }

  // Intercept Get Hotel By ID
  const hotelIdMatch = url.match(/\/hotels\/([^/]+)$/);
  if (hotelIdMatch && method === 'GET') {
    const id = hotelIdMatch[1];
    const hotel = MOCK_HOTELS.find((h) => h.id === id);

    if (hotel) {
      return of(new HttpResponse({ status: 200, body: hotel })).pipe(delay(300));
    } else {
      return throwError(() => new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: `Hotel with ID ${id} not found.` },
        url
      })).pipe(delay(300));
    }
  }

  // Intercept Booking Creation
  if (url.endsWith('/hotels/book') && method === 'POST') {
    const body = request.body as any;
    const hotel = MOCK_HOTELS.find((h) => h.id === body.hotelId);

    if (!hotel) {
      return throwError(() => new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: `Hotel with ID ${body.hotelId} not found.` },
        url
      })).pipe(delay(300));
    }

    // Backend Validation checks
    const errors: Record<string, string> = {};
    if (!body.passengerName?.trim()) {
      errors['passengerName'] = 'Passenger Name is required.';
    }
    if (!body.documentType) {
      errors['documentType'] = 'Document Type is required.';
    }
    if (!body.documentNumber?.trim()) {
      errors['documentNumber'] = 'Document Number is required.';
    }

    // International rules validation
    if (hotel.country !== 'USA' && body.documentType && body.documentType !== 'Passport') {
      errors['documentType'] = 'Passport is required for international travel.';
    }

    // Return 422 on validation failures
    if (Object.keys(errors).length > 0) {
      return throwError(() => new HttpErrorResponse({
        status: 422,
        statusText: 'Unprocessable Entity',
        error: {
          message: 'Validation failed',
          errors
        },
        url
      })).pipe(delay(400));
    }

    const checkIn = new Date(body.checkInDate);
    const checkOut = new Date(body.checkOutDate);
    const diffTime = Math.max(1, checkOut.getTime() - checkIn.getTime());
    const nights = Math.ceil(diffTime / 86_400_000);
    const totalAmount = hotel.nightlyRate * (body.rooms || 1) * nights;

    const response: BookingResponse = {
      bookingId: 'bk_' + Math.random().toString(36).substring(2, 11),
      confirmationNumber: 'HS-' + Math.floor(100000 + Math.random() * 900000),
      hotelName: hotel.name,
      passengerName: body.passengerName,
      checkInDate: body.checkInDate,
      checkOutDate: body.checkOutDate,
      totalAmount,
      currency: hotel.currency,
      status: 'confirmed',
      provider: hotel.provider,
      roomType: hotel.roomType,
      refundable: hotel.refundable
    };

    storeBooking(response);

    return of(new HttpResponse({ status: 201, body: response })).pipe(delay(800));
  }

  // Pass through if not matched
  return next(request);
};
