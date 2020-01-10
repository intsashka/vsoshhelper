import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NotificationService } from "../../services/notification.service";
import { SettingsService } from "../../services/settings.service";
import { UnsubscribeComponent } from "../../assets/unsubscribe-component";
import { takeUntil } from "rxjs/operators";
import { trimForAllString } from "../../assets/functions";

@Component({
  selector: "app-main-settings",
  templateUrl: "./main-settings.component.html",
  styleUrls: ["./main-settings.component.scss"],
})
export class MainSettingsComponent extends UnsubscribeComponent {
  form: FormGroup;

  constructor(private notificationService: NotificationService, private settingsService: SettingsService, private formBuilder: FormBuilder) {
    super();
    this.initForm();
  }

  cancel(): void {
    const settings = this.settingsService.settings;
    if (this.form.dirty && settings) {
      this.form.patchValue(settings.main);
      this.form.markAsPristine();
    }
  }

  save(): void {
    const settings = this.settingsService.settings;
    if (this.form.dirty && settings) {
      settings.main = trimForAllString(this.form.value);
      this.settingsService.saveSettings(settings);
    }
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      pathToDatabaseSchoolSubjects: ["", Validators.required],
      commandGeneratePDF: ["", Validators.required],
    });

    this.settingsService.settings$.pipe(takeUntil(this.destroyed)).subscribe(settings => {
      this.form.patchValue(settings.main);
      this.form.markAsPristine();
    });
  }
}
