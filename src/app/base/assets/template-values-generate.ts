import { SchoolSubject } from "./school-subjects";
import * as moment from "moment";

export function generateCiphers(
  schoolSubject: SchoolSubject,
  numberCiphersForClass: { [7]?: number; [8]?: number; [9]?: number; [10]?: number; [11]?: number }
): string {
  const numberCiphers = new Map<string, number>();
  Object.keys(schoolSubject.cipher).forEach(classNumber => {
    const cipher = schoolSubject.cipher[classNumber];
    const number = (numberCiphers.get(cipher) || 0) + (numberCiphersForClass[classNumber] || 0);
    if (number > 0) {
      numberCiphers.set(cipher, number);
    }
  });

  let data: string[] = [];
  numberCiphers.forEach((numberCipher, cipher) => {
    const numbers = getRange(numberCipher, [13]);
    data = data.concat(numbers.map(item => `${cipher}-${numberToString(item, 2)}`));
  });
  if (data.length % 2 !== 0) {
    data.push("Я лишняя!!!");
  }

  const title = schoolSubject.names.dative.toLowerCase();
  const date = moment(schoolSubject.dateEvent)
    .format("D MMMM YYYY года")
    .toLowerCase();
  const place = schoolSubject.placeEvent;

  let templatePages: string[] = [];
  for (let i = 0; i < data.length; i += 2) {
    templatePages.push(`\\TwoEncryption{${title}}{${date}}{${place}}{${data[i]}}{${data[i + 1]}}`);
  }
  return templatePages.join("\n");
}

function getRange(count: number, exclude: number[]): number[] {
  const range: number[] = [];
  for (let i = 1; range.length !== count; ++i) {
    if (!exclude.includes(i)) {
      range.push(i);
    }
  }
  return range;
}

function numberToString(number: number, minLength: number): string {
  const numberString = number.toString();
  const numberAddZero = Math.max(0, minLength - numberString.length);
  return "0".repeat(numberAddZero) + numberString;
}
