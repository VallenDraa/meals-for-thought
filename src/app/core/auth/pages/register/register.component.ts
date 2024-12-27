import { Component, inject } from '@angular/core';
import { AuthFormComponent } from '../../components/auth-form/auth-form.component';
import { AuthService } from '../../services/auth.service';
import { RegisterModel } from '../../models/auth.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-register',
  imports: [AuthFormComponent],
  templateUrl: './register.component.html',
  host: { class: 'grow flex flex-col justify-center md:justify-start' },
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  private snackbar = inject(MatSnackBar);

  async handleRegister(data: RegisterModel) {
    this.authService.register(data).subscribe(() => {
      this.snackbar.open('Registered successfully.', 'Close', {
        duration: 3000,
      });
      this.router.navigate(['/auth/login']);
    });
  }
}
