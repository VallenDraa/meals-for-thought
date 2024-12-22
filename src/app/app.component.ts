import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainComponent } from './core/layouts/main/main.component';
import { HeaderComponent } from './core/layouts/header/header.component';
import { FooterComponent } from './core/layouts/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainComponent, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'meals-for-thought';
}
