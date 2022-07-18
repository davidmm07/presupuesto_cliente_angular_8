import { Component, OnInit, Input, Output, EventEmitter, LOCALE_ID } from '@angular/core';
import { CDPHelper } from '../../../../@core/helpers/cdp/cdpHelper';
import { PlanAdquisicionHelper } from '../../../../@core/helpers/plan_adquisicion/planAdquisicionHelper';
import { CoreHelper } from '../../../../@core/helpers/core/coreHelper';
import { DependenciaHelper } from '../../../../@core/helpers/oikos/dependenciaHelper';
import { MovimientosHelper } from '../../../../@core/helpers/movimientos/movimientosHelper';
import { AdmAmazonHelper } from '../../../../@core/helpers/administrativa/admAmazonHelper';
import { NecesidadesHelper } from '../../../../@core/helpers/necesidades/necesidadesHelper';
import { DocumentoPresupuestalHelper } from '../../../../@core/helpers/documentoPresupuestal/documentoPresupuestalHelper';
import { PopUpManager } from '../../../../@core/managers/popUpManager';
import { Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { switchMap, mergeMap, map } from 'rxjs/operators';
import { ImplicitAutenticationService } from '../../../../@core/utils/implicit_autentication.service';
import { TranslateService } from '@ngx-translate/core';
import { VigenciaHelper } from '../../../../@core/helpers/vigencia/vigenciaHelper';
import { LastVersionPlanHelper } from '../../../../@core/helpers/plan_adquisicion/last-version-plan';
import { PdfMakeWrapper, Table } from 'pdfmake-wrapper';
import { Txt } from 'pdfmake-wrapper';
import pdfFonts from '../../../../../assets/skins/lightgray/fonts/custom-fonts.js';
import { CurrencyPipe, DatePipe } from '@angular/common';
import localEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localEs, 'es');

@Component({
  selector: 'ngx-ver-solicitud-cdp',
  templateUrl: './ver-solicitud-cdp.component.html',
  styleUrls: ['./ver-solicitud-cdp.component.scss'],
  providers: [CurrencyPipe, DatePipe, {provide: LOCALE_ID, useValue: 'en-US'}]
})
export class VerSolicitudCdpComponent implements OnInit {
  @Input('solicitudcdp') solicitud: object;
  @Input('expedido') expedido: boolean;
  @Output() eventChange = new EventEmitter();
  necesidad: any = {};
  TrNecesidad: any;
  tituloPDF: string = '';
  username: string;
  responsable: string;
  ordenadorGasto: string;
  valorActual: number;
  valorInicial: number;
  fechaExpedicion: Date;
  areaFuncional: object;
  centroGestor: object;
  estadoNecesidadRechazada: object;
  movimientosRp: any[];
  vigencia: string;
  disableButton: boolean = true;
  solicitante: any;
  cargo: any;
  tabla: any = {};
  solicitudCdp: any;

  nombre: string;
  cedula: string;
  numeroContrato: string;

  cargaNecesidad: boolean;
  cargaDependencias: boolean;

  mostrandoPDF: boolean = false;
  areas = { '1': 'Rector', '2': 'Convenios' };
  entidades = { '1': 'Universidad Distrital Francisco José de Caldas' };
  enlacePDF: string = 'assets/images/cdp_ejemplo.pdf';

  constructor(
    private cdpHelper: CDPHelper,
    private planAdquisicionHelper: PlanAdquisicionHelper,
    private coreHelper: CoreHelper,
    private dependenciaHelper: DependenciaHelper,
    private movimientosHelper: MovimientosHelper,
    private necesidadesHelper: NecesidadesHelper,
    private documentoPresuestalHelper: DocumentoPresupuestalHelper,
    private popManager: PopUpManager,
    private router: Router,
    private implicitAutenticationService: ImplicitAutenticationService,
    private admAmazonHelper: AdmAmazonHelper,
    private translate: TranslateService,
    private vigenciaHelper: VigenciaHelper,
    private lastVersionPlan: LastVersionPlanHelper,
    private currency: CurrencyPipe,
    private datePipe: DatePipe,
  ) {
    this.movimientosRp = [];
  }

