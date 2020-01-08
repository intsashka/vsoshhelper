import { Component } from "@angular/core";
import { Page } from "../../assets/page";

@Component({
  selector: "app-index",
  templateUrl: "./index.component.html",
  styleUrls: ["./index.component.scss"],
})
export class IndexComponent {
  readonly pages: ReadonlyArray<Page> = [Page.MainSetting, Page.GenerateCoupons, Page.GenerateCiphers, Page.GenerateCertificates, Page.GenerateDiplomas];

  constructor() {}

  getPageName(page: Page): string {
    switch (page) {
      case Page.MainSetting:
        return "Общие настройки";
      case Page.GenerateCoupons:
        return "Сгенерировать талоны";
      case Page.GenerateCiphers:
        return "Сгенерировать шифровки";
      case Page.GenerateCertificates:
        return "Сгенерировать сертификаты";
      case Page.GenerateDiplomas:
        return "Сгенерировать дипломы";
    }
  }
}
