import { TestBed } from '@angular/core/testing';

import { JwtService } from './jwt.service';
import { StorageService } from './storage.service';

describe('JwtService', () => {
  let service: JwtService;
  const mockStorageService = {
    getItem: jasmine.createSpy('getItem'),
    setItem: jasmine.createSpy('setItem'),
    removeItem: jasmine.createSpy('removeItem'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JwtService,
        { provide: StorageService, useValue: mockStorageService },
      ],
    });
    service = TestBed.inject(JwtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get token', () => {
    mockStorageService.getItem.and.returnValue('test-token');
    const token = service.getToken();

    expect(mockStorageService.getItem).toHaveBeenCalledWith('token');
    expect(token).toBe('test-token');
  });

  it('should save token', () => {
    service.saveToken('new-token');

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      'token',
      'new-token'
    );
  });

  it('should destroy token', () => {
    service.destroyToken();

    expect(mockStorageService.removeItem).toHaveBeenCalledWith('token');
  });
});
