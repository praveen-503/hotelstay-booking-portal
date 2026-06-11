import { Injectable, computed, signal } from '@angular/core';

import { BookingResponse, HotelResult, SearchRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class BookingFlowStore {
  private readonly selectedSearchSignal = signal<SearchRequest | null>(null);
  private readonly selectedHotelSignal = signal<HotelResult | null>(null);
  private readonly bookingResponseSignal = signal<BookingResponse | null>(null);

  readonly selectedSearch = this.selectedSearchSignal.asReadonly();
  readonly selectedHotel = this.selectedHotelSignal.asReadonly();
  readonly bookingResponse = this.bookingResponseSignal.asReadonly();
  readonly hasBookingContext = computed(
    () => this.selectedSearchSignal() !== null && this.selectedHotelSignal() !== null
  );

  setSearch(request: SearchRequest): void {
    this.selectedSearchSignal.set(request);
  }

  setHotel(hotel: HotelResult): void {
    this.selectedHotelSignal.set(hotel);
  }

  setBookingResponse(response: BookingResponse): void {
    this.bookingResponseSignal.set(response);
  }
}
