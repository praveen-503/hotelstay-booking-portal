import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'search'
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./features/search/search-page.component').then((m) => m.SearchPageComponent)
      },
      {
        path: 'results',
        loadComponent: () =>
          import('./features/results/results-page.component').then((m) => m.ResultsPageComponent)
      },
      {
        path: 'booking/:hotelId',
        loadComponent: () =>
          import('./features/booking/booking-page.component').then((m) => m.BookingPageComponent)
      },
      {
        path: 'confirmation',
        loadComponent: () =>
          import('./features/confirmation/confirmation-page.component').then(
            (m) => m.ConfirmationPageComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'search'
  }
];
