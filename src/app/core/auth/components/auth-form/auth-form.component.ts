import { Component, input } from '@angular/core';
import { LabelComponent } from '@/shared/components/label/label.component';
import { InputComponent } from '@/shared/components/input/input.component';
import { ButtonComponent } from '@/shared/components/button/button.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-form',
  imports: [LabelComponent, InputComponent, ButtonComponent, RouterLink],
  templateUrl: './auth-form.component.html',
})
export class AuthFormComponent {
  formTitle = input<string>('');
  formDescription = input<string>('');
  submitButtonLabel = input<string>('');
  redirectLinkLabel = input<string>('');
  redirectLink = input<string>('');
}
