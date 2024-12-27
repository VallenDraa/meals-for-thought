import { Component } from '@angular/core';
import { AuthFormComponent } from '../../components/auth-form/auth-form.component';

@Component({
  selector: 'app-register',
  imports: [AuthFormComponent],
  templateUrl: './register.component.html',
  host: { class: 'grow flex flex-col justify-center md:justify-start' },
})
export class RegisterComponent {}
