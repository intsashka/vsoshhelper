import * as XLSX from "xlsx";
import { WorkSheet } from "xlsx";

export enum TypeDiploma {
  Winner = "победитель",
  Prizewinner = "призёр",
}

export interface StudentFromProtocol {
  fio: string;
  classNumber: number;
  school: string;
  schoolFull: string;
  municipality: string;

  diploma: TypeDiploma;
}

const MAX_ROW = 2000;
const MAX_COL = 2000;

const TARGET_HEADERS = ["№", "ФИО", "Муниципалитет", "Учебное заведение", "Учебное заведение (полностью)", "Класс", "Тип диплома"];

export function readStudentFromProtocol(path: string): Array<[string, StudentFromProtocol[]]> {
  const workbook = XLSX.readFile(path);
  return workbook.SheetNames.map(sheetName => [sheetName, parseSheet(workbook.Sheets[sheetName])]).filter(item => item[1].length !== 0) as any;
}

function parseSheet(sheet: WorkSheet): StudentFromProtocol[] {
  const headerRow = findTargetRow(sheet);
  if (headerRow === null) {
    return [];
  }

  const start = XLSX.utils.encode_cell({ r: headerRow, c: 0 });
  const end = XLSX.utils.encode_cell({ r: MAX_ROW, c: MAX_COL });

  const data = XLSX.utils.sheet_to_json(sheet, { range: `${start}:${end}` });
  return data
    .map(item => {
      if (typeof item["№"] !== "number") {
        return null;
      }

      const student: StudentFromProtocol = {
        fio: item["ФИО"],
        classNumber: item["Класс"],
        municipality: item["Муниципалитет"],
        school: item["Учебное заведение"],
        schoolFull: item["Учебное заведение (полностью)"],
        diploma: item["Тип диплома"],
      };

      const keysAndTypes: Array<[keyof StudentFromProtocol, "string" | "number"]> = [
        ["fio", "string"],
        ["classNumber", "number"],
        ["municipality", "string"],
        ["school", "string"],
        ["schoolFull", "string"],
        ["diploma", "string"],
      ];

      if (keysAndTypes.some(([key, type]) => typeof student[key] !== type)) {
        return null;
      }

      if (![TypeDiploma.Winner, TypeDiploma.Prizewinner].includes(student.diploma)) {
        return null;
      }

      return student;
    })
    .filter(student => !!student);
}

function findTargetRow(sheet: WorkSheet): number | null {
  for (let row = 0; row <= MAX_ROW; ++row) {
    const set = new Set();
    for (let col = 0; col <= MAX_COL; ++col) {
      const coord = XLSX.utils.encode_cell({ r: row, c: col });
      set.add((sheet[coord] || {}).v);
    }
    if (TARGET_HEADERS.every(value => set.has(value))) {
      return row;
    }
  }
  return null;
}
