import * as XLSX from "xlsx";
import { WorkSheet } from "xlsx";

const MAX_ROW = 2000;
const MAX_COL = 2000;

const TARGET_HEADERS = ["ФИО", "Муниципалитет", "Учебное заведение", "Класс"];

export interface StudentFromTotalList {
  fio: string;
  classNumber: number;
  school: string;
  municipality: string;
}

export function readStudentFromTotalList(path: string): Array<[string, StudentFromTotalList[]]> {
  const workbook = XLSX.readFile(path);
  return workbook.SheetNames.map(sheetName => [sheetName, parseSheet(workbook.Sheets[sheetName])]).filter(item => item[1].length !== 0) as any;
}

function parseSheet(sheet: WorkSheet): StudentFromTotalList[] {
  const headerRow = findTargetRow(sheet);
  if (headerRow === null) {
    return [];
  }

  const start = XLSX.utils.encode_cell({ r: headerRow, c: 0 });
  const end = XLSX.utils.encode_cell({ r: MAX_ROW, c: MAX_COL });

  const data = XLSX.utils.sheet_to_json(sheet, { range: `${start}:${end}` });
  return data
    .map(item => {
      const student: StudentFromTotalList = {
        fio: item["ФИО"],
        classNumber: item["Класс"],
        municipality: item["Муниципалитет"],
        school: item["Учебное заведение"],
      };

      if (Object.keys(student).some(key => student[key] === undefined)) {
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
