import { Component, inject, input, output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { strongPasswordValidator } from '@/shared/validators/strong-password.validator';
import { LoginModel } from '../../models/auth.model';

@Component({
  selector: 'app-auth-form',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './auth-form.component.html',
})
export class AuthFormComponent {
  formTitle = input<string>('');
  formDescription = input<string>('');
  submitButtonLabel = input<string>('');
  redirectLinkLabel = input<string>('');
  redirectLink = input<string>('');

  formSubmit = output<LoginModel>();

  private _snackBar = inject(MatSnackBar);
  formBuilder = inject(FormBuilder);
  authForm = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(1)]],
    password: ['', [Validators.required, strongPasswordValidator]],
  });

  handleSubmit() {
    const { password, username } = this.authForm.value;

    if (!password) {
      this._snackBar.open('Password is required.', 'Close', {
        duration: 3000,
      });

      return;
    }

    if (!username) {
      this._snackBar.open('Username is required.', 'Close', {
        duration: 3000,
      });

      return;
    }

    this.formSubmit.emit({ username, password });
  }
}
