import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationPageComponent } from './confirmation-page.component';
import { BookingService } from '../../core/services/booking.service';
import { BookingFlowStore } from '../../core/services/booking-flow.store';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BookingResponse } from '../../core/models';

describe('ConfirmationPageComponent', () => {
  let component: ConfirmationPageComponent;
  let fixture: ComponentFixture<ConfirmationPageComponent>;
  let bookingServiceMock: any;
  let bookingStoreMock: any;
  let paramMapSubject: any;

  const mockBooking: BookingResponse = {
    bookingId: 'bk_123',
    confirmationNumber: 'HS-123456',
    hotelName: 'Grand Premier Plaza',
    passengerName: 'Jane Doe',
    checkInDate: '2026-06-15',
    checkOutDate: '2026-06-18',
    totalAmount: 900,
    currency: 'USD',
    status: 'confirmed',
    provider: 'PremierStays',
    roomType: 'Deluxe King Suite',
    refundable: true
  };

  beforeEach(async () => {
    bookingServiceMock = {
      getBookingByReference: vi.fn().mockReturnValue(of(mockBooking))
    };

    bookingStoreMock = {
      bookingResponse: vi.fn().mockReturnValue(null)
    };

    paramMapSubject = of(convertToParamMap({ reference: 'HS-123456' }));

    await TestBed.configureTestingModule({
      imports: [ConfirmationPageComponent],
      providers: [
        { provide: BookingService, useValue: bookingServiceMock },
        { provide: BookingFlowStore, useValue: bookingStoreMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: paramMapSubject
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationPageComponent);
    component = fixture.componentInstance;
  });

  it('should retrieve booking by reference parameter and render details', () => {
    fixture.detectChanges();

    expect(bookingServiceMock.getBookingByReference).toHaveBeenCalledWith('HS-123456');
    expect(component.booking()).toEqual(mockBooking);

    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check reference number
    expect(compiled.querySelector('.ref-number')?.textContent).toContain('HS-123456');
    
    // Check provider name
    expect(compiled.querySelector('.provider-tag')?.textContent?.trim()).toBe('PremierStays');

    // Check room type
    const roomType = compiled.querySelector('.details-section:nth-of-type(2) .info-row:nth-of-type(2) .value');
    expect(roomType?.textContent?.trim()).toBe('Deluxe King Suite');

    // Check cancellation policy
    expect(compiled.querySelector('.policy-badge')?.textContent?.trim()).toBe('Free Cancellation');
  });

  it('should fall back to booking store when no reference query parameter is present', () => {
    // Override route mock with empty param map
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ConfirmationPageComponent],
      providers: [
        { provide: BookingService, useValue: bookingServiceMock },
        { provide: BookingFlowStore, useValue: { bookingResponse: () => mockBooking } },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({}))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(bookingServiceMock.getBookingByReference).not.toHaveBeenCalled();
    expect(component.booking()).toEqual(mockBooking);
  });

  it('should display error message when booking is not found (404)', () => {
    bookingServiceMock.getBookingByReference.mockReturnValue(
      throwError(() => new Error('Booking with reference number HS-000000 not found.'))
    );

    fixture.detectChanges();

    expect(component.booking()).toBeNull();
    expect(component.errorMessage()).toBe('Booking with reference number HS-000000 not found.');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-panel h2')?.textContent).toContain('Retrieving Booking Failed');
  });
});
