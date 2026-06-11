import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import { HotelResult, SearchRequest } from '../../../core/models';

@Component({
  selector: 'app-hotel-card',
  imports: [CurrencyPipe],
  templateUrl: './hotel-card.component.html',
  styleUrl: './hotel-card.component.scss'
})
export class HotelCardComponent {
  readonly hotel = input.required<HotelResult>();
  readonly searchRequest = input<SearchRequest | null>(null);
  readonly selectHotel = output<HotelResult>();

  readonly nights = computed(() => {
    const search = this.searchRequest();
    if (!search) return 1;
    const diffTime = new Date(search.checkOutDate).getTime() - new Date(search.checkInDate).getTime();
    return Math.max(1, Math.ceil(diffTime / 86_400_000));
  });

  readonly totalPrice = computed(() => {
    const search = this.searchRequest();
    const rooms = search?.rooms ?? 1;
    return this.hotel().nightlyRate * rooms * this.nights();
  });

  readonly starArray = computed(() => {
    const stars = this.hotel().stars;
    return stars ? Array.from({ length: stars }) : [];
  });
}
