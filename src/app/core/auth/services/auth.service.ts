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
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private jwtService = inject(JwtService);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);

  login(data: LoginModel) {
    return this.http.post<LoginResponseModel>('/login', data).pipe(
      tap(({ user, token }) => {
        this.jwtService.saveToken(token);
        this.currentUserSubject.next(user);
      })
    );
  }

  register(data: RegisterModel) {
    return this.http.post<MessageApiResponse>('/register', data);
  }

  logout() {
    this.jwtService.destroyToken();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  loadCurrentUser() {
    const token = this.jwtService.getToken();

    return token
      ? this.http.get<MeResponseModel>('/me').pipe(
          tap(({ user }) => {
            this.currentUserSubject.next(user);
          })
        )
      : null;
  }

  get currentUser() {
    return this.currentUserSubject.asObservable();
  }
}
