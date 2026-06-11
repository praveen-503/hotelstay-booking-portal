import { HttpEvent, HttpResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { HotelResult, BookingResponse } from '../models';

const MOCK_HOTELS: readonly HotelResult[] = [
  {
    id: '1',
    name: 'Grand Premier Plaza',
    city: 'New York',
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
  }
];

export const mockBackendInterceptor: HttpInterceptorFn = (request, next) => {
  const { url, method, params } = request;

  // Intercept Search
  if (url.endsWith('/hotels/search') && method === 'GET') {
    const destination = params.get('destination')?.toLowerCase() || '';

    // Filter hotels by destination matching city or address
    const filteredHotels = MOCK_HOTELS.filter(
      (hotel) =>
        hotel.city.toLowerCase().includes(destination) ||
        hotel.address.toLowerCase().includes(destination) ||
        destination.includes(hotel.city.toLowerCase())
    );

    return of(new HttpResponse({ status: 200, body: filteredHotels })).pipe(delay(600));
  }

  // Intercept Get By ID
  const hotelIdMatch = url.match(/\/hotels\/([^/]+)$/);
  if (hotelIdMatch && method === 'GET') {
    const id = hotelIdMatch[1];
    const hotel = MOCK_HOTELS.find((h) => h.id === id);

    if (hotel) {
      return of(new HttpResponse({ status: 200, body: hotel })).pipe(delay(300));
    } else {
      return of(
        new HttpResponse({
          status: 404,
          body: { message: `Hotel with ID ${id} not found.` }
        })
      ).pipe(delay(300));
    }
  }

  // Intercept Booking Creation
  if (url.endsWith('/bookings') && method === 'POST') {
    const body = request.body as any;
    const hotel = MOCK_HOTELS.find((h) => h.id === body.hotelId);

    if (!hotel) {
      return of(
        new HttpResponse({
          status: 404,
          body: { message: `Hotel with ID ${body.hotelId} not found.` }
        })
      ).pipe(delay(300));
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
      guestName: body.guestName,
      checkInDate: body.checkInDate,
      checkOutDate: body.checkOutDate,
      totalAmount,
      currency: hotel.currency,
      status: 'confirmed'
    };

    return of(new HttpResponse({ status: 201, body: response })).pipe(delay(800));
  }

  // Pass through if not matched
  return next(request);
};
