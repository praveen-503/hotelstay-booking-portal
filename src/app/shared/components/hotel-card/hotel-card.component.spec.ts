import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HotelCardComponent } from './hotel-card.component';
import { HotelResult, SearchRequest } from '../../../core/models';

describe('HotelCardComponent', () => {
  let component: HotelCardComponent;
  let fixture: ComponentFixture<HotelCardComponent>;

  const mockHotel: HotelResult = {
    id: '1',
    name: 'Grand Premier Plaza',
    city: 'New York',
    country: 'USA',
    address: '768 5th Ave',
    rating: 4.8,
    stars: 5,
    nightlyRate: 200,
    currency: 'USD',
    imageUrl: 'https://example.com/image.jpg',
    amenities: ['Free WiFi', 'Pool'],
    availableRooms: 5,
    refundable: true,
    provider: 'PremierStays',
    roomType: 'Deluxe King Suite'
  };

  const mockSearch: SearchRequest = {
    destination: 'New York',
    checkInDate: '2026-06-15',
    checkOutDate: '2026-06-18', // 3 nights
    guests: 2,
    rooms: 2 // 2 rooms
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HotelCardComponent);
    component = fixture.componentInstance;
  });

  it('should compute correct number of nights and total price', () => {
    // Set inputs
    fixture.componentRef.setInput('hotel', mockHotel);
    fixture.componentRef.setInput('searchRequest', mockSearch);
    fixture.detectChanges();

    // 3 nights
    expect(component.nights()).toBe(3);
    // 200 (rate) * 2 (rooms) * 3 (nights) = 1200
    expect(component.totalPrice()).toBe(1200);
  });

  it('should render provider badge, room type, and stars correctly', () => {
    fixture.componentRef.setInput('hotel', mockHotel);
    fixture.componentRef.setInput('searchRequest', mockSearch);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check provider badge
    const providerBadge = compiled.querySelector('.hotel-card__provider-badge');
    expect(providerBadge?.textContent?.trim()).toBe('PremierStays');
    
    // Check room type
    const roomType = compiled.querySelector('.room-type-value');
    expect(roomType?.textContent?.trim()).toBe('Deluxe King Suite');

    // Check stars rendering (should have 5 star elements)
    const stars = compiled.querySelectorAll('.star');
    expect(stars.length).toBe(5);
  });

  it('should emit selectHotel when book button is clicked', () => {
    fixture.componentRef.setInput('hotel', mockHotel);
    fixture.componentRef.setInput('searchRequest', mockSearch);
    fixture.detectChanges();

    let emittedHotel: HotelResult | undefined;
    component.selectHotel.subscribe((h) => {
      emittedHotel = h;
    });

    const button = fixture.nativeElement.querySelector('.hotel-card__book-btn') as HTMLButtonElement;
    button.click();

    expect(emittedHotel).toBe(mockHotel);
  });
});
