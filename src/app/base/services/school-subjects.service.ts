import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { readSchoolSubjects, SchoolSubject } from "../assets/school-subjects";
import { SettingsService } from "./settings.service";
import { filter, first } from "rxjs/operators";
import { LoggerService } from "@angular-ru/logger";
import { NotificationService } from "./notification.service";

@Injectable({
  providedIn: "root",
})
export class SchoolSubjectsService {
  private lastPathToLoadedDB = "";

  _schoolSubjects = new BehaviorSubject<SchoolSubject[]>([]);

  get schoolSubjects$(): Observable<SchoolSubject[]> {
    return this._schoolSubjects.asObservable().pipe(filter(value => !!value));
  }

  constructor(private settingsService: SettingsService, private loggerService: LoggerService, private notificationService: NotificationService) {
    this.loadSchoolSubjects();
  }

  loadSchoolSubjects(): void {
    this.settingsService.settings$
      .pipe(
        filter(settings => !!settings),
      )
      .subscribe(settings => {
        const path = settings.main.pathToDatabaseSchoolSubjects;
        if (path === this.lastPathToLoadedDB) {
          return;
        }
        readSchoolSubjects(settings.main.pathToDatabaseSchoolSubjects)
          .then(value => {
            this.loggerService.info(`База предметов загружена. Количество предметом ${value.length}.`);
            this.notificationService.showSuccess(`База предметов загружена. Количество предметом ${value.length}.`);
            this._schoolSubjects.next(value);
            this.lastPathToLoadedDB = path;
          })
          .catch(error => {
            this.loggerService.error("При загрузке базы предметов произошла ошибка: ", error);
            this.notificationService.showSuccess("При загрузке базы предметов произошла ошибка.");
          });
      });
  }
}