  ngOnInit() {
    let trNecesidad: object;
    const errorMensaje = [];
    this.vigenciaHelper.getCurrentVigencia().subscribe((res) => {
      this.vigencia = res;
    });

    this.getInfoRp();
    this.cargaNecesidad = false;
    this.cdpHelper
      .getFullNecesidad(this.solicitud['necesidad'])
      .pipe(
        mergeMap((res) => {
          trNecesidad = res;
          this.areaFuncional =
            this.areas[trNecesidad['Necesidad']['AreaFuncional']];
          this.centroGestor = this.solicitud['centroGestor']
            ? this.entidades[this.solicitud['centroGestor']]
            : this.entidades[this.solicitud['CentroGestor']];
          return this.getInfoJefeDepdencia(
            trNecesidad['Necesidad']['DependenciaNecesidadId'][
              'JefeDepSolicitanteId'
            ]
          );
        })
      )
      .pipe(mergeMap((res) => this.getInfoDependencia(res['DependenciaId'])))
      .pipe(
        mergeMap((res) => {
          trNecesidad['Necesidad']['DependenciaNecesidadId'][
            'DependenciaSolicitante'
          ] = res;
          return this.lastVersionPlan.lastVersionPlan(
            trNecesidad['Necesidad']['PlanAnualAdquisicionesId']
          );
        })
      )
      .subscribe(
        (res) => {
          if (
            res &&
            res.registroplanadquisiciones &&
            res.registroplanadquisiciones.length
          ) {
            res.registroplanadquisiciones.forEach((registro) => {
              const actividades = registro.datos;
              if (trNecesidad['Rubros']) {
                trNecesidad['Rubros'].forEach((rubro: any) => {
                  rubro.MontoParcial = 0;
                  if (rubro.Metas) {
                    rubro.Metas.forEach((meta: any) => {
                      const actividadesRegistro = actividades.find(
                        (rubroActividad) => rubroActividad.Rubro === rubro.RubroId
                      );
                      if (!actividadesRegistro) {
                        this.disableButton = true;
                      } else {
                        this.disableButton = false;
                        const datosActividades = actividadesRegistro.datos[0];
                        const actividadesMetas =
                          datosActividades[
                            'registro_funcionamiento-metas_asociadas'
                          ];
                        meta['InfoMeta'] = actividadesMetas.filter(
                          (metatemp) =>
                            metatemp['MetaId']['Numero'].toString() ===
                            meta['MetaId']
                        )[0]['MetaId'];
                        if (meta['InfoMeta']) {
                          this.disableButton = false;
                        }
                        const actividadesPlan =
                          datosActividades[
                            'registro_plan_adquisiciones-actividad'
                          ];
                        if (meta.Actividades) {
                          meta.Actividades.forEach((act: any) => {
                            act['InfoActividad'] = actividadesPlan.filter(
                              (actividad) =>
                                actividad['actividad']['Id'].toString() ===
                                act['ActividadId']
                            );
                            if (act['InfoActividad']) {
                              this.disableButton = false;
                            } else {
                              return;
                            }
                            if (act.FuentesActividad) {
                              act.FuentesActividad.forEach((fuente: any) => {
                                rubro.MontoParcial += fuente.MontoParcial;
                              });
                            }
                          });
                        }
                      }
                    });
                  } else {
                    errorMensaje.push(
                      this.translate.instant(`ERROR.404`) + ' Metas en este CDP'
                    );
                    return;
                  }
                  if (rubro.Fuentes) {
                    rubro.Fuentes.forEach((fuente) => {
                      rubro.MontoParcial += fuente.MontoParcial;
                    });
                  }
                });
              } else {
                errorMensaje.push(
                  this.translate.instant(`ERROR.404`) + ' Rubros en este CDP'
                );
                return;
              }
            });
          } else {
            this.popManager.showErrorAlert(
              this.translate.instant(`ERROR.404`) +
                ' registros de plan de adquisiciones, No se puede consultar con vigencia ' +
                trNecesidad['Necesidad'].Vigencia
            );
            return;
          }
          if (errorMensaje.length > 0) {
            this.popManager.showErrorAlert(errorMensaje[0]);
            return;
          }
          this.TrNecesidad = trNecesidad;
          this.admAmazonHelper
            .getProveedor(
              this.TrNecesidad['Necesidad']['DependenciaNecesidadId'][
                'OrdenadorGastoId'
              ]
            )
            .subscribe(
              (res1) => {
                if (res1) {
                  this.ordenadorGasto = res1['NomProveedor'];
                }
                this.cargaNecesidad = true;
              },
              (error: any) => {
                this.popManager.showErrorToast(
                  this.translate.instant(`ERROR.${error['status']}`)
                );
              }
            );
        },
        (error: any) => {
          this.popManager.showErrorToast(
            this.translate.instant(`ERROR.${error['status']}`)
          );
        }
      );

    this.cargaDependencias = false;
    this.dependenciaHelper
      .get('', 'query=Nombre__contains:PRESUPUESTO')
      .pipe(
        mergeMap((res) =>
          this.coreHelper.getJefeDependenciaByDependencia(res[0]['Id'])
        )
      )
      .pipe(
        mergeMap((res: Array<object>) =>
          this.admAmazonHelper.getPersonaNatural(res[1]['TerceroId'])
        )
      )
      .subscribe((res: object) => {
        this.responsable =
          res['PrimerNombre'] +
          ' ' +
          res['SegundoNombre'] +
          ' ' +
          res['PrimerApellido'] +
          ' ' +
          res['SegundoApellido'];
        this.cargaDependencias = true;
      });

    if (this.implicitAutenticationService.live()) {
      this.username = this.implicitAutenticationService.getPayload().sub;
    }
  }

