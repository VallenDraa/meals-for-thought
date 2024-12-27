import { Component, inject } from '@angular/core';
import { AuthFormComponent } from '@/core/auth/components/auth-form/auth-form.component';
import { AuthService } from '../../services/auth.service';
import { LoginModel } from '../../models/auth.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [AuthFormComponent],
  templateUrl: './login.component.html',
  host: { class: 'grow flex flex-col justify-center md:justify-start' },
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  private snackbar = inject(MatSnackBar);

  handleLogin(data: LoginModel) {
    this.authService.login(data).subscribe((data) => {
      this.snackbar.open('Login successfully.', 'Close', {
        duration: 3000,
      });

      this.router.navigate(['/']);
    });
  }
}
