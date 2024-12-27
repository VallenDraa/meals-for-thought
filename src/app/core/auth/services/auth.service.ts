import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  LoginModel,
  LoginResponseModel,
  MeResponseModel,
  RegisterModel,
} from '../models/auth.model';
import { MessageApiResponse } from '@/core/model/api-response.model';
import { JwtService } from './jwt.service';
import { Observable, of, tap } from 'rxjs';
import { AuthStoreService } from '../stores/auth-store.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private jwtService = inject(JwtService);

  private authStore = inject(AuthStoreService);

  login(data: LoginModel) {
    return this.http.post<LoginResponseModel>('/login', data).pipe(
      tap(({ user, token }) => {
        this.jwtService.saveToken(token);
        this.authStore.setUser(user);
      })
    );
  }

  register(data: RegisterModel) {
    return this.http.post<MessageApiResponse>('/register', data);
  }

  logout() {
    this.jwtService.destroyToken();
    this.authStore.clearUser();
  }

  loadCurrentUser(): Observable<MeResponseModel | null> {
    const token = this.jwtService.getToken();

    return token
      ? this.http.get<MeResponseModel>('/me').pipe(
          tap(({ user }) => {
            this.authStore.setUser(user);
          })
        )
      : of(null);
  }

  get currentUser$() {
    return this.authStore.getUser();
  }
}
