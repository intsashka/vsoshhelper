import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { SettingsGenerate } from "../../assets/settings";
import { UnsubscribeComponent } from "../../assets/unsubscribe-component";
import { takeUntil } from "rxjs/operators";
import * as path from "path";

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

  get pathToTemplateControl(): FormControl {
    return this.form.get("pathToTemplate") as FormControl;
  }

  get pathToOutDirControl(): FormControl {
    return this.form.get("pathToOutDir") as FormControl;
  }

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
      filename: ["", Validators.required],
    });

    this.form.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(value => {
      this.changeSettings.emit(this.form.valid ? value : null);
    });
  }

  selectTemplate(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files.length > 0) {
      this.pathToTemplateControl.setValue(input.files[0].path);
    }
  }

  selectDir(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files.length > 0) {
      this.pathToOutDirControl.setValue(path.dirname(input.files[0].path));
    }
  }
}
