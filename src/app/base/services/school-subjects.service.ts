import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { SchoolSubject } from "../assets/school-subjects";
import { SettingsService } from "./settings.service";
import { filter } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class SchoolSubjectsService {
  _schoolSubjects = new BehaviorSubject<SchoolSubject[]>([]);

  get schoolSubjects$(): Observable<SchoolSubject[]> {
    return this._schoolSubjects.asObservable().pipe(filter(value => !!value));
  }

  constructor(private settingsService: SettingsService) {
    this.loadSchoolSubjects();
  }

  loadSchoolSubjects(): void {
    const fix: SchoolSubject[] = JSON.parse(
      '[{"title":"Французский язык 1 день","names":{"nominative":"Французский язык","dative":"Французскому языку"},"dateEvent":"2020-01-09T16:59:34.000Z","placeEvent":"г. Красноярск","cipher":{"9":"ФЯ","10":"ФЯ","11":"ФЯ"}},{"title":"Французский язык 2 день","names":{"nominative":"Французский язык","dative":"Французскому языку"},"dateEvent":"2020-01-10T16:59:34.000Z","placeEvent":"г. Красноярск","cipher":{},"dateAward":"2020-01-10T16:59:34.000Z"},{"title":"Русский язык","names":{"nominative":"Русский язык","dative":"Русскому языку"},"dateEvent":"2020-01-12T16:59:34.000Z","placeEvent":"г. Красноярск","cipher":{"9":"РЯ09","10":"РЯ10","11":"РЯ11"},"dateAward":"2020-01-12T16:59:34.000Z"},{"title":"Обществознание 1 день","names":{"nominative":"Обществознание","dative":"Обществознанию"},"dateEvent":"2020-01-13T16:59:34.000Z","placeEvent":"г. Красноярск","cipher":{"9":"О1-09","10":"О1-10","11":"О1-11"}},{"title":"Обществознание 2 день","names":{"nominative":"Обществознание","dative":"Обществознанию"},"dateEvent":"2020-01-14T16:59:34.000Z","placeEvent":"г. Красноярск","cipher":{"11":"О2-11"},"dateAward":"2020-01-14T16:59:34.000Z"}]'
    );
    fix.forEach(item => {
      item.dateEvent = new Date(item.dateEvent);
      if (item.dateAward) {
        item.dateAward = new Date(item.dateAward);
      }
    });
    this._schoolSubjects.next(fix);
    /*   this.settingsService.settings$.pipe(filter(settings => !!settings), first()).subscribe(settings => {
      //todo
      readSchoolSubjects().then(value => {
        this._schoolSubjects.next(value);
        console.log("Список предметов загружен", JSON.stringify(value));
      })

    });*/
  }
}
