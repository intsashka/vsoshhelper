import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { readSettings, saveSettings, Settings } from "../assets/settings";
import { filter } from "rxjs/operators";
import { LoggerService } from "@angular-ru/logger";
import { NotificationService } from "./notification.service";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  private _settings = new BehaviorSubject<Settings | undefined>(undefined);

  get settings$(): Observable<Settings> {
    return this._settings.asObservable().pipe(filter(value => !!value));
  }

  get settings(): Settings | undefined {
    return this._settings.value;
  }

  constructor(private loggerService: LoggerService, private notificationService: NotificationService) {
    readSettings()
      .then(readingSettings => {
        this.loggerService.info("Настройки загружены:", readingSettings);
        this._settings.next(readingSettings);
      })
      .catch(error => {
        this.loggerService.error("При загрузке настроек возникла ошибка:", error);
      });
  }

  saveSettings(newSettings: Settings): void {
    saveSettings(newSettings)
      .then(() => {
        this.loggerService.info("Настройки сохранены:", newSettings);
        this.notificationService.showSuccess("Настройки сохранены.");
        this._settings.next(newSettings);
      })
      .catch(error => {
        this.loggerService.error("При сохранении настроек возникла ошибка:", error);
        this.notificationService.showError("При сохранении настроек возникла ошибка.");
      });
  }
}
