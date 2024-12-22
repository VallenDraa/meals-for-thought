import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-input',
  template: `
    <input
      [type]="type()"
      [value]="value()"
      (keyup)="onKeyUp($event)"
      [placeholder]="placeholder()"
      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
    />
  `,
})
export class InputComponent {
  type = input('text');
  value = input('');
  placeholder = input('');
  keyUp = output<KeyboardEvent>();

  onKeyUp(event: KeyboardEvent): void {
    this.keyUp.emit(event);
  }
}
