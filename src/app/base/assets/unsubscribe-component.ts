import { OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

export class UnsubscribeComponent implements OnDestroy {
  protected destroyed = new Subject();

  ngOnDestroy(): void {
    this.destroyed.next();
  }
}
