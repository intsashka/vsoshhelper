import { Component, OnInit } from "@angular/core";
import { SettingsGenerate } from "../../assets/settings";
import { SchoolSubject } from "../../assets/school-subjects";
import { from, Observable } from "rxjs";
import { SettingsService } from "../../services/settings.service";
import { SchoolSubjectsService } from "../../services/school-subjects.service";
import { MakerPdfService } from "../../services/maker-pdf.service";
import { LoggerService } from "@angular-ru/logger";
import { NotificationService } from "../../services/notification.service";
import { FormBuilder, FormControl } from "@angular/forms";
import { map, tap } from "rxjs/operators";
import { readStudentFromTotalList, StudentFromTotalList } from "../../assets/student-from-total-list";
import { MatCheckboxChange, MatTreeNestedDataSource } from "@angular/material";
import { NestedTreeControl } from "@angular/cdk/tree";
import { flatArray } from "../../assets/functions";
import * as os from "os";

class TreeNode<T = StudentFromTotalList | string> {
  checked: boolean;
  indeterminate: boolean;

  constructor(
    public value: T,
    public parent: TreeNode<StudentFromTotalList | string> | null = null,
    public children: TreeNode<StudentFromTotalList | string>[] = []
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
  selector: "app-generate-certificates",
  templateUrl: "./generate-certificates.component.html",
  styleUrls: ["./generate-certificates.component.scss"],
})
export class GenerateCertificatesComponent implements OnInit {
  pathToTotalListControl: FormControl;

  settingsGenerate: SettingsGenerate | null = null;
  schoolSubject: SchoolSubject | null = null;

  settingsGenerate$: Observable<SettingsGenerate | null>;
  schoolSubjects$: Observable<SchoolSubject[]>;

  root: TreeNode<string> | null = null;

  treeControl = new NestedTreeControl<TreeNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TreeNode>();

  constructor(
    private settingsService: SettingsService,
    private schoolSubjectsServiceService: SchoolSubjectsService,
    private makerPdfService: MakerPdfService,
    private loggerService: LoggerService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder
  ) {
    this.pathToTotalListControl = this.formBuilder.control("");
  }

  ngOnInit(): void {
    this.settingsGenerate$ = this.settingsService.settings$.pipe(
      map(settings => (settings ? settings.generateCertificates : null)),
      tap(settings => (this.settingsGenerate = settings))
    );

    this.schoolSubjects$ = this.schoolSubjectsServiceService.schoolSubjects$;
  }

  load(): void {
    const data = readStudentFromTotalList(this.pathToTotalListControl.value);
    this.initRoot(data);
  }

  generate(): void {
    if (!this.canGenerate()) {
      return;
    }

    const settings = this.settingsService.settings;
    settings.generateCertificates = this.settingsGenerate;
    this.settingsService.saveSettings(settings);

    const peoples = this.getPeoples(this.root);

    const subject = this.schoolSubject.names.dative.toLowerCase();
    const templateDocument = peoples
      .map(item => {
        return `\\Certificate{${subject}}{${item.classNumber}}{${item.fio}}{${item.school}}{${item.municipality}}`;
      })
      .join(os.EOL);

    const templateValues = new Map([["%%{{template_document}}", templateDocument]]);

    this.makerPdfService
      .make_pdf(this.settingsGenerate, templateValues)
      .then(() => {
        this.loggerService.info("Сертификаты сгенерированы", this.settingsGenerate, templateValues);
        this.notificationService.showSuccess("Сертификаты сгенерированы.");
      })
      .catch(error => {
        this.loggerService.error("При генерации сертификатов возникла ошибка:", error);
        this.notificationService.showError("При генерации сетификатов возникла ошибка.");
      });
  }

  canGenerate(): boolean {
    return this.pathToTotalListControl.valid && !!this.schoolSubject && !!this.settingsGenerate;
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
      this.pathToTotalListControl.setValue(target.files[0].path);
    }
  }

  hasChild(_: number, node: TreeNode): boolean {
    return node.children && node.children.length > 0;
  }

  getTitle(node: TreeNode): string {
    if (typeof node.value === "string") {
      return node.value;
    } else {
      const student = node.value as StudentFromTotalList;
      return `${student.fio} ${student.classNumber} класс ${student.municipality} ${student.school}`;
    }
  }

  private initRoot(data: Array<[string, StudentFromTotalList[]]>): void {
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

  private getPeoples(node: TreeNode): StudentFromTotalList[] {
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
