# Implementation Plan - UI/UX Improvement with Angular Material

This plan outlines the enhancements to transform the HotelStay Booking Portal into a professional travel booking application. We will replace raw HTML inputs with Angular Material components, introduce a responsive layout, implement colored chips for cancellation policies, add distinctive badges for providers, improve validation feedback using `<mat-error>` to prevent layout shifts, and add missing "Back" navigation.

## User Review Required

> [!IMPORTANT]
> - **Angular Material Animations**: We will add `provideAnimationsAsync` to the `appConfig` providers in [app.config.ts](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/app/app.config.ts) to enable smooth UI transitions, dropdowns, and datepicker animations.
> - **Unified Date Picker**: We will replace the native browser date inputs with Angular Material's `MatDatepicker` component in the search page. Dates will be properly parsed to `YYYY-MM-DD` strings during submission to maintain backend compatibility.
> - **Validation Error Layouts**: By switching to `<mat-form-field>` with `<mat-error>`, validation errors will be placed in the field's reserved subscript block. This solves the vertical layout shifting issue and improves input focus retention.
> - **Cancellation Policy Chips**: We will replace current raw cancellation policy labels with Angular Material `<mat-chip-set>` and `<mat-chip>` styled with appropriate travel platform colors (soft green for refundable, soft red for non-refundable).

## Proposed Changes

---

### 1. Root Configuration & Dependencies

#### [MODIFY] [app.config.ts](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/app/app.config.ts)
- Import `provideAnimationsAsync` from `@angular/platform-browser/animations/async`.
- Add `provideAnimationsAsync()` to the providers array.

---

### 2. Search Page Redesign

#### [MODIFY] [search-page.component.ts](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/app/features/search/search-page.component.ts)
- Import Angular Material modules:
  - `MatFormFieldModule`
  - `MatInputModule`
  - `MatDatepickerModule`
  - `MatNativeDateModule`
  - `MatButtonModule`
  - `MatIconModule`
- In `submitSearch()`, safely format `checkInDate` and `checkOutDate` to `YYYY-MM-DD` string if they are `Date` objects before store update and router navigation.

#### [MODIFY] [search-page.component.html](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/app/features/search/search-page.component.html)
- Wrap inputs in `<mat-form-field appearance="outline">`.
- Use `<mat-label>` for descriptions.
- Use `matInput` for the text and number input fields.
- Integrate `<input matInput [matDatepicker]="checkInPicker" formControlName="checkInDate" />` and `<mat-datepicker-toggle matIconSuffix [for]="checkInPicker" />` with `<mat-datepicker #checkInPicker />`.
- Use standard `<mat-error>` to show required messages when fields are touched and invalid.
- Use `<button mat-flat-button color="primary" type="submit">` for the search CTA.

#### [MODIFY] [search-page.component.scss](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/app/features/search/search-page.component.scss)
- Style the hero section with professional gradients, typography, and hover effects.
- Adjust the layout of form fields inside `.search-form` using Grid so they align nicely in desktop, tablet, and mobile orientations.

---

### 3. Hotel Card & Results Component Updates

#### [MODIFY] [hotel-card.component.ts](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/app/shared/components/hotel-card/hotel-card.component.ts)
- Import Angular Material modules:
  - `MatCardModule`
  - `MatChipsModule`
  - `MatButtonModule`
  - `MatIconModule`

#### [MODIFY] [hotel-card.component.html](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/app/shared/components/hotel-card/hotel-card.component.html)
- Re-structure card wrapper to use `<mat-card>` instead of raw `<article>`.
- Use `<mat-chip-set>` and `<mat-chip>` for the cancellation policy:
  - Free Cancellation: soft green chip.
  - Non-refundable: soft red chip.
- Re-style provider badges with distinct travel badges featuring icons (e.g. `star` for PremierStays, `local_offer` for BudgetNests).
- Use `mat-flat-button` for "Book Stay" button with an arrow icon.

#### [MODIFY] [hotel-card.component.scss](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/app/shared/components/hotel-card/hotel-card.component.scss)
- Style the `mat-card` to match the professional travel platform aesthetic.
- Define custom chip override styles for `.policy-chip--refundable` and `.policy-chip--non-refundable`.

---

### 4. Booking Form Redesign

#### [MODIFY] [booking-page.component.ts](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/app/features/booking/booking-page.component.ts)
- Import Angular Material modules:
  - `MatFormFieldModule`
  - `MatInputModule`
  - `MatSelectModule`
  - `MatButtonModule`
  - `MatIconModule`

#### [MODIFY] [booking-page.component.html](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/app/features/booking/booking-page.component.html)
- Add "Back to Results" navigation link styled as a `mat-stroked-button` at the top.
- Convert fields into `<mat-form-field appearance="outline">`:
  - Passenger Name input.
  - Document Type dropdown using `<mat-select>` and `<mat-option>`.
  - Document Number input.
- Replace manual validation error text with `<mat-error>` tags for automatic alignment and focus safety.
- Update confirmation CTA to `mat-flat-button` color="primary".

#### [MODIFY] [booking-page.component.scss](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/app/features/booking/booking-page.component.scss)
- Align elements, remove layout shifts using reserved height configurations.
- Style the destination travel requirements notice box nicely.

---

### 5. Booking Confirmation Ticket Redesign

#### [MODIFY] [confirmation-page.component.ts](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/app/features/confirmation/confirmation-page.component.ts)
- Import Angular Material modules:
  - `MatCardModule`
  - `MatChipsModule`
  - `MatButtonModule`
  - `MatIconModule`

#### [MODIFY] [confirmation-page.component.html](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/app/features/confirmation/confirmation-page.component.html)
- Wrap confirmation details card in `<mat-card>`.
- Use `<mat-chip-set>` and `<mat-chip>` for the cancellation policy displaying free cancellation or non-refundable details.
- Use `<button mat-flat-button>` for the main navigation buttons.

---

### 6. Shell Layout, Loader, and Global Styling

#### [MODIFY] [styles.scss](file:///d:/Praveen_Github_Projects/hotelstay-booking-portal/src/styles.scss)
- Setup nice professional color themes, shadows, card margins, and custom typography variables.
- Add animation transitions for premium experience.

---

## Verification Plan

### Automated Tests
- Run `npm run test` to verify that existing test suites continue to pass successfully.
- Adjust any unit tests that test HTML structures directly to match the Material DOM (e.g. testing control validations and mock backend responses).

### Manual Verification
- Deploy locally and check UI pages using the browser subagent:
  - Search page (ensure Material datepickers function correctly).
  - Results page (confirm chips and badges render correctly).
  - Booking page (confirm that validation errors do not cause vertical layout shifts, and the "Back to Results" button is present).
  - Confirmation page (ensure ticket styling renders cleanly).
