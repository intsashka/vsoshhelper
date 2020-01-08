import { Injectable } from "@angular/core";
import { SettingsService } from "./settings.service";
import { execPromise, readFilePromise, writeFilePromise } from "../assets/functions";
import { first } from "rxjs/operators";
import { SettingsGenerate } from "../assets/settings";
import * as path from "path";

@Injectable({
  providedIn: "root",
})
export class MakerPdfService {
  constructor(private settingsService: SettingsService) {}

  async make_pdf(settingsGenerate: SettingsGenerate, templateValues: Map<string, string>): Promise<void> {
    const settings = await this.settingsService.settings$.pipe(first()).toPromise();

    let data = await readFilePromise(settingsGenerate.pathToTemplate, "utf8");
    templateValues.forEach((value, token) => {
      data = data.replace(new RegExp(token, "g"), value);
    });

    const pathToFile = path.join(settingsGenerate.pathToOutDir, settingsGenerate.filename);
    await writeFilePromise(pathToFile, data);

    let cmd = settings.main.commandGeneratePDF.replace("{{filename}}", `"${pathToFile}"`);
    cmd = cmd.replace("{{dir_out}}", `"${settingsGenerate.pathToOutDir}"`);

    await execPromise(cmd, settingsGenerate.pathToOutDir);
  }
}
