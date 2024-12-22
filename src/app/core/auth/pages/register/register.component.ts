import { Component } from '@angular/core';
import { AuthFormComponent } from '../../components/auth-form/auth-form.component';

@Component({
  selector: 'app-register',
  imports: [AuthFormComponent],
  templateUrl: './register.component.html',
})
export class RegisterComponent {}
