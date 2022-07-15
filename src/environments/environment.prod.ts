/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
export const environment = {
  production: true,
  NUXEO: {
    PATH: 'https://documental.udistrital.edu.co/nuxeo/',
  },
  CLIENTE_PRESUPUESTO: '/pages/plan-cuentas',
  CLIENTE_CONTABILIDAD: 'https://contabilidad.portaloas.udistrital.edu.co/pages',
  WSO2_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/',
  PARAMETROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/parametros/v1/', // PARAMETROS NUEVOS
  NECESIDADES_CRUD_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/necesidades_crud/v1/',
  ADMINISTRATIVA_PRUEBAS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/administrativa_amazon_api/v1/',
  PLAN_CUENTAS_MONGO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/plan_cuentas_mongo_crud/v1/',
  PLAN_CUENTAS_MID_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/plan_cuentas_mid/v1/',
  PLAN_ADQUISICION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/plan_adquisiciones_crud/v1/',
  MOVIMIENTOS_CRUD_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/movimientos_crud/v1/',
  ADMINISTRATIVA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/necesidades_crud/v1/',
  OIKOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/oikos_crud_api/v2/',
  CONFIGURACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/',
  CORE_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/core_api/v1/',
  CORE_AMAZON_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/core_amazon_crud/v1/',
  NOTIFICACION_SERVICE: 'wss://autenticacion.portaloas.udistrital.edu.co/apioas/notificacion_ws/v1/',
  CONF_MENU_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/menu_opcion_padre/ArbolMenus/',
  KNOWAGE: {
    PROTOCOL: 'https',
    HOST: 'autenticacion.portaloas.udistrital.edu.co',
    PORT: '',
    CONTEXTPATH: 'knowage',
    USER: 'bidev',
    PASSWORD: 'bidev',
},
  TOKEN: {
    AUTORIZATION_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize',
    CLIENTE_ID: 'VdsSwcysvM39q0x3awKZd6iuKqwa',
    RESPONSE_TYPE: 'id_token token',
    SCOPE: 'openid email role',
    REDIRECT_URL: 'https://presupuesto.portaloas.udistrital.edu.co',
    SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
    SIGN_OUT_REDIRECT_URL: 'https://presupuesto.portaloas.udistrital.edu.co',
  },
};
