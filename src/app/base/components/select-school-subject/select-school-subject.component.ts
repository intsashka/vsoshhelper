import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { SchoolSubject } from "../../assets/school-subjects";
import { UnsubscribeComponent } from "../../assets/unsubscribe-component";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-select-school-subject",
  templateUrl: "./select-school-subject.component.html",
  styleUrls: ["./select-school-subject.component.scss"],
})
export class SelectSchoolSubjectComponent extends UnsubscribeComponent {
  selectedSchoolSubjectControl: FormControl;

  private _schoolSubjects: SchoolSubject[] = [];
  @Input() set schoolSubjects(value: SchoolSubject[]) {
    this._schoolSubjects = value;
    this.updateSelectedSchoolSubject();
  }

  get schoolSubjects(): SchoolSubject[] {
    return this._schoolSubjects;
  }

  @Output() selectSchoolSubject = new EventEmitter<SchoolSubject | null>();

  constructor(private formBuilder: FormBuilder) {
    super();
    this.initControl();
  }

  private initControl(): void {
    this.selectedSchoolSubjectControl = this.formBuilder.control(null, Validators.required);
    this.selectedSchoolSubjectControl.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(value => {
      this.selectSchoolSubject.emit(value);
    });
  }

  private updateSelectedSchoolSubject(): void {
    const selected: SchoolSubject = this.selectedSchoolSubjectControl.value;
    if (selected) {
      const actualSelected = this._schoolSubjects.find(item => item.title === selected.title);
      this.selectedSchoolSubjectControl.setValue(actualSelected || null);
    }
  }
}
