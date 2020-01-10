import { Component, OnInit } from "@angular/core";
import { SettingsService } from "../../services/settings.service";
import { MakerPdfService } from "../../services/maker-pdf.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { SchoolSubjectsService } from "../../services/school-subjects.service";
import { SchoolSubject } from "../../assets/school-subjects";
import * as moment from "moment";
import { Observable } from "rxjs";
import { SettingsGenerate } from "../../assets/settings";
import { map, tap } from "rxjs/operators";
import { LoggerService } from "@angular-ru/logger";
import { NotificationService } from "../../services/notification.service";
import { nonNegativeIntegerValidator } from "../../../shared/validators/non-negative-integer.validator";
import { generateCiphers } from "../../assets/template-values-generate";

@Component({
  selector: "app-generate-ciphers",
  templateUrl: "./generate-ciphers.component.html",
  styleUrls: ["./generate-ciphers.component.scss"],
})
export class GenerateCiphersComponent implements OnInit {
  form: FormGroup;

  settingsGenerate: SettingsGenerate | null = null;
  schoolSubject: SchoolSubject | null = null;

  settingsGenerate$: Observable<SettingsGenerate | null>;
  schoolSubjects$: Observable<SchoolSubject[]>;

  get ciphers(): string[] {
    return this.schoolSubject ? Object.keys(this.schoolSubject.cipher) : [];
  }

  get formattedDataEvent(): string {
    return this.schoolSubject
      ? moment(this.schoolSubject.dateEvent)
          .format("D MMMM YYYY года")
          .toLowerCase()
      : "";
  }

  get numberCiphersForClass(): { [7]?: number; [8]?: number; [9]?: number; [10]?: number; [11]?: number } {
    const result = {};
    Object.keys(this.form.value).forEach(classNumber => {
      result[classNumber] = Number.parseInt(this.form.value[classNumber], 10);
    });
    return result;
  }

  constructor(
    private settingsService: SettingsService,
    private schoolSubjectsServiceService: SchoolSubjectsService,
    private makerPdfService: MakerPdfService,
    private loggerService: LoggerService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.settingsGenerate$ = this.settingsService.settings$.pipe(
      map(settings => (settings ? settings.generateCiphers : null)),
      tap(settings => (this.settingsGenerate = settings))
    );

    this.schoolSubjects$ = this.schoolSubjectsServiceService.schoolSubjects$.pipe(
      map(subjects => {
        return subjects.filter(subject => Object.keys(subject.cipher).length > 0);
      })
    );
  }

  generate(): void {
    if (!this.canGenerate()) {
      return;
    }

    const settings = this.settingsService.settings;
    settings.generateCiphers = this.settingsGenerate;
    this.settingsService.saveSettings(settings);

    const templateDocument = generateCiphers(this.schoolSubject, this.numberCiphersForClass);
    const templateValues = new Map([["%%{{template_document}}", templateDocument]]);

    this.makerPdfService
      .make_pdf(this.settingsGenerate, templateValues)
      .then(() => {
        this.loggerService.info("Шифровки сгенерированы", this.settingsGenerate, templateValues);
        this.notificationService.showSuccess("Шифровки сгенерированы.");
      })
      .catch(error => {
        this.loggerService.error("При генерации шифровок возникла ошибка:", error);
        this.notificationService.showError("При генерации шифровок возникла ошибка.");
      });
  }

  canGenerate(): boolean {
    return this.form.valid && !!this.schoolSubject && !!this.settingsGenerate;
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      "7": [0, nonNegativeIntegerValidator],
      "8": [0, nonNegativeIntegerValidator],
      "9": [0, nonNegativeIntegerValidator],
      "10": [0, nonNegativeIntegerValidator],
      "11": [0, nonNegativeIntegerValidator],
    });
  }
}
