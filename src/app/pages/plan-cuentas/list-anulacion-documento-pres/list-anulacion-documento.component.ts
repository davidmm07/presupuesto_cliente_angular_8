import {
  Component,
  OnInit,
  Input,
  OnChanges
} from '@angular/core';
import { registerLocaleData, CurrencyPipe } from '@angular/common';
import locales from '@angular/common/locales/es-CO';
// import { ModApropiacionHelper } from '../../../@core/helpers/modApropiacionHelper';
import { MovimientosHelper } from '../../../@core/helpers/movimientos/movimientosHelper';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
registerLocaleData(locales, 'co');

@Component({
  selector: 'ngx-list-anulacion-documento',
  templateUrl: './list-anulacion-documento.component.html',
  styleUrls: ['./list-anulacion-documento.component.scss']
})
export class ListAnulacionDocumentoComponent implements OnInit, OnChanges {
  @Input() movID: string;
  @Input() vigencia: string;
  @Input() centroGestor: string;
  @Input() updateSignal: Observable<string[]>;

  source: Array<any>;
  settings: object;
  listColumns: object;

  constructor(
    private movimientosHelper: MovimientosHelper,
    private translate: TranslateService
  ) {}

  ngOnChanges(changes) {
    if (changes['updateSignal'] && this.updateSignal) {
      this.updateSignal.subscribe(() => {
        this.loadMovs();
      });
    }
  }

  ngOnInit() {
    this.listColumns = {
      Consecutivo: {
        title: this.translate.instant('GLOBAL.consecutivo'),
        valuePrepareFunction: value => value
      },

      Tipo: {
        title: this.translate.instant('GLOBAL.tipo'),
        valuePrepareFunction: value => this.translate.instant('GLOBAL.' + value)
      },
      FechaRegistro: {
        title: this.translate.instant('GLOBAL.fecha_registro'),
        valuePrepareFunction: value => {
          const date = new Date(value);
          return `${date.getFullYear()}-${date.getMonth() + 1}-${(
            '0' + date.getDate()
          ).slice(-2)}`;
        }
      },
      Valor: {
        title: this.translate.instant('GLOBAL.valor'),
        type: 'html',
        valuePrepareFunction: function(value) {
          return (
            `<div class="customformat"> ` +
            new CurrencyPipe('co').transform(
              value,
              'COP',
              'symbol',
              '4.2-2',
              'co'
            ) +
            `</div>`
          );
        }
      },
      Descripcion: {
        title: this.translate.instant('GLOBAL.descripcion'),
        type: 'html',
        valuePrepareFunction: value =>
          `<div data-toggle="tooltip" title="${value}">${
            value.length > 35 ? value.substring(0, 35) + '&hellip;' : value
          }</div>`
      }
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
      pager: {
        display: true,
        perPage: 5
      }
    };

    this.loadMovs();
  }

  loadMovs() {
    this.movimientosHelper
      .getChildMovsByMovParentUUID(this.vigencia, this.centroGestor, this.movID)
      .subscribe(res => {
        this.source = res;
      });
  }
}
