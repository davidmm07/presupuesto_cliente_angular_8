import { Component, OnInit } from '@angular/core';
import { Vigencia } from '../../../@core/data/models/vigencia';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../@core/managers/popUpManager';
import { AdmAmazonHelper } from '../../../@core/helpers/administrativa/admAmazonHelper';
import { FormManager } from '../../../@core/managers/formManager';
import { FORM_INFO_VIGENCIA } from  './form_info_vigencia';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-inicio-vigencia',
  templateUrl: './inicio-vigencia.component.html',
  styleUrls: ['./inicio-vigencia.component.scss']
})

export class InicioVigenciaComponent implements OnInit {
  datosNuevaVigencia: Vigencia;
  formatoCrearVigencia: any;
  clean = false;
  constructor(
    private translate: TranslateService,
    private popManager: PopUpManager,
    private admAmazonHelper: AdmAmazonHelper,
    private router: Router,
  ) {
    this.formatoCrearVigencia = FORM_INFO_VIGENCIA;
    this.construirForm();
    this.datosNuevaVigencia = {
    ConsecutivoVigencia: undefined,
    CodigoCentroGestor: undefined,
    CodigoAreaFuncional: undefined,
    VigenciaEjecucion: undefined,
    VigenciaProgramacion: undefined
   };
  }
  ngOnInit() {
    this.datosNuevaVigencia = { } as Vigencia;
  }
  construirForm(){
    this.formatoCrearVigencia.btn = this.translate.instant('GLOBAL.crear');
    console.log(this.formatoCrearVigencia.campos.length)
    for (let i = 0; i < this.formatoCrearVigencia.campos.length; i++){
      this.formatoCrearVigencia.campos[i].label = this.formatoCrearVigencia.campos[i].label_i18n;
      this.formatoCrearVigencia.campos[i].placeholder = this.formatoCrearVigencia.campos[i].label_i18n;
    }
  }
  cleanForm(){
    this.clean = !this.clean;
    this.formatoCrearVigencia.campos[FormManager.getIndexForm(this.formatoCrearVigencia, 'Codigo')].prefix.value = '';
  }
 
 /* validarForm(event){
   this.datosNuevaVigencia.CodigoCentroGestor = typeof event.data.FormatoNuevaVigencia.CodigoCentroGestor === 'undefined' ? undefined : event.data.Vigencia.CodigoCentroGestor;
    this.datosNuevaVigencia.CodigoAreaFuncional = typeof event.data.FormatoNuevaVigencia.CodigoAreaFuncional === 'undefined' ? undefined : event.data.Vigencia.CodigoAreaFuncional;
    this.datosNuevaVigencia.VigenciaEjecucion = typeof event.data.FormatoNuevaVigencia.VigenciaEjecucion === 'undefined' ? undefined : event.data.Vigencia.VigenciaEjecucion;
    this.datosNuevaVigencia.VigenciaProgramacion = typeof event.data.FormatoNuevaVigencia.VigenciaProgramacion === 'undefined' ? undefined :  event.data.Vigencia.VigenciaProgramacion;
  }*/
  
 }
