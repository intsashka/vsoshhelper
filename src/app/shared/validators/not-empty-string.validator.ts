import { AbstractControl, ValidationErrors } from "@angular/forms";

export function notEmptyStringValidator(control: AbstractControl): ValidationErrors | null {
  const value = typeof control.value === "string" ? control.value.trim() : "";
  if (value === "") {
    return {
      notEmptyString: {
        value: value,
      },
    };
  } else {
    return null;
  }
}
