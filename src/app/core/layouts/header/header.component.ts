import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NAV_MENU_CONSTANTS } from '@/shared/constants/menu.constant';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  navMenuLinks = NAV_MENU_CONSTANTS;
}
