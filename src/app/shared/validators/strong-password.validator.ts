import { AbstractControl, ValidationErrors } from '@angular/forms';

export function strongPasswordValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value: string = control.value || '';

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /[0-9]/.test(value);
  const hasSymbol = /[\W_]/.test(value);
  const hasMinEightCharacters = value.length >= 8;

  const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSymbol;

  return !passwordValid
    ? {
        strongPassword: {
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasSymbol,
          hasMinEightCharacters,
        },
      }
    : null;
}
