import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, FormBuilder, FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { takeUntil } from "rxjs/operators";
import { UnsubscribeComponent } from "../../../base/assets/unsubscribe-component";
import { dirValidator } from "../../validators/dir.validator";

@Component({
  selector: "app-select-dir",
  templateUrl: "./select-dir.component.html",
  styleUrls: ["./select-dir.component.scss"],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectDirComponent), multi: true }],
})
export class SelectDirComponent extends UnsubscribeComponent implements OnInit, ControlValueAccessor {
  @Input() title = "";

  control: FormControl;

  disabled = false;

  private onChange: (value: string) => void;

  constructor(private formBuilder: FormBuilder) {
    super();

    this.control = this.formBuilder.control("", dirValidator);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {}

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    if (typeof obj === "string") {
      this.control.setValue(obj, { emitEvent: false });
    } else {
      this.control.setValue(obj, { emitEvent: false });
    }
  }

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files.length > 0) {
      this.control.setValue(input.files[0].path);
      this.control.markAsDirty();

      this.onChange(this.control.value);
    }
  }

  ngOnInit(): void {
    this.control.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(value => {
      this.onChange(this.control.valid ? value : null);
    });
  }
}
