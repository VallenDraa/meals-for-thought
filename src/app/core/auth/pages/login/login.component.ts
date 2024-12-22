import { Component } from '@angular/core';
import { AuthFormComponent } from '@/core/auth/components/auth-form/auth-form.component';

@Component({
  selector: 'app-login',
  imports: [AuthFormComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {}
