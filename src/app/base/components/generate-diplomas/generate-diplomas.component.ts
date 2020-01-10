import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { readStudentFromProtocol, StudentFromProtocol, TypeDiploma } from "../../assets/student-from-protocol";
import { FormBuilder, FormControl } from "@angular/forms";
import { SettingsGenerate } from "../../assets/settings";
import { SchoolSubject } from "../../assets/school-subjects";
import { Observable } from "rxjs";
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatCheckboxChange, MatTreeNestedDataSource } from "@angular/material";
import { SettingsService } from "../../services/settings.service";
import { SchoolSubjectsService } from "../../services/school-subjects.service";
import { MakerPdfService } from "../../services/maker-pdf.service";
import { LoggerService } from "@angular-ru/logger";
import { NotificationService } from "../../services/notification.service";
import { filter, map, tap } from "rxjs/operators";
import * as os from "os";
import { flatArray } from "../../assets/functions";
import * as moment from "moment";

const NAMES_OF_MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

class TreeNode<T = StudentFromProtocol | string> {
  checked: boolean;
  indeterminate: boolean;

  constructor(
    public value: T,
    public parent: TreeNode<StudentFromProtocol | string> | null = null,
    public children: TreeNode<StudentFromProtocol | string>[] = []
  ) {}

  updateParent(): void {
    this.checked = this.children.every(child => child.checked);
    if (!this.checked) {
      this.indeterminate = this.children.some(child => child.checked || child.indeterminate);
    } else {
      this.indeterminate = false;
    }
    if (this.parent) {
      this.parent.updateParent();
    }
  }
}

@Component({
  selector: "app-generate-diplomas",
  templateUrl: "./generate-diplomas.component.html",
  styleUrls: ["./generate-diplomas.component.scss"],
})
export class GenerateDiplomasComponent implements OnInit {
  pathToProtocolControl: FormControl;
  registrationNumberControl: FormControl;
  numberDiplomaControl: FormControl;

  settingsGenerate: SettingsGenerate | null = null;
  schoolSubject: SchoolSubject | null = null;

  settingsGenerate$: Observable<SettingsGenerate | null>;
  schoolSubjects$: Observable<SchoolSubject[]>;

  root: TreeNode<string> | null = null;

  treeControl = new NestedTreeControl<TreeNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TreeNode>();

  @ViewChild("forListPrizes", { static: true }) textareaForListPrizes: ElementRef<HTMLTextAreaElement>;
  @ViewChild("forPreview", { static: true }) textareaPreview: ElementRef<HTMLTextAreaElement>;

  constructor(
    private settingsService: SettingsService,
    private schoolSubjectsServiceService: SchoolSubjectsService,
    private makerPdfService: MakerPdfService,
    private loggerService: LoggerService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder
  ) {
    this.pathToProtocolControl = this.formBuilder.control("");
    this.registrationNumberControl = this.formBuilder.control("");
    this.numberDiplomaControl = this.formBuilder.control("");
  }

  ngOnInit(): void {
    this.settingsGenerate$ = this.settingsService.settings$.pipe(
      map(settings => (settings ? settings.generateDiplomas : null)),
      tap(settings => (this.settingsGenerate = settings))
    );

    this.schoolSubjects$ = this.schoolSubjectsServiceService.schoolSubjects$.pipe(
      map(subjects => {
        return subjects.filter(item => item.dateAward !== undefined);
      })
    );
  }

  load(): void {
    const data = readStudentFromProtocol(this.pathToProtocolControl.value);
    this.initRoot(data);
  }