  private getInfoRp() {
    const movimientosRequest = [];
    if (this.solicitud['AfectacionIds']) {
      this.movimientosHelper
        .getByDocumentoPresupuestal(
          this.solicitud['Vigencia'],
          this.solicitud['CentroGestor'],
          this.solicitud['_id']
        )
        .subscribe((res: any) => {
          res.forEach((element) => {
            movimientosRequest.push(
              this.movimientosHelper.getByMovimientoPadre(
                this.solicitud['Vigencia'],
                this.solicitud['CentroGestor'],
                element._id
              )
            );
          });
          forkJoin(movimientosRequest).subscribe((res2) => {
            res2.forEach((element) => {
              if (element) {
                this.movimientosRp.push(element);
              }
            });
          });
        });
    }
  }

  getInfoMeta(planAdquisicionesId: Number): Observable<any> {
    return this.planAdquisicionHelper
      .getPlanAdquisicionByDependencia(planAdquisicionesId.toString())
      .pipe(
        map((res) => {
          if (res.length) {
            return res[0];
          }
        })
      );
  }

  getInfoJefeDepdencia(jefe_dependencia_id: Number): Observable<any> {
    return this.coreHelper.getJefeDependencia(jefe_dependencia_id.toString());
  }

  getInfoDependencia(dependencia: Number): Observable<any> {
    return this.dependenciaHelper.get(dependencia);
  }

  cambioTab() {
    this.eventChange.emit(false);
  }

  expedirCDP(consecutivo: number) {
    this.popManager
      .showAlert(
        'warning',
        `Expedir la solicitud de CDP ${consecutivo}`,
        'continuar'
      )
      .then((result) => {
        if (result.value) {
          const movimiento = this.construirDatosMovimiento();
          let consecutivoExpedido: number;
          this.movimientosHelper
            .postMovimiento(movimiento)
            .pipe(
              mergeMap((res) => {
                consecutivoExpedido = res['DocInfo']['Consecutivo'];
                return this.cdpHelper.expedirCDP(this.solicitud['_id']);
              })
            )
            .pipe(mergeMap(() => this.actualizarNecesidad()))
            .subscribe((res) => {
              if (res) {
                this.popManager.showSuccessAlert(
                  `Se expidió con éxito el CDP Nº ${consecutivoExpedido}`
                );
                this.router.navigate(['/pages/plan-cuentas/cdp']);
              }
            });
        }
      });
  }

  private actualizarNecesidad(): Observable<any> {
    let necesidad: object;
    const query = 'query=CodigoAbreviacionn:CDPE';
    return this.necesidadesHelper.getEstados(query).pipe(
      mergeMap((res) => {
        necesidad = this.TrNecesidad.Necesidad;
        necesidad['EstadoNecesidadId'] = res[0];
        return this.necesidadesHelper.putNecesidad(necesidad, necesidad['Id']);
      })
    );
  }

  private construirDatosMovimiento(): object {
    const movimiento = {
      Data: { solicitud_cdp: this.solicitud['_id'] },
      Tipo: 'cdp',
      Vigencia: this.vigencia,
      CentroGestor: String(this.solicitud['centroGestor']),
      AfectacionMovimiento: [],
    };

    this.TrNecesidad['Rubros'].forEach((rubro: object) => {
      movimiento.AfectacionMovimiento.push({
        MovimientoProcesoExternoId: {
          TipoMovimientoId: {
            Id: 6,
            Acronimo: 'cdp',
          },
        },
        DocumentoPadre: rubro['RubroId'],
        Valor: rubro['MontoParcial'],
        Descripcion: this.TrNecesidad['Necesidad']['Objeto'],
      });
    });
    return movimiento;
  }

