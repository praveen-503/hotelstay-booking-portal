import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingPageComponent } from './booking-page.component';
import { BookingService } from '../../core/services/booking.service';
import { BookingFlowStore } from '../../core/services/booking-flow.store';
import { HotelSearchService } from '../../core/services/hotel-search.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HotelResult, SearchRequest } from '../../core/models';
import { AppError } from '../../core/interceptors/api-error.interceptor';
import { HttpErrorResponse } from '@angular/common/http';

describe('BookingPageComponent', () => {
  let component: BookingPageComponent;
  let fixture: ComponentFixture<BookingPageComponent>;
  let bookingServiceMock: any;
  let searchServiceMock: any;
  let bookingStoreMock: any;
  let queryParamsMock: any;

  const domesticHotel: HotelResult = {
    id: '1',
    name: 'Grand Premier Plaza',
    city: 'New York',
    country: 'USA',
    address: '768 5th Ave',
    rating: 4.8,
    stars: 5,
    nightlyRate: 200,
    currency: 'USD',
    imageUrl: '',
    amenities: [],
    availableRooms: 5,
    refundable: true,
    provider: 'PremierStays',
    roomType: 'Suite'
  };

  const internationalHotel: HotelResult = {
    id: '2',
    name: 'London Premier Tower',
    city: 'London',
    country: 'United Kingdom',
    address: '35 Tower Hill',
    rating: 4.8,
    stars: 5,
    nightlyRate: 180,
    currency: 'GBP',
    imageUrl: '',
    amenities: [],
    availableRooms: 6,
    refundable: true,
    provider: 'PremierStays',
    roomType: 'Double'
  };

  const mockSearch: SearchRequest = {
    destination: 'New York',
    checkInDate: '2026-06-15',
    checkOutDate: '2026-06-18',
    guests: 2,
    rooms: 1
  };

  beforeEach(async () => {
    bookingServiceMock = {
      createBooking: vi.fn().mockReturnValue(of({ bookingId: 'bk_123' }))
    };

    searchServiceMock = {
      getHotelById: vi.fn()
    };

    bookingStoreMock = {
      selectedHotel: vi.fn().mockReturnValue(domesticHotel),
      selectedSearch: vi.fn().mockReturnValue(mockSearch),
      setHotel: vi.fn(),
      setBookingResponse: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BookingPageComponent],
      providers: [
        { provide: BookingService, useValue: bookingServiceMock },
        { provide: HotelSearchService, useValue: searchServiceMock },
        { provide: BookingFlowStore, useValue: bookingStoreMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ hotelId: '1' }) }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with empty inputs and be invalid', () => {
    expect(component.bookingForm.valid).toBe(false);
    expect(component.bookingForm.get('passengerName')?.value).toBe('');
    expect(component.bookingForm.get('documentType')?.value).toBe('');
    expect(component.bookingForm.get('documentNumber')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const nameControl = component.bookingForm.get('passengerName');
    const docTypeControl = component.bookingForm.get('documentType');
    const docNumControl = component.bookingForm.get('documentNumber');

    nameControl?.setValue('');
    docTypeControl?.setValue('');
    docNumControl?.setValue('');

    expect(nameControl?.hasError('required')).toBe(true);
    expect(docTypeControl?.hasError('required')).toBe(true);
    expect(docNumControl?.hasError('required')).toBe(true);
  });

  it('should allow both Passport and National ID for domestic travel (USA)', () => {
    // Hotel is domestic (default in store)
    expect(component.isInternational()).toBe(false);

    const docTypeControl = component.bookingForm.get('documentType');

    docTypeControl?.setValue('NationalId');
    docTypeControl?.updateValueAndValidity();
    expect(docTypeControl?.valid).toBe(true);

    docTypeControl?.setValue('Passport');
    docTypeControl?.updateValueAndValidity();
    expect(docTypeControl?.valid).toBe(true);
  });

  it('should require Passport and reject National ID for international travel', () => {
    // Update store mock and signal
    bookingStoreMock.selectedHotel.mockReturnValue(internationalHotel);
    
    // Create new component to reload state
    fixture = TestBed.createComponent(BookingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isInternational()).toBe(true);

    const docTypeControl = component.bookingForm.get('documentType');

    // Test NationalId (should fail)
    docTypeControl?.setValue('NationalId');
    docTypeControl?.updateValueAndValidity();
    expect(docTypeControl?.valid).toBe(false);
    expect(docTypeControl?.hasError('internationalPassportRequired')).toBe(true);

    // Test Passport (should pass)
    docTypeControl?.setValue('Passport');
    docTypeControl?.updateValueAndValidity();
    expect(docTypeControl?.valid).toBe(true);
  });

  it('should map HTTP 422 server validation errors back to controls', () => {
    const serverErrors = {
      passengerName: 'Passenger Name is invalid.',
      documentNumber: 'Document Number is invalid.'
    };
    
    const appError = new AppError('Validation failed', 422, serverErrors);
    bookingServiceMock.createBooking.mockReturnValue(throwError(() => appError));

    // Fill valid form fields first to bypass client validation
    component.bookingForm.setValue({
      passengerName: 'John Doe',
      documentType: 'Passport',
      documentNumber: '12345'
    });

    component.submitBooking();
    fixture.detectChanges();

    const nameControl = component.bookingForm.get('passengerName');
    const docNumControl = component.bookingForm.get('documentNumber');

    expect(nameControl?.hasError('serverError')).toBe(true);
    expect(nameControl?.getError('serverError')).toBe('Passenger Name is invalid.');
    expect(docNumControl?.hasError('serverError')).toBe(true);
    expect(docNumControl?.getError('serverError')).toBe('Document Number is invalid.');
  });
});
