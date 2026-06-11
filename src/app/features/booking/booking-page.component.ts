import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BookingRequest, HotelResult } from '../../core/models';
import { BookingService } from '../../core/services/booking.service';
import { BookingFlowStore } from '../../core/services/booking-flow.store';
import { HotelSearchService } from '../../core/services/hotel-search.service';
import { StatusBannerComponent } from '../../shared/components/status-banner/status-banner.component';
import { AppError } from '../../core/interceptors/api-error.interceptor';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-booking-page',
  imports: [CurrencyPipe, ReactiveFormsModule, StatusBannerComponent, MatProgressSpinnerModule],
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
  private readonly toastService = inject(ToastService);

  readonly hotel = signal<HotelResult | null>(this.bookingFlowStore.selectedHotel());
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedSearch = this.bookingFlowStore.selectedSearch;

  readonly isInternational = computed(() => {
    const hotel = this.hotel();
    return hotel ? hotel.country !== 'USA' : false;
  });

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
    passengerName: ['', [Validators.required, Validators.minLength(2)]],
    documentType: ['', [Validators.required, (control) => {
      if (this.isInternational() && control.value && control.value !== 'Passport') {
        return { internationalPassportRequired: true };
      }
      return null;
    }]],
    documentNumber: ['', [Validators.required]]
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
            this.bookingForm.get('documentType')?.updateValueAndValidity();
          },
          error: (error: unknown) =>
            this.errorMessage.set(error instanceof Error ? error.message : 'Unable to load hotel.')
        });
    } else {
      // Refresh form validation if hotel was already set in the store
      this.bookingForm.get('documentType')?.updateValueAndValidity();
    }

    // Subscribe to value changes of documentType to validate passport vs national ID
    this.bookingForm.get('documentType')?.valueChanges.subscribe(() => {
      this.errorMessage.set(null);
    });
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
      passengerName: formValue.passengerName,
      documentType: formValue.documentType as 'Passport' | 'NationalId',
      documentNumber: formValue.documentNumber
    };

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.toastService.info('Creating your booking reservation...', 2000);

    this.bookingService
      .createBooking(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.bookingFlowStore.setBookingResponse(response);
          this.toastService.success('Booking created successfully!');
          void this.router.navigate(['/confirmation'], {
            queryParams: { reference: response.confirmationNumber }
          });
        },
        error: (error: unknown) => {
          if (error instanceof AppError && error.status === 422) {
            this.errorMessage.set('Validation failed on server side.');
            this.toastService.error('Validation failed. Please correct the fields.');
            if (error.errors) {
              Object.entries(error.errors).forEach(([field, msg]) => {
                const control = this.bookingForm.get(field);
                if (control) {
                  control.setErrors({ serverError: msg });
                  control.markAsTouched();
                }
              });
            }
          } else {
            const errMsg = error instanceof Error ? error.message : 'Unable to create booking.';
            this.errorMessage.set(errMsg);
            this.toastService.error(errMsg);
          }
        }
      });
  }
}
