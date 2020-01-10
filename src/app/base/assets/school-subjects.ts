import { flatArray, readXLSX } from "./functions";
import * as XLSX from "xlsx";

export interface SchoolSubject {
  title: string;
  names: {
    nominative: string;
    dative: string;
  };
  dateEvent: Date;
  placeEvent: string;
  dateAward?: Date;
  cipher: {
    [7]?: string;
    [8]?: string;
    [9]?: string;
    [10]?: string;
    [11]?: string;
  };
}

export async function readSchoolSubjects(path: string): Promise<SchoolSubject[]> {
  const workBook = await readXLSX(path);
  const sheets = workBook.SheetNames.map(name => workBook.Sheets[name]);
  const rawSchoolSubjects = flatArray(sheets.map(sheet => XLSX.utils.sheet_to_json(sheet)));
  return rawSchoolSubjects.map(item => parseRawSchoolSubject(item)).filter(item => !!item);
}

function parseRawSchoolSubject(data: any): SchoolSubject | undefined {
  if (typeof data !== "object") {
    return undefined;
  }

  const schoolSubject: SchoolSubject = {
    title: data["Предмет"],
    names: {
      nominative: data["Название предмета и.п."],
      dative: data["Название предмета д.п."],
    },
    dateEvent: data["Дата"],
    placeEvent: data["Место проведения"],
    cipher: {},
  };

  if (typeof schoolSubject.title !== "string") {
    return undefined;
  }

  if (typeof schoolSubject.names.nominative !== "string") {
    return undefined;
  }

  if (typeof schoolSubject.names.dative !== "string") {
    return undefined;
  }

  if (typeof schoolSubject.dateEvent !== "object") {
    return undefined;
  } else {
    schoolSubject.dateEvent.setHours(schoolSubject.dateEvent.getHours() + 1);
  }

  const dateAward = data["Дата награждения"];
  if (typeof dateAward === "object") {
    schoolSubject.dateAward = dateAward;
    schoolSubject.dateAward.setHours(schoolSubject.dateAward.getHours() + 1);
  }

  [
    ["Шифр 7 класс", 7],
    ["Шифр 8 класс", 8],
    ["Шифр 9 класс", 9],
    ["Шифр 10 класс", 10],
    ["Шифр 11 класс", 11],
  ].forEach(([keyClass, numberClass]) => {
    const value = data[keyClass];
    if (typeof value === "string" && value) {
      schoolSubject.cipher[numberClass] = value;
    }
  });

  return schoolSubject;
}
