import * as path from "path";
import * as process from "process";
import { readFilePromise, writeFilePromise } from "./functions";

export interface MainSettings {
  pathToDatabaseSchoolSubjects: string;
  pathToDatabaseSchools: string;
  commandGeneratePDF: string;
}

export interface SettingsGenerate {
  pathToTemplate: string;
  pathToOutDir: string;
  filename: string;
}

export interface Settings {
  main: MainSettings;
  generateCoupons: SettingsGenerate;
  generateCiphers: SettingsGenerate;
  generateCertificates: SettingsGenerate;
  generateDiplomas: SettingsGenerate;
}

export async function readSettings(): Promise<Settings> {
  return (await JSON.parse(await readFilePromise(pathToSettings, "utf8"))) as Settings;
}

export async function saveSettings(settings: Settings): Promise<void> {
  return await writeFilePromise(pathToSettings, JSON.stringify(settings, null, 2));
}

const pathToSettings = path.join(process.cwd(), "settings.json");
