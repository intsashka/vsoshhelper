import { Component, OnInit } from "@angular/core";
import {readFile} from "fs";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  readonly items = ["Диплом", "Сертификат", "Талоны"];
  constructor() {}

  ngOnInit(): void {
    const file = readFile("/home/intsashka/intsashka/work/ВсОШ 2020/Программы/VSOSHHelper/src/app/home/home.component.ts", (err, data) => {
      console.log(err);
      console.log(err);
    });
  }
}
