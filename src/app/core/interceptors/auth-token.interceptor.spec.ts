import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import { authTokenInterceptor } from './auth-token.interceptor';
import { JwtService } from '../auth/services/jwt.service';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

describe('authTokenInterceptor', () => {
  let jwtServiceSpy: jasmine.SpyObj<JwtService>;

  let httpTesting: HttpTestingController;
  let httpClient: HttpClient;

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authTokenInterceptor(req, next));

  beforeEach(() => {
    jwtServiceSpy = jasmine.createSpyObj('JwtService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [
        { provide: JwtService, useValue: jwtServiceSpy },
        provideHttpClient(withInterceptors([interceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });
  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it("should add the Authorization header with the token if it's present", () => {
    const token = 'token';
    jwtServiceSpy.getToken.and.returnValue(token);

    httpClient.get('/test').subscribe();
    const req = httpTesting.expectOne('/test');

    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);

    req.flush({});
  });

  it('should not add the Authorization header if token is not present', () => {
    const token = null;
    jwtServiceSpy.getToken.and.returnValue(token);

    httpClient.get('/test').subscribe();
    const req = httpTesting.expectOne('/test');

    expect(req.request.headers.get('Authorization')).toBe(token);

    req.flush({});
  });
});
