import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { map } from 'rxjs/operators';


@Injectable({
    providedIn: 'root',
})
export class VigenciaHelper {
    router: any;

    constructor(
        private rqManager: RequestManager,
        private pUpManager: PopUpManager,
    ) { }

    /**
   * getFullVigencias
   * Consulta todas las vigencias.
   * retorna las vigencias guardadas si todo esta bien, en caso contrario muestra una alerta .
   * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
   */
    public getFullVigencias(id?, area?) {
        // const query = 'vigencia_actual_area';
        this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');
        return this.rqManager.get('vigencia/vigencias_total').pipe(
            map(res => {
                if (res === 'error') {
                    this.pUpManager.showErrorAlert('No se pueden consultar las vigencias');
                    return undefined;
                }
                if (id && area) {
                    return res.filter(vig => vig._id === id && vig.areaFuncional === area);
                } else {
                    return res;
                }
            },
            ),
        );
    }

    /**
  * getCurrentVigencia
  * Consulta la vigencia actual para el área seleccionada (definida como 1)
  * retorna la vigencia actual, en caso contrario el error
  * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
  */
    public getCurrentVigencia(offset?: number) {
        this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');
        const params = {
            offset,
        };
        let query = '';
        if (offset) {
            query = `?offset=${offset}`;
        }
        return this.rqManager.get(`vigencia/vigencia_actual_area/1${query}`, params).pipe(
            map(res => {
                if (res[0].valor) {
                    return res[0].valor;
                } else {
                    this.pUpManager.showErrorAlert('No se puede obtener la información de la vigencia actual');
                }
            })
        );
    }

    /**
  * getNotRepeatedVigencias
  * Consulta todas las vigencias y devuelve un arreglo con los valores no repetidos
  * retorna un arreglo de vigencias sin valores (años) repetidos, de lo contrario devuelve un error
  * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
  */
    public getNotRepeatedVigencias() {
        // const query = 'vigencia_actual_area';
        this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');
        return this.rqManager.get('vigencia/vigencias_total').pipe(
            map(res => {
                if (res === 'error') {
                    this.pUpManager.showErrorAlert('No se pueden consultar las vigencias');
                    return undefined;
                } else {
                    let exist = false;
                    const vigencias = [];
                    res.forEach(item => {
                        const valorVigencia = item.valor;
                        if (vigencias.length > 0) {
                            exist = vigencias.some(uniqueMeta => {
                                return uniqueMeta.valor === valorVigencia;
                            });
                            if (!exist) {
                                vigencias.push(item);
                            }
                        } else {
                            vigencias.push(item);
                        }
                    });
                    return vigencias;
                }
            },
            ),
        );
    }
}
