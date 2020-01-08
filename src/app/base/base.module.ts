import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IndexComponent } from "./components/index/index.component";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "../shared/shared.module";
import { Page } from "./assets/page";
import { ReactiveFormsModule } from "@angular/forms";
import { GenerateCouponsComponent } from "./components/generate-coupons/generate-coupons.component";
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from "@angular/material";
import { MainSettingsComponent } from "./components/main-settings/main-settings.component";
import { SelectSchoolSubjectComponent } from "./components/select-school-subject/select-school-subject.component";
import { SettingsGenerateComponent } from "./components/settings-generate/settings-generate.component";
import { GenerateCiphersComponent } from "./components/generate-ciphers/generate-ciphers.component";
import { GenerateCertificatesComponent } from "./components/generate-certificates/generate-certificates.component";
import * as moment from "moment";
import { GenerateDiplomasComponent } from "./components/generate-diplomas/generate-diplomas.component";

const routes: Routes = [
  {
    path: "",
    component: IndexComponent,
    children: [
      {
        path: Page.MainSetting,
        component: MainSettingsComponent,
      },
      {
        path: Page.GenerateCoupons,
        component: GenerateCouponsComponent,
      },
      {
        path: Page.GenerateCiphers,
        component: GenerateCiphersComponent,
      },
      {
        path: Page.GenerateCertificates,
        component: GenerateCertificatesComponent,
      },
      {
        path: Page.GenerateDiplomas,
        component: GenerateDiplomasComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    IndexComponent,
    MainSettingsComponent,
    GenerateCouponsComponent,
    GenerateCiphersComponent,
    SettingsGenerateComponent,
    SelectSchoolSubjectComponent,
    GenerateCertificatesComponent,
    GenerateDiplomasComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes), ReactiveFormsModule],
  providers: [
    {
      provide: ErrorStateMatcher,
      useClass: ShowOnDirtyErrorStateMatcher,
    },
  ],
  entryComponents: [MainSettingsComponent, IndexComponent],
})
export class BaseModule {
  constructor() {
    moment.locale("ru");
  }
}
