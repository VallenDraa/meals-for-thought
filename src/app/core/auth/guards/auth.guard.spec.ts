import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { MeResponseModel } from '../models/auth.model';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/protected' } as RouterStateSnapshot;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['loadCurrentUser']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true when authenticated', (done) => {
    const mockUser = { id: 1, username: 'Test User' } as User;

    authService.loadCurrentUser.and.returnValue(of({ user: mockUser }));

    const result$ = executeGuard(mockRoute, mockState) as Observable<boolean>;

    result$?.subscribe((result) => {
      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
      expect(snackBar.open).not.toHaveBeenCalled();
      done();
    });
  });

  it('should return false, show snackbar, and redirect user to login when unauthenticated', (done) => {
    authService.loadCurrentUser.and.returnValue(of(null));

    const result$ = executeGuard(mockRoute, mockState) as Observable<boolean>;

    result$?.subscribe((result) => {
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Oops, You need to login first to continue.',
        'Close',
        { duration: 3000 }
      );
      done();
    });
  });

  it('should handle errors and redirect to login', (done) => {
    authService.loadCurrentUser.and.returnValue(
      throwError(() => new Error('Test error'))
    );

    const result$ = executeGuard(mockRoute, mockState) as Observable<boolean>;

    result$?.subscribe({
      next: () => {
        fail('Guard should not return true when an error occurs.');
      },
      error: () => {
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
        done();
      },
    });
  });
});
