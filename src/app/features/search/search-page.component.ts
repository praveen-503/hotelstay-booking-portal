import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { BookingFlowStore } from '../../core/services/booking-flow.store';
import { SearchRequest } from '../../core/models';

@Component({
  selector: 'app-search-page',
  imports: [ReactiveFormsModule],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly bookingFlowStore = inject(BookingFlowStore);

  readonly searchForm = this.formBuilder.group({
    destination: ['', [Validators.required, Validators.minLength(2)]],
    checkInDate: ['', Validators.required],
    checkOutDate: ['', Validators.required],
    guests: [2, [Validators.required, Validators.min(1)]],
    rooms: [1, [Validators.required, Validators.min(1)]]
  });

  submitSearch(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const request: SearchRequest = this.searchForm.getRawValue();
    this.bookingFlowStore.setSearch(request);

    void this.router.navigate(['/results'], {
      queryParams: request
    });
  }
}
