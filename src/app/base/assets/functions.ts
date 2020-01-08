import * as fs from "fs";
import * as XLSX from "xlsx";
import * as child_process from "child_process";
import { WorkBook } from "xlsx";

export function readFilePromise(path: string, options?: { encoding: string; flag?: string } | string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, options, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export function writeFilePromise(path: string, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function readXLSX(path: string): Promise<WorkBook> {
  const data = await readFilePromise(path);
  return XLSX.read(data, {
    cellDates: true,
    type: "buffer",
  });
}

export function flatArray<T>(array: Array<Array<T>>): T[] {
  return array.reduce((result, value) => result.concat(value), []);
}

export function execPromise(cmd: string, cwd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, { cwd: cwd }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

export function trimForAllString(data: any): typeof data {
  if (data && typeof data === "object") {
    if (Array.isArray(data)) {
      const transformData = [];
      for (let i = 0, length = data.length; i < length; ++i) {
        transformData[i] = trimForAllString(data[i]);
      }
      return transformData;
    } else {
      const transformData = {};
      Object.keys(data).forEach(key => {
        transformData[key] = trimForAllString(data[key]);
      });
      return transformData;
    }
  } else if (typeof data === "string") {
    return data.trim();
  } else {
    return data;
  }
}