  rechazarSolicitud() {
    this.popManager
      .showAlertInput(
        'warning',
        `Rechazar solicitud de CDP`,
        'Escriba la justificación del rechazo',
        'Es necesario escribir una justificación de rechazo',
        'textarea'
      )
      .then((result) => {
        if (result.value) {
          this.necesidadesHelper
            .getEstadoRechazado()
            .pipe(
              switchMap((estadoRechazada) => {
                if (estadoRechazada) {
                  const necesidad = this.TrNecesidad['Necesidad'];
                  necesidad['EstadoNecesidadId'] = estadoRechazada;
                  return this.necesidadesHelper.putNecesidad(
                    necesidad,
                    necesidad['Id']
                  );
                }
              })
            )
            .subscribe((res) => {
              if (res) {
                const necesidadRechazada = {
                  Justificacion: result.value,
                  NecesidadId: { Id: this.TrNecesidad['Necesidad']['Id'] },
                  FechaRechazo: new Date(),
                  ConsecutivoNecesidad:
                    this.TrNecesidad['Necesidad']['ConsecutivoNecesidad'],
                };
                this.necesidadesHelper
                  .postNecesidadRechazada(necesidadRechazada)
                  .subscribe();
              }
            });
        }
      });
  }

  mostrarPDF(consecutivo) {
    this.tituloPDF = `Certificado de disponibilidad presupuestal N° ${consecutivo}`;
    this.mostrandoPDF = !this.mostrandoPDF;
  }

  async anularCdp() {
    const { value: tipoAnulacion } = await this.popManager.showAlertRadio(
      'Seleccione el tipo de anulación',
      {
        anul_p_cdp: 'Anulación parcial',
        anul_t_cdp: 'Anulación total',
      },
      'Seleccione una opción'
    );

    if (tipoAnulacion === 'anul_p_cdp') {
      const { value: valorAnulacion } = await this.popManager.showAlertInput(
        'warning',
        'Valor de la anulación',
        'Ingrese el valor de la anulación',
        'Debe ingresar un valor',
        'text'
      );
      this.expedirMovimientoAnulacion(
        tipoAnulacion,
        parseFloat(valorAnulacion)
      );
    } else {
      const centroGestor = String(this.solicitud['centroGestor']);
      const vigencia = this.solicitud['vigencia'];
      this.documentoPresuestalHelper
        .get(
          vigencia,
          centroGestor,
          'data.solicitud_cdp:' + this.solicitud['_id']
        )
        .subscribe((res) => {
          this.expedirMovimientoAnulacion(tipoAnulacion, res['ValorActual']);
        });
    }
  }

  private expedirMovimientoAnulacion(tipoAnulacion: string, valor: number) {
    const centroGestor = String(this.solicitud['centroGestor']);
    const vigencia = this.solicitud['vigencia'];

    this.documentoPresuestalHelper
      .get(
        vigencia,
        centroGestor,
        'data.solicitud_cdp:' + this.solicitud['_id']
      )
      .pipe(
        mergeMap((documentoP) =>
          this.movimientosHelper
            .getByDocumentoPresupuestal(
              vigencia,
              centroGestor,
              documentoP[0]['_id']
            )
            .pipe(
              switchMap((movimientoD) => {
                const movimiento = {
                  Data: { cdp: documentoP[0]['_id'] },
                  Tipo: tipoAnulacion,
                  Vigencia: Number(this.solicitud['vigencia']),
                  CentroGestor: String(this.solicitud['centroGestor']),
                  AfectacionMovimiento: [
                    {
                      MovimientoProcesoExternoId: {
                        TipoMovimientoId: {
                          Id: 8,
                          Acronimo: tipoAnulacion,
                        },
                      },
                      DocumentoPadre: movimientoD[0]['_id'],
                      Valor: valor,
                      Descripcion: 'anulación parcial del cdp',
                    },
                  ],
                };
                return this.movimientosHelper.postMovimiento(movimiento);
              })
            )
        )
      )
      .subscribe((res) => {
        if (res) {
          this.popManager.showSuccessAlert('Se realizó la anulación del CDP');
          this.router.navigate(['/pages/plan-cuentas/cdp']);
        }
      });
  }

