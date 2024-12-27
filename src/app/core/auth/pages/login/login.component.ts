import { Component, inject } from '@angular/core';
import { AuthFormComponent } from '@/core/auth/components/auth-form/auth-form.component';
import { AuthService } from '../../services/auth.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  imports: [AuthFormComponent],
  templateUrl: './login.component.html',
  host: { class: 'grow flex flex-col justify-center md:justify-start' },
})
export class LoginComponent {
  authService = inject(AuthService);

  handleLogin() {
    this.authService
      .login({
        username: '',
        password: '',
      })
      .pipe(
        catchError((err) => {
          console.log(err);
          throw err;
        })
      );
  }
}
