import { AbstractControl, ValidationErrors } from "@angular/forms";

export function nonNegativeIntegerValidator(control: AbstractControl): ValidationErrors | null {
  const value = Number.parseInt(`${control.value}`, 10);
  if (!Number.isInteger(value)) {
    return {
      nonNegativeInteger: {
        message: "Введите корректное целое неотрицательное число",
      },
    };
  }
  if (value < 0) {
    return {
      nonNegativeInteger: {
        message: "Введите неотрицательное число",
      },
    };
  }
  return null;
}