  obtenerInfo() {
    const dia = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.cdpHelper.cargoOrdenador(479, dia).subscribe(async res => {
      this.cdpHelper.ordenadorGasto(String(res[0].TerceroId)).subscribe(async res1 => {
        this.solicitante = res1[0].PrimerNombre.trim() + ' ' + res1[0].SegundoNombre.trim() + ' ' + res1[0].PrimerApellido.trim() + ' ' + res1[0].SegundoApellido.trim();
        this.cdpHelper.obtenerCargo(res[0].DependenciaId).subscribe(async res2 => {
          this.cargo = res2[0].Cargo;
          this.cdpHelper.obtenerSolCdp(this.solicitud['Data'].solicitud_cdp).subscribe(async res3 => {
            this.solicitudCdp = res3.consecutivo;
            this.crearTabla();
          });
        });
      });
    });
  }

  crearTabla() {
    const bodyAux = [];
    const header = [
      {
        border: [true, true, false, true],
        bold: true,
        text: 'CODIGO PRESUPUESTAL',
        widths: 'auto'
      },
      {
        border: [false, true, true, true],
        bold: true,
        text: '',
        widths: 'auto'
      },
      {
        border: [true, true, true, true],
        bold: true,
        text: 'CONCEPTO',
        widths: '*'
      },
      {
        border: [true, true, true, true],
        bold: true,
        text: 'VALOR',
        widths: 'auto'
      }
    ];
    bodyAux.push(header);
    for (let i = 0; i < this.TrNecesidad.Rubros.length; i++) {
      const aux = [
        {
          border: [false, false, false, false],
          text: this.TrNecesidad.Rubros[i].RubroId,
          fontSize: 10
        },
        {
          border: [false, false, false, false],
          text: ''
        },
        {
          border: [false, false, false, false],
          text: this.TrNecesidad.Rubros[i].InfoRubro.Descripcion,
          fontSize: 10
        },
        {
          border: [false, false, false, false],
          text: this.currency.transform(this.TrNecesidad.Rubros[i].MontoParcial, 'USD'),
          alignment: 'right',
          fontSize: 10
        }
      ];
      bodyAux.push(aux);
      if (this.TrNecesidad.Rubros[i].Fuentes.length > 0) {
        const fuenteAux = [
          {
            border: [false, false, false, false],
            text: '',
            fontSize: 10
          },
          {
            border: [false, false, false, false],
            text: 'Fuente',
            bold: true
          },
          {
            border: [false, false, false, false],
            text: ''
          },
          {
            border: [false, false, false, false],
            text: ''
          }
        ];
        bodyAux.push(fuenteAux);
        for (let j = 0; j < this.TrNecesidad.Rubros[i].Fuentes.length; j++) {
          const fuente = [
            {
              border: [false, false, false, false],
              text: '',
              fontSize: 10
            },
            {
              border: [false, false, false, false],
              text: this.TrNecesidad.Rubros[i].Fuentes[j].FuenteId,
              fontSize: 10
            },
            {
              border: [false, false, false, false],
              text: this.TrNecesidad.Rubros[i].Fuentes[j].InfoFuente.Descripcion,
              fontSize: 10
            },
            {
              border: [false, false, false, false],
              text: this.currency.transform(this.TrNecesidad.Rubros[i].MontoParcial, 'USD'),
              alignment: 'right',
              fontSize: 10
            }
          ];
          bodyAux.push(fuente);
        }
      }
      if (this.TrNecesidad.Rubros[i].Metas.length > 0) {
        for (let j = 0; j < this.TrNecesidad.Rubros[i].Metas.length; j++) {
          const metaAux = [
            {
              border: [false, false, false, false],
              text: '',
              fontSize: 10
            },
            {
              border: [false, false, false, false],
              text: 'Metas',
              fontSize: 10,
              bold: true
            },
            {
              border: [false, false, false, false],
              text: ''
            },
            {
              border: [false, false, false, false],
              text: ''
            }
          ];
          bodyAux.push(metaAux);
          const meta = [
            {
              border: [false, false, false, false],
              text: '',
              fontSize: 10
            },
            {
              border: [false, false, false, false],
              text: this.TrNecesidad.Rubros[i].Metas[j].InfoMeta.Numero,
              fontSize: 10
            },
            {
              border: [false, false, false, false],
              text: this.TrNecesidad.Rubros[i].Metas[j].InfoMeta.Nombre,
              fontSize: 10
            },
            {
              border: [false, false, false, false],
              text: ''
            }
          ];
          bodyAux.push(meta);
          for (let k = 0; k < this.TrNecesidad.Rubros[i].Metas[j].Actividades.length; k++) {
            const actividadAux = [
              {
                border: [false, false, false, false],
                text: '',
                fontSize: 10
              },
              {
                border: [false, false, false, false],
                text: 'Actividad',
                fontSize: 10,
                bold: true
              },
              {
                border: [false, false, false, false],
                text: ''
              },
              {
                border: [false, false, false, false],
                text: ''
              }
            ];
            bodyAux.push(actividadAux);
            const actividad = [
              {
                border: [false, false, false, false],
                text: '',
                fontSize: 10
              },
              {
                border: [false, false, false, false],
                text: this.TrNecesidad.Rubros[i].Metas[j].Actividades[k].InfoActividad[0].Numero,
                fontSize: 10
              },
              {
                border: [false, false, false, false],
                text: this.TrNecesidad.Rubros[i].Metas[j].Actividades[k].InfoActividad[0].Nombre,
                fontSize: 10
              },
              {
                border: [false, false, false, false],
                text: ''
              }
            ];
            bodyAux.push(actividad);
            const fuenteAux1 = [
              {
                border: [false, false, false, false],
                text: '',
                fontSize: 10
              },
              {
                border: [false, false, false, false],
                text: 'Fuente',
                fontSize: 10,
                bold: true
              },
              {
                border: [false, false, false, false],
                text: ''
              },
              {
                border: [false, false, false, false],
                text: ''
              }
            ];
            bodyAux.push(fuenteAux1);
            for (let l = 0; l < this.TrNecesidad.Rubros[i].Metas[j].Actividades[k].FuentesActividad.length; l++) {
              const fuentes = [
                {
                  border: [false, false, false, false],
                  text: '',
                  fontSize: 10
                },
                {
                  border: [false, false, false, false],
                  text: this.TrNecesidad.Rubros[i].Metas[j].Actividades[k].FuentesActividad[l].InfoFuente.Codigo,
                  fontSize: 10
                },
                {
                  border: [false, false, false, false],
                  text: this.TrNecesidad.Rubros[i].Metas[j].Actividades[k].FuentesActividad[l].InfoFuente.Descripcion,
                  fontSize: 10
                },
                {
                  border: [false, false, false, false],
                  text: this.currency.transform(this.TrNecesidad.Rubros[i].Metas[j].Actividades[k].FuentesActividad[l].MontoParcial, 'USD'),
                  fontSize: 10
                }
              ];
              bodyAux.push(fuentes);
            }
          }
        }
      }
    }

    const total = [
      {
        border: [false, false, false, false],
        text: '',
        margin: [0, 10, 0, 0]
      },
      {
        border: [false, false, false, false],
        text: '',
        margin: [0, 10, 0, 0]
      },
      {
        border: [false, false, false, false],
        bold: true,
        text: 'TOTAL:',
        fontSize: 10,
        alignment: 'right',
        margin: [0, 10, 50, 0]
      },
      {
        border: [false, false, false, false],
        bold: true,
        text: this.currency.transform(this.solicitud['ValorActual'], 'USD'),
        fontSize: 10,
        alignment: 'right',
        margin: [0, 10, 0, 0]
      }
    ];
    bodyAux.push(total);
    this.tabla = {
      style: 'cdp',
      table: {
        body: bodyAux,
        widths: ['auto', 'auto', '*', 'auto']
      },
    };
    this.crearPdf();
  }

