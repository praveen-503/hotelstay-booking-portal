import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HotelResult, SearchRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class HotelSearchService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  searchHotels(request: SearchRequest): Observable<readonly HotelResult[]> {
    const params = new HttpParams()
      .set('destination', request.destination)
      .set('checkInDate', request.checkInDate)
      .set('checkOutDate', request.checkOutDate)
      .set('guests', request.guests)
      .set('rooms', request.rooms);

    return this.http.get<readonly HotelResult[]>(`${this.baseUrl}/hotels/search`, { params });
  }

  getHotelById(hotelId: string): Observable<HotelResult> {
    return this.http.get<HotelResult>(`${this.baseUrl}/hotels/${hotelId}`);
  }
}
