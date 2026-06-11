import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BookingFlowStore } from '../../core/services/booking-flow.store';
import { BookingService } from '../../core/services/booking.service';
import { BookingResponse } from '../../core/models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-confirmation-page',
  imports: [CurrencyPipe, RouterLink, MatProgressSpinnerModule],
  templateUrl: './confirmation-page.component.html',
  styleUrl: './confirmation-page.component.scss'
})
export class ConfirmationPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bookingService = inject(BookingService);
  private readonly bookingFlowStore = inject(BookingFlowStore);
  private readonly toastService = inject(ToastService);

  readonly booking = signal<BookingResponse | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const reference = params.get('reference');
      const storeBooking = this.bookingFlowStore.bookingResponse();

      if (reference) {
        // If it's already in the store and matches, use it to avoid HTTP request
        if (storeBooking && storeBooking.confirmationNumber === reference) {
          this.booking.set(storeBooking);
          return;
        }

        // Fetch from API to support page refresh
        this.isLoading.set(true);
        this.errorMessage.set(null);
        this.toastService.info('Retrieving booking details...', 1500);
        this.bookingService
          .getBookingByReference(reference)
          .pipe(finalize(() => this.isLoading.set(false)))
          .subscribe({
            next: (data) => {
              this.booking.set(data);
              this.toastService.success('Booking details loaded!');
            },
            error: (err: unknown) => {
              const errMsg = err instanceof Error ? err.message : 'Unable to retrieve booking details.';
              this.errorMessage.set(errMsg);
              this.toastService.error(errMsg);
            }
          });
      } else if (storeBooking) {
        this.booking.set(storeBooking);
      } else {
        this.booking.set(null);
      }
    });
  }
}