  crearPdf() {
    PdfMakeWrapper.setFonts(pdfFonts, {
      myCustom: {
        normal: 'calibri-light-2.ttf',
        bold: 'calibri-bold-2.ttf',
        italics: 'calibri-light-2.ttf',
        bolditalics: 'calibri-light-2.ttf',
      },
    });
    PdfMakeWrapper.useFont('myCustom');

    const pdf = new PdfMakeWrapper();

    pdf.pageMargins([80, 10, 60, 30]);
    pdf.styles({
      Title: {
        bold: true,
        fontSize: 14,
        alignment: 'center',
      },
      body: {
        fontSize: 11,
        alignment: 'justify',
      },
      body1: {
        fontSize: 11,
        bold: true,
        alignment: 'justify',
      },
    });

    const docDefinition = {
      line: [
        {
          text:
            '___________________________________________',
          style: 'body',
          alignment: 'center'
        },
      ],
      tabla: [
        this.tabla
      ],
      escudoImagen: [
        {
          image:
            'data:image/png;base64,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',
          alignment: 'center',
          width: 90,
        },
      ],
    };

    // -------------------------------------------------------------------------------------

    const arreglo = [];

    pdf.create().getBlob((blob) => {
      const file = {
        IdDocumento: 16,
        file: blob,
        nombre: '',
      };
      arreglo.push(file);
      arreglo.forEach((file1) => {
        (file1.Id = file.nombre),
          (file.nombre =
            'cdp' +
            file1.Id);
        file1.key = file1.Id;
      });

      pdf.add(
        new Table([
          [
            docDefinition.escudoImagen,
            new Txt('UNIVERSIDAD DISTRITAL \n FRANCISCO JOSÉ DE CALDAS').style('Title').alignment('center').margin(20).fontSize(15).end
          ],
        ]).layout('noBorders').end,
      );

      pdf.add(new Txt('230 - UNIVERSIDAD DISTRITAL FRANCISCO JOSE DE CALDAS \n').style('Title').fontSize(12).end);

      pdf.add('\n');

      if (String(this.areaFuncional) === 'Rector') {
        pdf.add(new Txt('01 - ' + String(this.areaFuncional).toUpperCase()).style('Title').end);
      } else pdf.add(new Txt('02 - ' + String(this.areaFuncional).toUpperCase()).style('Title').end);

      pdf.add('\n');

      const datePipe: DatePipe = new DatePipe(this.translate.currentLang);

      pdf.add(new Txt('CERTIFICADO DE DISPONIBILIDAD PRESUPUESTAL').style('Title').fontSize(12).end);
      pdf.add(new Txt('No. Necesidad').fontSize(7.5).alignment('right').margin([0, -12, 0, 0]).end);
      pdf.add(new Txt(this.TrNecesidad.Necesidad.Consecutivo).fontSize(9).alignment('right').margin([0, 0, 10, 0]).end);
      pdf.add(new Txt('No.  ' + String(this.solicitud['Consecutivo']) ).style('Title').fontSize(12).margin([0, 0, 0, 0]).end);
      pdf.add('\n');
      pdf.add(new Txt('EL SUSCRITO RESPONSABLE DEL PRESUPUESTO \n CERTIFICA \n\n').style('Title').fontSize(12).end);
      pdf.add(new Txt('Que en el Presupuesto de Gastos e Inversiones de la vigencia ' + this.solicitud['Vigencia'] + ' existe apropiación disponible para atender la presente solicitud así:\n\n\n\n').fontSize(10).end);
      pdf.add(docDefinition.tabla);
      pdf.add('\n\n');
      pdf.add(new Txt('OBJETO:').style('Title').alignment('left').end);
      pdf.add(new Txt(this.TrNecesidad.Necesidad.Objeto).alignment('left').end);
      pdf.add('\n\n');
      pdf.add(new Txt('Se expide a solicitud de ' + this.solicitante + ', ' + this.cargo.toUpperCase() +  ', mediante oficio número CONSE ' +
        String(this.solicitudCdp) + ' de ' + datePipe.transform(this.solicitud['FechaRegistro'], 'MMMM') + ' ' +
        this.datePipe.transform(this.solicitud['FechaRegistro'], 'd') + ' del ' + this.datePipe.transform(this.solicitud['FechaRegistro'], 'y')).fontSize(10).end);
      pdf.add('\n\n');
      pdf.add(new Txt('Bogotá D.C., ' + this.datePipe.transform(new Date(), 'd') + ' de ' + datePipe.transform(new Date(), 'MMMM') + ' del '
      + datePipe.transform(new Date(), 'y')).end);
      pdf.add('\n\n\n\n\n');
      pdf.add(new Txt('_____________________________________________').alignment('center').end);
      pdf.add(new Txt(this.responsable).fontSize(12).style('Title').end);

      pdf.add('\n\n\n\n\n');
      pdf.add(new Txt('_____________________________________________').alignment('center').end);
      pdf.add(new Txt((this.username.split('@')[0]).toUpperCase()).fontSize(12).style('Title').end);
      pdf
        .create()
        .open();
      },
        (error) => { },
      );


   // this.regresarInicio();
  }
}
