import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  constructor(private matSnackBar: MatSnackBar) {}

  showSuccess(message: string): void {
    this.matSnackBar.open(message, "", {
      duration: 1000,
    });
  }

  showError(message: string): void {
    this.matSnackBar.open(message, "", {
      duration: 1000,
    });
  }
}
