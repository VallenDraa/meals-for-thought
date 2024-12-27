import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, first, map, of, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackbar = inject(MatSnackBar);

  return (
    authService.loadCurrentUser()?.pipe(
      first(),
      map((currentUser) => {
        if (currentUser) {
          return true;
        } else {
          snackbar.open('Oops, You need to login first to continue.', 'Close', {
            duration: 3000,
          });

          router.navigate(['/auth/login']);

          return false;
        }
      }),
      catchError((err) => {
        router.navigate(['/auth/login']);
        throw err;
      })
    ) ?? of(false)
  );
};
