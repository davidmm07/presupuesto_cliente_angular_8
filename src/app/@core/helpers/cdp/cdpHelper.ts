import { RequestManager } from '../../managers/requestManager';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { PopUpManager } from '../../managers/popUpManager';

@Injectable({
    providedIn: 'root',
})
export class CDPHelper {

    constructor(
        private rqManager: RequestManager,
        private pUpManager: PopUpManager,
    ) { }

    /**
    * getSolicitudesCdp
    * Consulta todas las solicitudes de CDP
    * lista de solicitudes de CDP si todo ok, alerta si falla.
    * @param estado el estado en que se requiere el cdp, por defecto trae los que están en estado "solicitado"
    * @param id en caso de que se desee consultar una solicitud especifica
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
    public getSolicitudesCDP(id?: string, estado = 'sol') {
        const query = id ? id : '?query=estado.acronimo:' + estado;
        this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');
        return this.rqManager.get('solicitudesCDP/' + query).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los cdps');
                        return undefined;
                    }
                    return res;
                },
            ),
        );

    }

    /**
    * getNecesidades
    * Consulta todas las necesidades
    * @param query La consulta enviada al api
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
    public getAllNecesidades(query?: Object) {
        this.rqManager.setPath('NECESIDADES_CRUD_SERVICE');
        return this.rqManager.get('necesidad?' + query).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar las necesidades');
                        return undefined;
                    }
                    return res;
                }
            )
        );
    }


    /**
    * CDP get
    * consulta los CDP (se ha expedido doc)
    * lista de CDP si todo ok, alerta si falla.
    * @param id en caso de que se desee consultar un CDP especifico
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */

    public getListaCDP(id?: any) {
        const query = id ? id : '?query=estado.acronimo:exp';
        this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');
        return this.rqManager.get('solicitudesCDP/' + query).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los cdps');
                        return undefined;
                    }
                    return res;
                },
            ),
        );

    }

    public getCDP(id) {
        this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');

        return this.rqManager.get('solicitudesCDP/?query=consecutivo:' + id).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los cdps');
                        return undefined;
                    }
                    return res;
                },
            ),
        );

    }


    /**
    * get nece plan cuentas
    * consulta las necesidades desde plan cuentas
    * necesidad si  todo ok, alerta si falla.
    * @param id en caso de que se desee consultar una necesidad especifica
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
    public getNecesidadPC(idnecesidad) {
        this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');
        return this.rqManager.get(`necesidades/`).pipe(
            map(
                res_pc => {
                    if (res_pc['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo cargar la Necesidad');
                        return undefined;
                    } else {
                        res_pc = res_pc.filter(n => n.idAdministrativa + '' === idnecesidad + '');
                        return res_pc[0];
                    }
                }
            )
        );

    }


    /**
    * get necesidad mid
    * consulta las necesidades desde plan cuentas mid
    * necesidad si  todo ok, alerta si falla.
    * @param id en caso de que se desee consultar una necesidad especifica
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
    public getFullNecesidad(idnecesidad) {
        this.rqManager.setPath('PLAN_CUENTAS_MID_SERVICE');
        return this.rqManager.get(`necesidad/getfullnecesidad/` + idnecesidad).pipe(
            map(
                res_mid => {
                    if (res_mid.status > 300) {
                        this.pUpManager.showErrorAlert('Error al obtener la necesidad');
                        return undefined;
                    } else {
                        return res_mid;
                    }
                }
            )
        );


    }
    /**
    * expedir CDP
    * dispara la funcion para expedicion del CDP
    * inforcdp si  todo ok, alerta si falla.
    * @param id identificador de solicitud de cdp
    * @returns  <Observable> objeto creado en la solicitud de cdp. undefined if the request has errors
    */
    public expedirCDP(id: string) {
        this.rqManager.setPath('PLAN_CUENTAS_MID_SERVICE');
        return this.rqManager.get(`cdp/expedirCDP/${id}`).pipe(
            map(
                res_mid => {
                    if (res_mid.status > 300) {
                        this.pUpManager.showErrorAlert('Error al expedir CDP');
                        return undefined;
                    } else {
                        return res_mid;
                    }
                }
            )
        );
    }

    public ordenadorGasto(documento: string) {
        this.rqManager.setPath('ADMINISTRATIVA_PRUEBAS_SERVICE');
        return this.rqManager.get(`informacion_persona_natural?query=Id:${documento}&limit=-1`).pipe(
            map(
                res => {
                    if (res.status > 300) {
                        return undefined;
                    } else {
                        return res;
                    }
                }
            )
        );
    }

    public cargoOrdenador(id: number, fecha: string) {
        this.rqManager.setPath('CORE_AMAZON_SERVICE');
        return this.rqManager.get(`jefe_dependencia/?query=Id:${id},FechaInicio__lte:${fecha},FechaFin__gte:${fecha}&limit=-1`).pipe(
            map(
                res => {
                    if (res.status > 300) {
                        return undefined;
                    } else {

                        return res;
                    }
                }
            )
        );
    }

    public obtenerCargo(idDependencia: number) {
        this.rqManager.setPath('CORE_AMAZON_SERVICE');
        return this.rqManager.get(`ordenador_gasto/?query=DependenciaId:${idDependencia}`).pipe(
            map(
                res => {
                    if (res.status > 300) {
                        return undefined;
                    } else {
                        return res;
                    }
                }
            )
        );
    }

    public obtenerSolCdp(idCdp: number) {
        this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');
        return this.rqManager.get(`solicitudesCDP/${idCdp}`).pipe(
            map(
                res => {
                    if (res.status > 300) {
                        return undefined;
                    } else {
                        return res;
                    }
                }
            )
        );
    }


    /**
    * get jefe dependencia
    * consulta los jefes de dependencia por ID para devolver la info de la persona
    * JD si  todo ok, alerta si falla.
    * @param id identificador del jefe de dependencia
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
    public getJefeDependencia(id) {

    }






}
