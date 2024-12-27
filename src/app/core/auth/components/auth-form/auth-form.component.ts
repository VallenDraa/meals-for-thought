import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Component, inject, input } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { strongPasswordValidator } from '@/shared/validators/strong-password.validator';

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

  formBuilder = inject(FormBuilder);

  authForm = this.formBuilder.nonNullable.group({
    username: this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(1),
    ]),
    password: this.formBuilder.control('', [
      Validators.required,
      strongPasswordValidator,
    ]),
  });

  handleSubmit() {
    console.log(this.authForm.value);
  }
}
