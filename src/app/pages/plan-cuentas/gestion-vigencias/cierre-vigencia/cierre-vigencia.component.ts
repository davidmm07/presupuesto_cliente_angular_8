import { Component, OnInit } from '@angular/core';
import { FORM_CIERRE_VIGENCIA } from './form_cierre_vigencia';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../../@core/managers/popUpManager';
import { CierreVigenciaHelper } from '../../../../@core/helpers/cierre-vigencia/cierreVigenciaHelper';
import { LocalDataSource } from 'ng2-smart-table';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { VigenciaHelper } from '../../../../@core/helpers/vigencia/vigenciaHelper';

@Component({
  selector: 'ngx-cierre-vigencia',
  templateUrl: './cierre-vigencia.component.html',
  styleUrls: ['./cierre-vigencia.component.scss']
})
export class CierreVigenciaComponent implements OnInit {
  info_cierre_vig: any;
  clean = false;
  formCierreVigencia: any;
  cierreVigenciaData: any;
  lista_fuentes: any = [];
  lista_reservas: any = [];
  lista_pasivos: any = [];
  mostrarCierre = false;
  cerrada = "0";

  source_fuentes: LocalDataSource = new LocalDataSource();
  source_reservas: LocalDataSource = new LocalDataSource();
  source_pasivos: LocalDataSource = new LocalDataSource();

  settings_fuentes: object;
  settings_reservas: object;
  settings_pasivos: object;

  listColumns_fuentes: object;
  listColumns_reservas: object;
  listColumns_pasivos: object;

  fecha_cierre: any;

  constructor(
    private translate: TranslateService,
    private popManager: PopUpManager,
    private CVHelper: CierreVigenciaHelper,
    private vigenciaHelper: VigenciaHelper,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    // this.formCierreVigencia = FORM_CIERRE_VIGENCIA;
    // this.construirForm();
  }

  ngOnInit() {
    this.info_cierre_vig = {};
    this.cierreVigenciaData = {};

    this.route.paramMap.subscribe(params => {
      this.cierreVigenciaData.AreaFuncional = params.get("areaf");
      this.cierreVigenciaData.Vigencia = params.get("vigencia");
      this.verCierre(this.cierreVigenciaData.Vigencia, this.cierreVigenciaData.AreaFuncional);
    });


    this.listColumns_fuentes = {
      Codigo: {
        title: this.translate.instant('GLOBAL.codigo'),
        filter: true,
        valuePrepareFunction: (value: any) => {
          return value;
        }
      },
      Nombre: {
        title: this.translate.instant('GLOBAL.nombre'),
        filter: true,
        valuePrepareFunction: (value: any) => {
          return value;
        }
      },
      ValorActual: {
        type: "html",
        title: this.translate.instant('GLOBAL.valor'),
        filter: true,
        valuePrepareFunction: (value: any) => {
          return '<p class="moneyField">' + new CurrencyPipe('co').transform(value, 'COP', 'symbol', '4.2-2', 'co') + ' </p>';
        }
      }
    };

    this.listColumns_reservas = {
      Consecutivo: {
        title: this.translate.instant('GLOBAL.consecutivo'),
        filter: true,
        valuePrepareFunction: (value: any) => {
          return value;
        }
      },
      ValorActual: {
        type: "html",
        title: this.translate.instant('GLOBAL.valor'),
        filter: true,
        valuePrepareFunction: (value: any) => {
          return '<p class="moneyField">' + new CurrencyPipe('co').transform(value, 'COP', 'symbol', '4.2-2', 'co') + ' </p>';
        }
      }
    };

    this.listColumns_pasivos = {
      Consecutivo: {
        title: this.translate.instant('GLOBAL.consecutivo'),
        filter: true,
        valuePrepareFunction: (value: any) => {
          return value;
        }
      },
      ValorActual: {
        type: "html",
        title: this.translate.instant('GLOBAL.valor'),
        filter: true,
        valuePrepareFunction: (value: any) => {
          return '<p class="moneyField">' + new CurrencyPipe('co').transform(value, 'COP', 'symbol', '4.2-2', 'co') + ' </p>';
        }
      }
    };

    this.settings_fuentes = {
      actions: {
        add: false,
        edit: false,
        delete: false,
        columnTitle: "Ver",
        custom: [{ name: 'ver_fuente', title: '<i class="fas fa-eye" (click)="ver($event)"></i>' }],
        position: 'right'
      },
      noDataMessage: "No hay registros.",
      mode: 'external',
      columns: this.listColumns_fuentes,
    };

    this.settings_reservas = {
      actions: {
        add: false,
        edit: false,
        delete: false,
        columnTitle: "Ver",
        custom: [{ name: 'ver_crp', title: '<i class="fas fa-eye" (click)="ver($event)"></i>' }],
        position: 'right'
      },
      noDataMessage: "No hay registros.",
      mode: 'external',
      columns: this.listColumns_reservas,
    };

    this.settings_pasivos = {
      actions: {
        add: false,
        edit: false,
        delete: false,
        columnTitle: "Ver",
        custom: [{ name: 'ver_crp', title: '<i class="fas fa-eye" (click)="ver($event)"></i>' }],
        position: 'right'
      },
      noDataMessage: "No hay registros.",
      mode: 'external',
      columns: this.listColumns_pasivos,
    };

  }

