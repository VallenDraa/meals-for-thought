import { TestBed } from '@angular/core/testing';
import {
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { apiInterceptor } from './api.interceptor';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/services/auth.service';

describe('apiInterceptor', () => {
  let originalApi: string;

  const baseUrl = 'http://localhost:3000';
  const endpoint = '/api/test';

  let httpTesting: HttpTestingController;
  let httpClient: HttpClient;

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => apiInterceptor(req, next));

  beforeAll(() => {
    originalApi = environment.api;
    environment.api = baseUrl;
  });
  afterAll(() => {
    environment.api = originalApi;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
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

  it('should return a new request with the complete API URL', () => {
    const expectedUrl = new URL(endpoint, baseUrl).toString();

    httpClient.get(endpoint).subscribe();

    const req = httpTesting.expectOne(expectedUrl);
    expect(req.request.url).toBe(expectedUrl);

    req.flush({});
  });
});
