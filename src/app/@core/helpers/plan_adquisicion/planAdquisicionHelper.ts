import { RequestManager } from '../../managers/requestManager';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { PopUpManager } from '../../managers/popUpManager';

@Injectable({
    providedIn: 'root',
})
export class PlanAdquisicionHelper {

    constructor(private rqManager: RequestManager,
        private pUpManager: PopUpManager,
      ) { }

    public getPlanAdquisicionByRubro(query?: string) {
        this.rqManager.setPath('PLAN_ADQUISICION_SERVICE');
        return this.rqManager.get('Registro_plan_adquisiciones?query=' + query).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el plan de adquisición');
                        return undefined;
                    }
                    return res;
                },
            ),
        );

    }

    // getPlanAdquisicionByDependencia obtiene la información del plan de adquisiciones con una vigencia y una dependencia
    public getPlanAdquisicionByDependencia(vigencia: string, dependencia: string) {
        this.rqManager.setPath('PLAN_ADQUISICION_SERVICE');
        return this.rqManager.get('plan_adquisiciones/' + vigencia + '/' + dependencia).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el plan de adquisición');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    // getPlanAdquisicionByFuente obtiene la información del plan de adquisiciones con una vigencia y una fuente
    public getPlanAdquisicionByFuente(vigencia: string, fuente: string) {
        this.rqManager.setPath('PLAN_ADQUISICION_SERVICE');
        return this.rqManager.get('Registro_plan_adquisiciones?query=PlanAdquisicionesId__Vigencia%3A' + vigencia + '%2CFuenteFinanciamientoId%3A' + fuente + '&limit=-1').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el plan de adquisición');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }


}
