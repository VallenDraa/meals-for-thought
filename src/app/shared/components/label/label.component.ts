import { Component, input } from '@angular/core';

@Component({
  selector: 'app-label',
  imports: [],
  template: `
    <label
      [attr.for]="for || null"
      class="text-sm font-light leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      <ng-content />

      @if (isRequired()) {
      <span class="text-red-500 text-sm pl-0.5">*</span>
      }
    </label>
  `,
})
export class LabelComponent {
  isRequired = input(false);
  for = input('');
}
