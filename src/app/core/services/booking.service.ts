import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BookingRequest, BookingResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.baseUrl}/hotels/book`, request);
  }

  getBookingByReference(reference: string): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.baseUrl}/hotels/booking/${reference}`);
  }
}
