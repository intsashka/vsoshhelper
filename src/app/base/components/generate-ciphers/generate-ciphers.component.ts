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
    return this.schoolSubject ? moment(this.schoolSubject.dateEvent).format("D MMMM YYYY года").toLowerCase() : "";
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

    const numberCiphers = new Map<string, number>();
    Object.keys(this.schoolSubject.cipher).forEach(classNumber => {
      const cipher = this.schoolSubject.cipher[classNumber];
      const number = numberCiphers.get(cipher) || 0;
      const numberCipher = Number.parseInt(this.form.get(classNumber).value, 10);
      if (Number.isInteger(numberCipher)) {
        numberCiphers.set(cipher, number + numberCipher);
      }
    });

    let data: string[] = [];
    numberCiphers.forEach((numberCipher, cipher) => {
      const numbers = this.getRange(numberCipher, [13]);
      data = data.concat(numbers.map(item => `${cipher}-${this.numberToString(item)}`));
    });
    if (data.length % 2 !== 0) {
      data.push("Я лишняя!!!");
    }

    const title = this.schoolSubject.names.dative.toLowerCase();
    const date = this.formattedDataEvent;
    const place = this.schoolSubject.placeEvent;

    let templatePages: string[] = [];
    for (let i = 0; i < data.length; i += 2) {
      templatePages.push(`\\TwoEncryption{${title}}{${date}}{${place}}{${data[i]}}{${data[i + 1]}}`);
    }
    const templateDocument = templatePages.join("\n");

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
    return !!this.schoolSubject && !!this.settingsGenerate;
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      "7": "",
      "8": "",
      "9": "",
      "10": "",
      "11": "",
    });
  }

  private getRange(count: number, exclude: number[]): number[] {
    const range: number[] = [];
    for (let i = 1; range.length !== count; ++i) {
      if (!exclude.includes(i)) {
        range.push(i);
      }
    }
    return range;
  }

  private numberToString(number: number): string {
    return `${Math.floor(number / 10)}${Math.floor(number % 10)}`;
  }
}
