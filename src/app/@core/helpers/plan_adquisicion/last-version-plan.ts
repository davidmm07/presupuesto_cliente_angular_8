import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { PlanAdquisicionHelper } from './planAdquisicionHelper';

@Injectable({
  providedIn: 'root',
})
export class LastVersionPlanHelper {
  constructor(private planAdquisicionHelper: PlanAdquisicionHelper) {}

  lastVersionPlan(planAdquisicionesId: Number) {
    return this.planAdquisicionHelper
      .getPlanAdquisicionByDependencia(planAdquisicionesId.toString())
      .pipe(
        map((res) => {
          if (res.length > 1) {
            return res.sort(this.compareFunction)[0];
          }
          return res[0];
        })
      );
  }

  compareFunction(lastPlan: any, nextPlan: any) {
    const lastPlanDate = new Date(lastPlan.fechacreacion);
    const nextPlanDate = new Date(nextPlan.fechacreacion);

    return nextPlanDate.getTime() - lastPlanDate.getTime();
  }
}
