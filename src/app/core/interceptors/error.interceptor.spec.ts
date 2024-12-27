import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { errorInterceptor } from './error.interceptor';
import { HttpClient } from '@angular/common/http';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let snackbarSpy: jasmine.SpyObj<MatSnackBar>;

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => errorInterceptor(req, next));

  beforeEach(() => {
    snackbarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        { provide: MatSnackBar, useValue: snackbarSpy },
        provideHttpClient(withInterceptors([interceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should display a snackbar message when an error occurs', () => {
    const errorMessage = 'An error occurred';

    httpClient.get('/test').subscribe({
      error: () => {
        expect(snackbarSpy.open).toHaveBeenCalledWith(errorMessage, 'Close', {
          duration: 3000,
        });
      },
    });

    const req = httpTesting.expectOne('/test');
    req.flush(
      { message: errorMessage },
      { status: 500, statusText: 'Server Error' }
    );
  });
});
