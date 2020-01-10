import { AbstractControl, ValidationErrors } from "@angular/forms";
import * as fs from "fs";

export function fileValidator(control: AbstractControl): ValidationErrors | null {
  const path = typeof control.value === "string" ? control.value : "";
  if (!fs.existsSync(path)) {
    return {
      file: {
        message: "Файл по данному пути не существует"
      }
    }
  }
  if (!fs.statSync(path).isFile()) {
    return {
      file: {
        message: "Заданный путь ведет не к файлу"
      }
    }
  }
  return null;
}
