import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, finalize, switchMap, tap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HotelCardComponent } from '../../shared/components/hotel-card/hotel-card.component';
import { StatusBannerComponent } from '../../shared/components/status-banner/status-banner.component';
import { HotelResult, SearchRequest } from '../../core/models';
import { BookingFlowStore } from '../../core/services/booking-flow.store';
import { HotelSearchService } from '../../core/services/hotel-search.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-results-page',
  imports: [HotelCardComponent, StatusBannerComponent, RouterLink, MatProgressSpinnerModule],
  templateUrl: './results-page.component.html',
  styleUrl: './results-page.component.scss'
})
export class ResultsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hotelSearchService = inject(HotelSearchService);
  private readonly bookingFlowStore = inject(BookingFlowStore);
  private readonly toastService = inject(ToastService);

  readonly hotels = signal<readonly HotelResult[]>([]);
  readonly searchRequest = signal<SearchRequest | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly sortBy = signal<'price-asc' | 'price-desc' | null>(null);

  readonly sortedHotels = computed(() => {
    const list = [...this.hotels()];
    const sort = this.sortBy();
    const search = this.searchRequest();

    if (!search || !sort) {
      return list;
    }

    const diffTime = new Date(search.checkOutDate).getTime() - new Date(search.checkInDate).getTime();
    const nights = Math.max(1, Math.ceil(diffTime / 86_400_000));
    const rooms = search.rooms || 1;

    const getTotalPrice = (hotel: HotelResult) => hotel.nightlyRate * rooms * nights;

    if (sort === 'price-asc') {
      return list.sort((a, b) => getTotalPrice(a) - getTotalPrice(b));
    } else if (sort === 'price-desc') {
      return list.sort((a, b) => getTotalPrice(b) - getTotalPrice(a));
    }

    return list;
  });

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.errorMessage.set(null);
          this.toastService.info('Searching for available stays...', 1500);
        }),
        switchMap((params) => {
          const request = this.createSearchRequest(params);

          if (request === null) {
            this.isLoading.set(false);
            this.errorMessage.set('Start with a hotel search to see available stays.');
            return EMPTY;
          }

          this.searchRequest.set(request);
          this.bookingFlowStore.setSearch(request);

          return this.hotelSearchService.searchHotels(request).pipe(
            tap((hotels) => {
              if (hotels.length > 0) {
                this.toastService.success(`Found ${hotels.length} hotels in ${request.destination}!`);
              } else {
                this.toastService.info(`No hotels found in ${request.destination}.`);
              }
            }),
            catchError((error: unknown) => {
              this.hotels.set([]);
              const errMsg = error instanceof Error ? error.message : 'Unable to load hotels.';
              this.errorMessage.set(errMsg);
              this.toastService.error(errMsg);
              return EMPTY;
            }),
            finalize(() => this.isLoading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((hotels) => this.hotels.set(hotels));
  }

  setSortBy(sort: 'price-asc' | 'price-desc' | null): void {
    this.sortBy.set(sort);
  }

  selectHotel(hotel: HotelResult): void {
    this.bookingFlowStore.setHotel(hotel);
    void this.router.navigate(['/booking', hotel.id]);
  }

  private createSearchRequest(params: ParamMap): SearchRequest | null {
    const destination = params.get('destination');
    const checkInDate = params.get('checkInDate');
    const checkOutDate = params.get('checkOutDate');

    if (!destination || !checkInDate || !checkOutDate) {
      return null;
    }

    return {
      destination,
      checkInDate,
      checkOutDate,
      guests: Number(params.get('guests') ?? 1),
      rooms: Number(params.get('rooms') ?? 1)
    };
  }
}
