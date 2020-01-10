import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TranslateModule } from "@ngx-translate/core";

import { PageNotFoundComponent } from "./components/";
import { WebviewDirective } from "./directives/";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatButtonModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatIconModule,
  MatIconRegistry,
  MatInputModule,
  MatListModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatTreeModule,
} from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";

import * as fs from "fs";
import * as path from "path";
import { SelectFileComponent } from "./components/select-file/select-file.component";
import { SelectDirComponent } from "./components/select-dir/select-dir.component";

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, SelectFileComponent, SelectDirComponent],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTreeModule,
    MatCheckboxModule,
    ReactiveFormsModule,
  ],
  exports: [
    TranslateModule,
    WebviewDirective,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTreeModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    SelectFileComponent,
    SelectDirComponent,
  ],
})
export class SharedModule {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.loadIcons();
  }

  private loadIcons(): void {
    const pathToIconDir = "src/assets/icons/";
    fs.readdirSync(pathToIconDir).forEach(filename => {
      const pathToIcon = path.join(pathToIconDir, filename);
      const icon = fs.readFileSync(pathToIcon, "utf8");
      const iconName = this.getIconName(filename);
      this.matIconRegistry.addSvgIconLiteral(iconName, this.domSanitizer.bypassSecurityTrustHtml(icon));
    });
  }

  private getIconName(filename: string): string {
    const index = filename.lastIndexOf(".");
    return index > -1 ? filename.slice(0, index) : filename;
  }
}
