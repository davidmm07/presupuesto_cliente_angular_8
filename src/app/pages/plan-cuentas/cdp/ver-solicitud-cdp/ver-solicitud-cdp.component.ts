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
import { Img, PdfMakeWrapper, Table } from 'pdfmake-wrapper';
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
        normal: `${window.location.origin}/assets/skins/lightgray/fonts/Calibri_Light.ttf`,
        bold: `${window.location.origin}/assets/skins/lightgray/fonts/Calibri_Bold.TTF`,
        italics: `${window.location.origin}/assets/skins/lightgray/fonts/Calibri_Light.ttf`,
        bolditalics: `${window.location.origin}/assets/skins/lightgray/fonts/Calibri_Light.ttf`,
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
    };

    // -------------------------------------------------------------------------------------

    const arreglo = [];

    // TODO: Parametrizar todo lo que sea de negocio, el 230, "Rector", "01", "02", etc; como mínimo de
    // constantes al comienzo del archivo, idealmente todas centralizadas en un servicio encargado de ello
    // TODO: Hacer que los textos siguientes vengan de i18n, Aplicar interpolación de variables
    // en la traducción y según sea necesario, para no concatenar traducciones con variables directamente

    pdf.create().getBlob(async (blob) => {
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
            await new Img(`${window.location.origin}/assets/images/logo_ud.png`).width(90).alignment('left').build(),
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
  }
}
