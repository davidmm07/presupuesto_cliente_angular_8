import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ModApropiacionHelper } from '../../../../@core/helpers/modApropiacionHelper';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';

@Component({
    selector: 'ngx-show-modificacion-apropiacion',
    templateUrl: './show-modificacion-apropiacion.component.html',
    styleUrls: ['./show-modificacion-apropiacion.component.scss'],
})

export class ShowModificationApropiacionDataComponent implements OnInit, OnChanges {
    ngOnChanges(changes: SimpleChanges): void {
    }
    @Input() modificationData: any;
    @Input() vigencia: any;
    @Output() eventChange = new EventEmitter();
    readonly = true;
    settings: object;
    listColumns: object;
    source: Array<any>;

    constructor(private modApropiacionHelper: ModApropiacionHelper,
        private translate: TranslateService,
    ) { }

    ngOnInit() {
        this.listColumns = {

            Rubro: {
                title: this.translate.instant('GLOBAL.rubro'),
                valuePrepareFunction: (value) => value,
            },

            Tipo: {
                title: this.translate.instant('GLOBAL.tipo'),
                valuePrepareFunction: (value) => this.translate.instant('GLOBAL.' + value),
            },
            CuentaCredito: {
                title: this.translate.instant('MODIF.cuenta_credito'),
                type: 'html',
                valuePrepareFunction: function (value) {
                    return `<div class="customformat"> ` + new CurrencyPipe('co').transform(value, 'COP', 'symbol', '4.2-2', 'co') + `</div>`;
                },
            },
            CuentaContraCredito: {
                title: this.translate.instant('MODIF.cuenta_contra_credito'),
                type: 'html',
                valuePrepareFunction: function (value) {
                    return `<div class="customformat"> ` + new CurrencyPipe('co').transform(value, 'COP', 'symbol', '4.2-2', 'co') + `</div>`;
                },
            },
            CDP: {
                title: this.translate.instant('MENU.gestion_cdp.cdp_acronimo'),
                valuePrepareFunction: (value) => value,
            },
        };

        this.settings = {
            actions: {
                add: false,
                edit: false,
                delete: false,
                position: 'right'
            },
            add: {
                addButtonContent: '<i title="Nueva Modificación" class="nb-plus"></i>',
                createButtonContent: '<i class="nb-checkmark"></i>',
                cancelButtonContent: '<i class="nb-close"></i>'
            },
            mode: 'external',
            columns: this.listColumns,
        };

        this.modApropiacionHelper.getModificacionesAfectation(this.modificationData['_id'], { vigencia: this.vigencia, cg: '1' }).subscribe((res: Array<any>) => {
            const data: Array<any> = [];
            /*
                TODO: My future friend: I know this function should be implemented on back-end side.
                I put this here for simplify things because modificaciones' proccess does not take a lot of resources to be formated at this moment.
            */
            for (const mov of res) {
                let movFormated: any;
                if (mov['Tipo'] === 'traslado' || mov['Tipo'].includes('reduccion') || mov['Tipo'].includes('suspension')) {
                    movFormated = {
                        Rubro: mov['Padre'],
                        Tipo: mov['Tipo'],
                        CuentaContraCredito: mov['ValorInicial'],
                        CuentaCredito: 0,
                        CDP: mov['DocumentsGenerated']? mov['DocumentsGenerated'][0]['Consecutivo'] : ''
                    };
                } else {
                    movFormated = {
                        Rubro: mov['Padre'],
                        Tipo: mov['Tipo'],
                        CuentaContraCredito: 0,
                        CuentaCredito: mov['ValorInicial'],
                        CDP: 'N/A'
                    };
                }
                data.push(movFormated);
            }

            this.source = data;

        });
    }

    cambioTab() {
        this.eventChange.emit(false);
    }
}
