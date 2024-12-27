import { NAV_MENU_CONSTANTS } from '@/shared/constants/menu.constant';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-footer',
  imports: [RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  navMenuLinks = NAV_MENU_CONSTANTS;
}
