import { Component, OnInit } from "@angular/core";
import { SchoolSubject } from "../../assets/school-subjects";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { SettingsService } from "../../services/settings.service";
import { SchoolSubjectsService } from "../../services/school-subjects.service";
import { MakerPdfService } from "../../services/maker-pdf.service";
import { SettingsGenerate } from "../../assets/settings";
import { Observable } from "rxjs";
import { map, takeUntil, tap } from "rxjs/operators";
import { UnsubscribeComponent } from "../../assets/unsubscribe-component";
import * as moment from "moment";
import { NotificationService } from "../../services/notification.service";
import { LoggerService } from "@angular-ru/logger";
import { nonNegativeIntegerValidator } from "../../../shared/validators/non-negative-integer.validator";

const CouponsOnPage = 18;

@Component({
  selector: "app-generate-coupons",
  templateUrl: "./generate-coupons.component.html",
  styleUrls: ["./generate-coupons.component.scss"],
})
export class GenerateCouponsComponent extends UnsubscribeComponent implements OnInit {
  form: FormGroup;

  settingsGenerate: SettingsGenerate | null = null;
  schoolSubject: SchoolSubject | null = null;

  settingsGenerate$: Observable<SettingsGenerate | null>;
  schoolSubjects$: Observable<SchoolSubject[]>;

  get numberCouponsOrderedControl(): FormControl {
    return this.form.get("numberCouponsOrdered") as FormControl;
  }

  get numberReplacementCouponsControl(): FormControl {
    return this.form.get("numberReplacementCoupons") as FormControl;
  }

  get totalNumberReplacementCouponsControl(): FormControl {
    return this.form.get("totalNumberReplacementCoupons") as FormControl;
  }

  constructor(
    private settingsService: SettingsService,
    private schoolSubjectsServiceService: SchoolSubjectsService,
    private makerPdfService: MakerPdfService,
    private loggerService: LoggerService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder
  ) {
    super();
    this.initForm();
  }

  ngOnInit(): void {
    this.settingsGenerate$ = this.settingsService.settings$.pipe(
      map(settings => (settings ? settings.generateCoupons : null)),
      tap(settings => (this.settingsGenerate = settings))
    );

    this.schoolSubjects$ = this.schoolSubjectsServiceService.schoolSubjects$;
  }

  generate(): void {
    if (!this.canGenerate()) {
      return;
    }

    const settings = this.settingsService.settings;
    settings.generateCoupons = this.settingsGenerate;
    this.settingsService.saveSettings(settings);

    const numberCouponsOrdered = Number.parseInt(this.numberCouponsOrderedControl.value, 10);
    const totalNumberReplacementCoupons = Number.parseInt(this.totalNumberReplacementCouponsControl.value, 10);
    const numberPage = Math.ceil((numberCouponsOrdered + totalNumberReplacementCoupons) / CouponsOnPage);

    const footer = `Заказанных: ${numberCouponsOrdered}. Запасных: ${totalNumberReplacementCoupons}.`;
    const dateEvent = moment(this.schoolSubject.dateEvent).format("DD.MM.YYYY");
    const page = "\\VoucherTable{" + dateEvent + "}\n";

    const templateValues = new Map([
      ["%%{{template_footer}}", footer],
      ["%%{{template_document}}", page.repeat(numberPage)],
    ]);

    this.makerPdfService
      .make_pdf(this.settingsGenerate, templateValues)
      .then(() => {
        this.loggerService.info("Taлоны сгенерированы", this.settingsGenerate, templateValues);
        this.notificationService.showSuccess("Талоны сгенерированы.");
      })
      .catch(error => {
        this.loggerService.error("При генерации талонов возникла ошибка:", error);
        this.notificationService.showError("При генерации талонов возникла ошибка.");
      });
  }

  canGenerate(): boolean {
    return this.form.valid && !!this.settingsGenerate && !!this.schoolSubject;
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      numberCouponsOrdered: [0, nonNegativeIntegerValidator],
      numberReplacementCoupons: [0, nonNegativeIntegerValidator],
      totalNumberReplacementCoupons: [{ value: 0, disabled: true }],
    });

    this.form.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(value => {
      const numberCouponsOrdered = Number.parseInt(value.numberCouponsOrdered, 10);
      const numberReplacementCoupons = Number.parseInt(value.numberReplacementCoupons, 10);
      const totalNumberReplacementCoupons = this.computeTotalNumberReplacementCoupons(numberCouponsOrdered, numberReplacementCoupons);
      this.totalNumberReplacementCouponsControl.setValue(totalNumberReplacementCoupons, { emitEvent: false });
    });
  }

  private computeTotalNumberReplacementCoupons(numberCouponsOrdered: number, numberReplacementCoupons: number): number {
    const numberPage = Math.ceil((numberCouponsOrdered + numberReplacementCoupons) / CouponsOnPage);
    const total = numberPage * CouponsOnPage;
    return total - numberCouponsOrdered;
  }
}
