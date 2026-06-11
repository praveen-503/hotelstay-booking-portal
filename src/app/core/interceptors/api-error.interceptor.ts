import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      const message =
        error instanceof HttpErrorResponse
          ? error.error?.message ?? error.message
          : 'An unexpected error occurred.';

      return throwError(() => new Error(message));
    })
  );
