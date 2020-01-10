import { AbstractControl, ValidationErrors } from "@angular/forms";
import * as fs from "fs";

export function dirValidator(control: AbstractControl): ValidationErrors | null {
  const path = typeof control.value === "string" ? control.value : "";
  if (!fs.existsSync(path)) {
    return {
      file: {
        message: "Директория по данному пути не существует"
      }
    }
  }
  if (!fs.statSync(path).isDirectory()) {
    return {
      file: {
        message: "Заданный путь ведет не к директории"
      }
    }
  }
  return null;
}
