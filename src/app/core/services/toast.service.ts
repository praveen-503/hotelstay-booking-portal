import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, duration = 3500): void {
    this.snackBar.open(message, 'Dismiss', {
      duration,
      panelClass: ['toast-success'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  error(message: string, duration = 4500): void {
    this.snackBar.open(message, 'Dismiss', {
      duration,
      panelClass: ['toast-error'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  info(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Dismiss', {
      duration,
      panelClass: ['toast-info'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
