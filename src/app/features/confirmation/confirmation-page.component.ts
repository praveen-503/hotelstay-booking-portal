import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BookingFlowStore } from '../../core/services/booking-flow.store';

@Component({
  selector: 'app-confirmation-page',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './confirmation-page.component.html',
  styleUrl: './confirmation-page.component.scss'
})
export class ConfirmationPageComponent {
  private readonly bookingFlowStore = inject(BookingFlowStore);

  readonly booking = this.bookingFlowStore.bookingResponse;
}
