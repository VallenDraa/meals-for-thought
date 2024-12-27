import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthStoreService {
  private userSubject = new BehaviorSubject<User | null>(null);

  // Observable for state changes
  user$: Observable<User | null> = this.userSubject.asObservable();

  // Set the user state
  setUser(user: User | null) {
    this.userSubject.next(user);
  }

  // Get the current user value
  getUser() {
    return this.user$;
  }

  // Clear the user state
  clearUser() {
    this.userSubject.next(null);
  }
}
