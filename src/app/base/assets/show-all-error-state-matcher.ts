import { ErrorStateMatcher } from "@angular/material";
import { Injectable } from "@angular/core";
import { FormControl, FormGroupDirective, NgForm } from "@angular/forms";

@Injectable()
export class ShowAllErrorStateMatcher extends ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control && control.invalid;
  }
}
