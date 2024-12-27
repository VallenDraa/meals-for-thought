import { TestBed } from '@angular/core/testing';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import {
  LoginModel,
  LoginResponseModel,
  MeResponseModel,
  RegisterModel,
} from '../models/auth.model';
import { MessageApiResponse } from '@/core/model/api-response.model';
import { provideHttpClient } from '@angular/common/http';
import { User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let jwtServiceSpy: jasmine.SpyObj<JwtService>;

  beforeEach(() => {
    jwtServiceSpy = jasmine.createSpyObj('JwtService', [
      'getToken',
      'saveToken',
      'destroyToken',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: JwtService, useValue: jwtServiceSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a login POST request and return a login response', () => {
    const mockData: LoginModel = { username: 'user', password: 'pw123' };
    const mockResponse: LoginResponseModel = {
      token: 'token',
      user: { id: 1, username: 'user' },
    };

    service.login(mockData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush(mockResponse);
  });

  it('should send a register POST request and return a success message', () => {
    const mockData: RegisterModel = { username: 'New Auth', password: 'pw123' };
    const mockResponse: MessageApiResponse = {
      message: 'Registration successful',
    };

    service.register(mockData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush(mockResponse);
  });

  it('should destroy the token and navigate to login when logging out', () => {
    service.logout();

    expect(jwtServiceSpy.destroyToken).toHaveBeenCalled();
  });

  describe('loadCurrentUser', () => {
    it("should return the user's information when token is given", () => {
      const mockToken = 'test-token';
      const mockResponse: MeResponseModel = {
        user: { id: 1, username: 'user' },
      };

      jwtServiceSpy.getToken.and.returnValue(mockToken);

      service.loadCurrentUser()?.subscribe(() => {
        expect(jwtServiceSpy.getToken).toHaveBeenCalled();
        expect(service['currentUser$']).toBeTruthy();
      });

      const req = httpMock.expectOne('/me');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return null when token is not given', () => {
      jwtServiceSpy.getToken.and.returnValue(null);

      const result = service.loadCurrentUser();
      expect(result).toBeNull();
      expect(jwtServiceSpy.getToken).toHaveBeenCalled();
    });
  });

  describe('currentUser', () => {
    it('should have default value of null', () => {
      service.currentUser$.subscribe((user) => {
        expect(user).toBeNull();
      });
    });

    it('should update the value when a user logs in', () => {
      const mockUser: User = { id: 1, username: 'user' };
      const mockData: LoginModel = { username: 'user', password: 'pw123' };
      const mockResponse: LoginResponseModel = {
        token: 'token',
        user: mockUser,
      };

      service.login(mockData).subscribe();

      const req = httpMock.expectOne('/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      service.currentUser$.subscribe((user) => {
        expect(user).toEqual(mockUser);
      });
    });
  });
});
