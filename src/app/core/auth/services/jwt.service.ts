import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class JwtService {
  storage = inject(StorageService);

  getToken() {
    return this.storage.getItem('token');
  }

  saveToken(token: string) {
    this.storage.setItem('token', token);
  }

  destroyToken() {
    this.storage.removeItem('token');
  }
}