  //  descomentar si alguna vez les da por decir que si tocaba en un formulario :v 
  // construirForm() {
  //   this.formCierreVigencia.btn = this.translate.instant('VIGENCIA.precierre_button');
  //   for (let i = 0; i < this.formCierreVigencia.campos.length; i++) {
  //     this.formCierreVigencia.campos[i].label = this.formCierreVigencia.campos[i].label_i18n;
  //     this.formCierreVigencia.campos[i].placeholder = this.formCierreVigencia.campos[i].label_i18n;
  //   }
  // }


  // validarForm(event) {
  //   if (event.valid) {
  //     this.cierreVigenciaData.AreaFuncional = typeof event.data.CierreVigencia.AreaFuncional.Id === 'undefined' ? undefined : event.data.CierreVigencia.AreaFuncional.Id;
  //     this.cierreVigenciaData.Vigencia = typeof event.data.CierreVigencia.Vigencia.valor === 'undefined' ? undefined : event.data.CierreVigencia.Vigencia.valor;

  //   } else {
  //     this.popManager.showErrorAlert('Datos Incompletos!');
  //   }
  // }

  verCierre(vigencia, areaf) {
    this.vigenciaHelper.getFullVigencias(vigencia, areaf).pipe(
      switchMap((res) => {
        this.mostrarCierre =  (res[0].estado === 'Actual');
        this.cerrada = this.mostrarCierre ? '1' : '0' ;   
        return this.CVHelper.getInfoCierre(vigencia, areaf, this.cerrada)
      }
      )
    ).subscribe(res => {
        this.lista_fuentes = res.Fuentes;
        this.source_fuentes.load(this.lista_fuentes);
        this.lista_reservas = res.Reservas;
        this.source_reservas.load(this.lista_reservas);
        this.lista_pasivos = res.Pasivos;
        this.source_pasivos.load(this.lista_pasivos);
      })
  }

  // getIndexForm(nombre: String): number {
  //   for (let index = 0; index < this.formCierreVigencia.campos.length; index++) {
  //     const element = this.formCierreVigencia.campos[index];
  //     if (element.nombre === nombre) {
  //       return index;
  //     }
  //   }
  //   return 0;
  // }

  // getSeleccion(event) {
  //   this.CVHelper.getVigenciaActual(event.valor.Id).subscribe(vig => {
  //     this.fecha_cierre = vig[0].fechaCierre;
  //     this.formCierreVigencia.campos[this.getIndexForm('Vigencia')].valor = { valor: vig[0]._id };
  //   })

  // }

  onCustom(event: any) {
    switch (event.action) {
      case 'ver_fuente':
        this.router.navigate(['/pages/plan-cuentas/fuentes']);
        break;
      case 'ver_crp':
        this.router.navigate(['/pages/plan-cuentas/crp']);
        break;

    }
  }

  ejecutarCierre() {
    this.CVHelper.ejecutarCierre(this.cierreVigenciaData.Vigencia, this.cierreVigenciaData.AreaFuncional).subscribe(res => {
      if (res) {
        this.popManager.showSuccessAlert(`Se generó el cierre de la vigencia ${this.cierreVigenciaData.Vigencia}.`);
        this.router.navigate(['/pages/plan-cuentas/listar-vigencias']);
      }
      else {
        this.popManager.showErrorAlert('Error al generar el cierre');
      }
    })
  }


}
