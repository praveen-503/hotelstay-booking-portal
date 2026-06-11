import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export class AppError extends Error {
  readonly status: number;
  readonly errors?: Record<string, string>;

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.errors = errors;
  }
}

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const message = error.error?.message ?? error.message ?? 'An unexpected error occurred.';
        const errors = error.error?.errors;
        return throwError(() => new AppError(message, error.status, errors));
      }
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      return throwError(() => new Error(message));
    })
  );
