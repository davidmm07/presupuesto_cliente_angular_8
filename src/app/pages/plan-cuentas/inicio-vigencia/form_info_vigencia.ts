export let FORM_INFO_VIGENCIA = {
    tipo_formulario: 'currency',
    alertas: true,
    modelo: 'FormatoCrearVigencia',
    campos: [
        {
            //Falta mirar si el código del centro gestor se puede asignar de forma dinámica


            etiqueta: 'select',
            claseGrid: 'col-lg-6 col-md-6 col-sm-6 col-xs-6',
            nombre: 'CodigoCentroGestor',
            label_i18n: 'Codigo Centro Gestor',
            placeholder_i18n: 'Código Centro Gestor',
            requerido: true,
            tipo: 'text',
            key: 'valor',
            opciones: [{Id: 1, valor: "Rector"}],
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-lg-6 col-md-6 col-sm-6 col-xs-6',
            nombre: 'CogigoAreaFuncional',
            label_i18n: 'Código Área Funcional',
            placeholder_i18n: 'Código Área Funcional',
            requerido: true,
            tipo: 'text',
            key: 'valor',
            opciones: [{id: 1 , valor: "Universidad Distrital Francisco José de Caldas"}]
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-lg-6 col-md-6 col-sm-6 col-xs-6',
            nombre: 'VigenciaEjecucion',
            label_i18n: 'Vigencia de Ejecución',
            placeholder_i18n: 'Vigencia de Ejecución',
            requerido: true,
            tipo: 'text',
            key: 'valor',
            opciones: [{Id: 1, valor: '2020'}]
        },
        {
            etiqueta: 'select',
            claseGrid: 'col-lg-6 col-md-4 col-sm-6 col-xs-6',
            nombre: 'VigenciaProgramacion',
            label_i18n: 'Vigencia de Programación',
            placeholder_i18n: 'Vigencia de Programación',
            requerido: true,
            tipo: 'text',
            key: 'valor',
            opciones: [{Id: 1, valor: '2020'}]
        },
    ],
};