  generate(): void {
    const settings = this.settingsService.settings;
    settings.generateDiplomas = this.settingsGenerate;
    this.settingsService.saveSettings(settings);

    const peoples = this.getPeoples(this.root);

    const numberDiploma = Number.parseInt(this.numberDiplomaControl.value, 10);
    const registrationNumber = Number.parseInt(this.registrationNumberControl.value, 10);

    const listOfPrizes = [];
    const previewWin = [];
    const previewPrewin = [];

    const subject = this.schoolSubject.names.dative.toLowerCase();

    const peoplesWinner = peoples.filter(peoples => peoples.diploma === TypeDiploma.Winner);
    const peoplesPrizewinner = peoples.filter(peoples => peoples.diploma === TypeDiploma.Prizewinner);
    const templateDocument1 = peoplesWinner
      .map((item, index) => {
        const fioSplit = item.fio.split(/\s+/);
        const fio0 = fioSplit[0] || "";
        const fio1 = fioSplit[1] || "";
        const fio2 = fioSplit.slice(2).join(" ") || "";

        const schoolSplit = (item.schoolFull + "\n" + item.municipality).split("\n");

        const date = moment(this.schoolSubject.dateAward);

        const diploma = `${item.diploma}`;
        const number = `${numberDiploma + index}`;
        const numberNorm = "0".repeat(6 - number.length) + number;
        const num = `24 ${diploma.toUpperCase().substring(0, 2)} РЭ ${numberNorm}`;

        const diplom = "\\Diplom" + "{arg}".repeat(16);
        const templateArg = [
          subject,
          fio0,
          fio1,
          fio2,
          item.classNumber.toString(10),
          schoolSplit[0] || "",
          schoolSplit[1] || "",
          schoolSplit[2] || "",
          schoolSplit[3] || "",
          schoolSplit[4] || "",
          date.format("DD"),
          NAMES_OF_MONTHS[this.schoolSubject.dateAward.getMonth()],
          date.format("YY"),
          this.schoolSubject.placeEvent,
          num,
          (registrationNumber + index).toString(),
        ];

        const itemPreview = `${fio0} ${fio1} (${item.classNumber} класс, ${item.school}, ${item.municipality})`;
        if (item.diploma === TypeDiploma.Winner) {
          previewWin.push(itemPreview);
        } else {
          previewPrewin.push(itemPreview);
        }

        listOfPrizes.push(
          [(registrationNumber + index).toString(), num, subject, item.fio, `${item.school}, ${item.municipality}, ${item.classNumber} класс`].join("\t")
        );
        return templateArg.reduce((str, item) => str.replace("arg", item), diplom);
      })
      .join(os.EOL);

    const templateDocument2 = peoplesPrizewinner
      .map((item, index) => {
        const fioSplit = item.fio.split(/\s+/);
        const fio0 = fioSplit[0] || "";
        const fio1 = fioSplit[1] || "";
        const fio2 = fioSplit.slice(2).join(" ") || "";

        const schoolSplit = (item.schoolFull + "\n" + item.municipality).split("\n");

        const date = moment(this.schoolSubject.dateAward);

        const diploma = `${item.diploma}`;
        const number = `${numberDiploma + index}`;
        const numberNorm = "0".repeat(6 - number.length) + number;
        const num = `24 ${diploma.toUpperCase().substring(0, 2)} РЭ ${numberNorm}`;

        const diplom = "\\Diplom" + "{arg}".repeat(16);
        const templateArg = [
          subject,
          fio0,
          fio1,
          fio2,
          item.classNumber.toString(10),
          schoolSplit[0] || "",
          schoolSplit[1] || "",
          schoolSplit[2] || "",
          schoolSplit[3] || "",
          schoolSplit[4] || "",
          date.format("DD"),
          NAMES_OF_MONTHS[this.schoolSubject.dateAward.getMonth()],
          date.format("YY"),
          this.schoolSubject.placeEvent,
          num,
          (registrationNumber + index).toString(),
        ];

        const itemPreview = `${fio0} ${fio1} (${item.classNumber} класс, ${item.school}, ${item.municipality})`;
        if (item.diploma === TypeDiploma.Winner) {
          previewWin.push(itemPreview);
        } else {
          previewPrewin.push(itemPreview);
        }

        listOfPrizes.push(
          [(registrationNumber + index).toString(), num, subject, item.fio, `${item.school}, ${item.municipality}, ${item.classNumber} класс`].join("\t")
        );
        return templateArg.reduce((str, item) => str.replace("arg", item), diplom);
      })
      .join(os.EOL);

    this.textareaForListPrizes.nativeElement.value = listOfPrizes.join("\n");

    let preview = "";
    if (previewWin.length > 0) {
      preview = preview + `Победителями олимпиады по ${subject} стали: ${previewWin.join(", ")}`;
    }

    if (previewPrewin.length > 0) {
      if (preview.length > 0) {
        preview = preview + "\n\n";
      }
      preview = preview + `Призёрами олимпиады по ${subject} стали: ${previewPrewin.join(", ")}`;
    }

    this.textareaPreview.nativeElement.value = preview;

    const templateValues1 = new Map([["%%{{template_document}}", templateDocument1]]);

    const settings1: SettingsGenerate = {
      pathToOutDir: this.settingsGenerate.pathToOutDir,
      filename: this.settingsGenerate.filename + " (победители)",
      pathToTemplate: this.settingsGenerate.pathToTemplate ,
    };

    this.makerPdfService
      .make_pdf(settings1, templateValues1)
      .then(() => {
        this.loggerService.info("Дипломы сгенерированы", this.settingsGenerate, templateValues1);
        this.notificationService.showSuccess("Дипломы сгенерированы.");
      })
      .catch(error => {
        this.loggerService.error("При генерации диппломов возникла ошибка:", error);
        this.notificationService.showError("При генерации дипломов возникла ошибка.");
      });

    const templateValues2 = new Map([["%%{{template_document}}", templateDocument2]]);
    const settings2: SettingsGenerate = {
      pathToOutDir: this.settingsGenerate.pathToOutDir,
      filename: this.settingsGenerate.filename + " (призёры)",
      pathToTemplate: this.settingsGenerate.pathToTemplate ,
    };
    this.makerPdfService
      .make_pdf(settings2, templateValues2)
      .then(() => {
        this.loggerService.info("Дипломы сгенерированы", this.settingsGenerate, templateValues2);
        this.notificationService.showSuccess("Дипломы сгенерированы.");
      })
      .catch(error => {
        this.loggerService.error("При генерации диппломов возникла ошибка:", error);
        this.notificationService.showError("При генерации дипломов возникла ошибка.");
      });
  }
  checkboxChange(event: MatCheckboxChange, node: TreeNode): void {
    node.checked = event.checked;
    node.indeterminate = false;

    if (node.parent) {
      node.parent.updateParent();
    }

    node.children.forEach(child => {
      child.checked = node.checked;
      node.indeterminate = false;
    });
  }

  selectFile(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files.length > 0) {
      this.pathToProtocolControl.setValue(target.files[0].path);
    }
  }

  hasChild(_: number, node: TreeNode): boolean {
    return node.children && node.children.length > 0;
  }

  getTitle(node: TreeNode): string {
    if (typeof node.value === "string") {
      return node.value;
    } else {
      const student = node.value as StudentFromProtocol;
      return `${student.fio} ${student.classNumber} класс ${student.municipality} ${student.school} ${student.diploma}`;
    }
  }

  private initRoot(data: Array<[string, StudentFromProtocol[]]>): void {
    this.root = new TreeNode<string>("");
    this.root.children = data.map(item => {
      const node = new TreeNode<string>(item[0], this.root);
      node.children = item[1].map(itemNode => {
        return new TreeNode(itemNode, node);
      });
      return node;
    });
    this.dataSource.data = this.root.children;
  }

  private getPeoples(node: TreeNode): StudentFromProtocol[] {
    if (node.checked || node.indeterminate) {
      if (typeof node.value === "object") {
        return [node.value];
      } else {
        return flatArray(node.children.map(child => this.getPeoples(child)));
      }
    } else {
      return [];
    }
  }
}
