import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NAV_MENU_CONSTANTS } from '@/shared/constants/menu.constant';
import { AuthService } from '@/core/auth/services/auth.service';
import { Observable, map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { User } from '@/core/auth/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    AsyncPipe,
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  navMenuLinks = NAV_MENU_CONSTANTS;

  private authService = inject(AuthService);
  private currentUser$: Observable<User | null>;
  filteredMenuLinks$: Observable<
    { label: string; link: string; icon?: string }[]
  >;

  constructor() {
    this.currentUser$ = this.authService.currentUser$;

    this.filteredMenuLinks$ = this.currentUser$.pipe(
      map((user) => {
        return this.navMenuLinks.filter((menu) => {
          if (menu.link === '/auth/login') {
            return !user;
          } else if (menu.link === '/profile') {
            return !!user;
          } else {
            return true;
          }
        });
      })
    );
  }
}
