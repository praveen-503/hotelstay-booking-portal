import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsPageComponent } from './results-page.component';
import { HotelSearchService } from '../../core/services/hotel-search.service';
import { BookingFlowStore } from '../../core/services/booking-flow.store';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HotelResult } from '../../core/models';

describe('ResultsPageComponent', () => {
  let component: ResultsPageComponent;
  let fixture: ComponentFixture<ResultsPageComponent>;
  let searchServiceMock: any;
  let bookingStoreMock: any;
  let queryParamsMock: any;

  const mockHotels: HotelResult[] = [
    {
      id: '1',
      name: 'Cheap Stay',
      city: 'New York',
      country: 'USA',
      address: '123 St',
      rating: 3.5,
      nightlyRate: 100,
      currency: 'USD',
      imageUrl: '',
      amenities: [],
      availableRooms: 5,
      refundable: false,
      provider: 'BudgetNests',
      roomType: 'Standard'
    },
    {
      id: '2',
      name: 'Expensive Stay',
      city: 'New York',
      country: 'USA',
      address: '456 St',
      rating: 4.8,
      nightlyRate: 300,
      currency: 'USD',
      imageUrl: '',
      amenities: [],
      availableRooms: 5,
      refundable: true,
      provider: 'PremierStays',
      roomType: 'Suite'
    }
  ];

  beforeEach(async () => {
    queryParamsMock = of(
      convertToParamMap({
        destination: 'New York',
        checkInDate: '2026-06-15',
        checkOutDate: '2026-06-16',
        guests: '2',
        rooms: '1'
      })
    );

    searchServiceMock = {
      searchHotels: vi.fn().mockReturnValue(of(mockHotels)),
      getHotelById: vi.fn()
    };

    bookingStoreMock = {
      setSearch: vi.fn(),
      setHotel: vi.fn(),
      selectedHotel: vi.fn().mockReturnValue(null),
      selectedSearch: vi.fn().mockReturnValue(null)
    };

    await TestBed.configureTestingModule({
      imports: [ResultsPageComponent],
      providers: [
        { provide: HotelSearchService, useValue: searchServiceMock },
        { provide: BookingFlowStore, useValue: bookingStoreMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamsMock,
            snapshot: { paramMap: convertToParamMap({}) }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load search results from route params and update signals', () => {
    expect(component.hotels().length).toBe(2);
    expect(component.searchRequest()).toEqual({
      destination: 'New York',
      checkInDate: '2026-06-15',
      checkOutDate: '2026-06-16',
      guests: 2,
      rooms: 1
    });
    expect(searchServiceMock.searchHotels).toHaveBeenCalled();
  });

  it('should sort hotels by total price ascending and descending', () => {
    // Default order (unsorted)
    expect(component.sortedHotels()[0].id).toBe('1');
    expect(component.sortedHotels()[1].id).toBe('2');

    // Sort descending
    component.setSortBy('price-desc');
    fixture.detectChanges();
    expect(component.sortedHotels()[0].id).toBe('2'); // Expensive first
    expect(component.sortedHotels()[1].id).toBe('1');

    // Sort ascending
    component.setSortBy('price-asc');
    fixture.detectChanges();
    expect(component.sortedHotels()[0].id).toBe('1'); // Cheap first
    expect(component.sortedHotels()[1].id).toBe('2');
  });

  it('should show empty state when there are no hotels matching the search', () => {
    searchServiceMock.searchHotels.mockReturnValue(of([]));
    
    // Re-trigger ngOnInit with mock params
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.hotels().length).toBe(0);
    const compiled = fixture.nativeElement as HTMLElement;
    const emptyStateText = compiled.querySelector('.empty-state h2');
    expect(emptyStateText?.textContent).toContain('No hotels available');
  });
});
