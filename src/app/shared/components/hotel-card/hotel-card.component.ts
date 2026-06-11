import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { HotelResult } from '../../../core/models';

@Component({
  selector: 'app-hotel-card',
  imports: [CurrencyPipe],
  templateUrl: './hotel-card.component.html',
  styleUrl: './hotel-card.component.scss'
})
export class HotelCardComponent {
  readonly hotel = input.required<HotelResult>();
  readonly selectHotel = output<HotelResult>();
}
