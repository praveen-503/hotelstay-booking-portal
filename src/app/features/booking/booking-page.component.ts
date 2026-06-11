import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { BookingRequest, HotelResult } from '../../core/models';
import { BookingService } from '../../core/services/booking.service';
import { BookingFlowStore } from '../../core/services/booking-flow.store';
import { HotelSearchService } from '../../core/services/hotel-search.service';
import { StatusBannerComponent } from '../../shared/components/status-banner/status-banner.component';

@Component({
  selector: 'app-booking-page',
  imports: [CurrencyPipe, ReactiveFormsModule, StatusBannerComponent],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.scss'
})
export class BookingPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly bookingService = inject(BookingService);
  private readonly hotelSearchService = inject(HotelSearchService);
  private readonly bookingFlowStore = inject(BookingFlowStore);

  readonly hotel = signal<HotelResult | null>(this.bookingFlowStore.selectedHotel());
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedSearch = this.bookingFlowStore.selectedSearch;
  readonly estimatedTotal = computed(() => {
    const selectedHotel = this.hotel();
    const search = this.selectedSearch();

    if (!selectedHotel || !search) {
      return 0;
    }

    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(search.checkOutDate).getTime() - new Date(search.checkInDate).getTime()) /
          86_400_000
      )
    );

    return selectedHotel.nightlyRate * search.rooms * nights;
  });

  readonly bookingForm = this.formBuilder.group({
    guestName: ['', [Validators.required, Validators.minLength(2)]],
    guestEmail: ['', [Validators.required, Validators.email]],
    guestPhone: ['', [Validators.required, Validators.minLength(8)]],
    specialRequests: ['']
  });

  ngOnInit(): void {
    const hotelId = this.route.snapshot.paramMap.get('hotelId');

    if (!this.hotel() && hotelId) {
      this.isLoading.set(true);
      this.hotelSearchService
        .getHotelById(hotelId)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (hotel) => {
            this.hotel.set(hotel);
            this.bookingFlowStore.setHotel(hotel);
          },
          error: (error: unknown) =>
            this.errorMessage.set(error instanceof Error ? error.message : 'Unable to load hotel.')
        });
    }
  }

  submitBooking(): void {
    const hotel = this.hotel();
    const search = this.selectedSearch();

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    if (!hotel || !search) {
      this.errorMessage.set('Booking details are incomplete. Please search for a hotel again.');
      return;
    }

    const formValue = this.bookingForm.getRawValue();
    const request: BookingRequest = {
      hotelId: hotel.id,
      checkInDate: search.checkInDate,
      checkOutDate: search.checkOutDate,
      guests: search.guests,
      rooms: search.rooms,
      guestName: formValue.guestName,
      guestEmail: formValue.guestEmail,
      guestPhone: formValue.guestPhone,
      specialRequests: formValue.specialRequests || undefined
    };

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.bookingService
      .createBooking(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.bookingFlowStore.setBookingResponse(response);
          void this.router.navigate(['/confirmation']);
        },
        error: (error: unknown) =>
          this.errorMessage.set(error instanceof Error ? error.message : 'Unable to create booking.')
      });
  }
}
