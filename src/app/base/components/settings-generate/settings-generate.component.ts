import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { SettingsGenerate } from "../../assets/settings";
import { UnsubscribeComponent } from "../../assets/unsubscribe-component";
import { takeUntil } from "rxjs/operators";
import { notEmptyStringValidator } from "../../../shared/validators/not-empty-string.validator";

@Component({
  selector: "app-settings-generate",
  templateUrl: "./settings-generate.component.html",
  styleUrls: ["./settings-generate.component.scss"],
})
export class SettingsGenerateComponent extends UnsubscribeComponent {
  form: FormGroup;

  @Input() set settings(value: SettingsGenerate | null) {
    if (value) {
      this.form.setValue(value, { emitEvent: false });
    } else {
      const emptySettingsGenerate: SettingsGenerate = {
        pathToTemplate: "",
        pathToOutDir: "",
        filename: "",
      };
      this.form.setValue(emptySettingsGenerate, { emitEvent: false });
    }
  }

  @Output() changeSettings = new EventEmitter<SettingsGenerate>();

  get filenameControl(): FormControl {
    return this.form.get("filename") as FormControl;
  }

  constructor(private formBuilder: FormBuilder) {
    super();
    this.initForm();
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      pathToTemplate: ["", Validators.required],
      pathToOutDir: ["", Validators.required],
      filename: ["", notEmptyStringValidator],
    });

    this.form.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(value => {
      this.changeSettings.emit(this.form.valid ? value : null);
    });
  }
}
