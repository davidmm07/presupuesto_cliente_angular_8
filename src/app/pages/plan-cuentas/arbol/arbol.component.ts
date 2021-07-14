import { Component, OnInit , Input, EventEmitter, Output, OnChanges, ViewChildren, ElementRef, Renderer2 } from '@angular/core';
import {
  NbGetters,
  NbSortDirection,
  NbTreeGridRowComponent,
  NbTreeGridDataSource,
  NbTreeGridDataSourceBuilder,
  NbSortRequest
} from '@nebular/theme';
import { Observable, forkJoin } from 'rxjs';
import { ArbolHelper } from '../../../@core/helpers/arbol/arbolHelper';
import { RubroHelper } from '../../../@core/helpers/rubros/rubroHelper';
import { registerLocaleData } from '@angular/common';

import locales from '@angular/common/locales/es-CO';
import { zip } from 'rxjs';

registerLocaleData(locales, 'co');

interface EstructuraArbolRubrosApropiaciones {
  Codigo: string;
  Descripcion?: string;
  ValorInicial: number;
  Hijos?: EstructuraArbolRubrosApropiaciones[];
  Movimientos?: string[];
  Padre?: string;
  UnidadEjecutora: number;
  Estado?: string;
  IsLeaf: boolean;
  expanded?: boolean;
  isHighlighted?: boolean;
  data?: EstructuraArbolRubrosApropiaciones;
  children?: EstructuraArbolRubrosApropiaciones[];
}



@Component({
  selector: 'ngx-arbol',
  templateUrl: './arbol.component.html',
  styleUrls: ['./arbol.component.scss'],
})
export class ArbolComponent implements OnInit, OnChanges {
  @Output() rubroSeleccionado = new EventEmitter();
  @Input() updateSignal: Observable<string[]>;
  @Input() optionSelect: string;
  @Input() vigencia: string;
  @Input() externalSearch: string;
  @Input('paramsFieldsName') paramsFieldsName: object;
  opcionSeleccionada: string;
  vigenciaSeleccionada: string;
  @ViewChildren(NbTreeGridRowComponent, { read: ElementRef }) treeNodes: ElementRef[];

  update: any;
  customColumn = 'Codigo';
  defaultColumns = ['Nombre'];
  hasListener: any[] = [];
  oldHighlight: ElementRef;

  allColumns = [this.customColumn, ...this.defaultColumns];
  dataSource: NbTreeGridDataSource<EstructuraArbolRubrosApropiaciones>;
  dataSource2: NbTreeGridDataSource<EstructuraArbolRubrosApropiaciones>;

  sortColumn: string;
  sortDirection: NbSortDirection = NbSortDirection.NONE;
  idHighlight: any;
  isSelected: boolean;
  searchValue: string;
  nodo: any;
  barra: any;

  loading = true;

  constructor(
    private renderer: Renderer2,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<EstructuraArbolRubrosApropiaciones>,
    private dataSourceBuilder2: NbTreeGridDataSourceBuilder<EstructuraArbolRubrosApropiaciones>,
    private treeHelper: ArbolHelper,
    private rubroHelper: RubroHelper) {

  }

  ngOnInit() {
    this.barra = 0;
  }

  ngOnChanges(changes) {
    if (changes.optionSelect !== undefined) {
      if (changes.optionSelect.currentValue !== undefined) {
        this.opcionSeleccionada = changes.optionSelect.currentValue;
        this.loadTree();
      }
    }
    if (changes.vigencia !== undefined) {
      if (changes.vigencia.currentValue !== undefined) {
        this.vigenciaSeleccionada = changes.vigencia.currentValue;
        this.loadTree();
      }
    }
    if (changes['updateSignal'] && this.updateSignal) {
      this.updateSignal.subscribe(() => {
        this.loadTree();
      });
    }
    if (changes['externalSearch'] && changes['externalSearch'].currentValue) {
      this.searchValue = changes['externalSearch'].currentValue;
    }
    if (changes['paramsFieldsName'] && changes['paramsFieldsName'].currentValue) {
      this.paramsFieldsName = changes['paramsFieldsName'].currentValue;
    }
  }

  // private data: TreeNode<EstructuraArbolRubrosApropiaciones>[] | TreeNode<EstructuraArbolRubros>[];

  private data: EstructuraArbolRubrosApropiaciones[];
  // private data2: EstructuraArbolRubrosApropiaciones[];
  private reduceData: EstructuraArbolRubrosApropiaciones[];
  loadTreeRubros() {
    const getters: NbGetters<EstructuraArbolRubrosApropiaciones, EstructuraArbolRubrosApropiaciones> = {
      dataGetter: (node: EstructuraArbolRubrosApropiaciones) => node.data || null ,
      childrenGetter: (node: EstructuraArbolRubrosApropiaciones) => !!node.children && !!node.children.length  ?  node.children : [] ,
      expandedGetter: (node: EstructuraArbolRubrosApropiaciones) => !!node.expanded ,
    };

    forkJoin(
      {
        root_2: this.rubroHelper.getArbolReducido('2', '2'),
        root_3: this.rubroHelper.getArbolReducido('3', '2'),
      }
    ).
    subscribe((res) => {
      const hijos_2  = this.consultarHijos(res.root_2, '2');
      const hijos_3  = this.consultarHijos(res.root_3, '2');
      this.barra = 30;
      const hijos = hijos_2.concat(hijos_3);
      const obs: any[] = [];
      for ( const hijo of hijos) {
        obs.push(this.rubroHelper.getArbolReducido(hijo, '-1'));
      }
      this.barra = 60;
      zip(...obs)
      .subscribe((resHijos) => {
        res.root_2 = this.reconstruirArbol(res.root_2, resHijos, '2');
        res.root_3 = this.reconstruirArbol(res.root_3, resHijos.slice(hijos_2.length, hijos_2.length + hijos_3.length), '2');
        this.barra = 90;
        this.reduceData = res.root_2.concat(res.root_3);
        this.dataSource = this.dataSourceBuilder.create(this.reduceData, getters);
        this.loadedTreeRubros();
      });
    });
  }

  loadedTreeRubros() {
    this.loading = false;
    this.barra = 0;
  }

  loadTreeApropiaciones() {
    const getters: NbGetters<EstructuraArbolRubrosApropiaciones, EstructuraArbolRubrosApropiaciones> = {
      dataGetter: (node: EstructuraArbolRubrosApropiaciones) => node.data || undefined,
      childrenGetter: (node: EstructuraArbolRubrosApropiaciones) => !!node.children && !!node.children.length ? node.children : [],
      expandedGetter: (node: EstructuraArbolRubrosApropiaciones) => !!node.expanded,
    };
    this.customColumn = 'Codigo';
    this.defaultColumns = ['Nombre', 'ValorInicial'];
    this.allColumns = [this.customColumn, ...this.defaultColumns];

    if (this.vigenciaSeleccionada) {
      forkJoin(
        {
          raiz_2: this.treeHelper.getFullArbolbyID(this.vigenciaSeleccionada, '2', '2'),
          raiz_3: this.treeHelper.getFullArbolbyID(this.vigenciaSeleccionada, '3', '2'),
          raiz_4: this.treeHelper.getFullArbolbyID(this.vigenciaSeleccionada, '2-00-991-00', '1'),
          raiz_5: this.treeHelper.getFullArbolbyID(this.vigenciaSeleccionada, '3-00-991-00', '1'),
          raiz_6: this.treeHelper.getFullNodobyID(this.vigenciaSeleccionada, '2-00-991-00-00-29', '0'),
          raiz_7: this.treeHelper.getFullNodobyID(this.vigenciaSeleccionada, '3-00-991-00-00-29', '0'),

        }
      ).
      subscribe((res) => {
        const hijos_2  = this.consultarHijos(res.raiz_2, '2');
        hijos_2[0] = '2-01-001-02'; // evita consultar la raiz 2-00-991-00 ya que se realiza aparte
        const hijos_3  = this.consultarHijos(res.raiz_3, '2');
        hijos_3[0] = '3-01-001-01'; // evita consultar la raiz 3-00-991-00 ya que se realiza aparte
        const hijos_2_1  = this.consultarHijos(res.raiz_4, '1');
        hijos_2_1[4] = '2-00-991-00-00-00'; // evita consultar la raiz 2-00-991-00-00-29 ya que se realiza aparte
        const hijos_3_1  = this.consultarHijos(res.raiz_5, '1');
        hijos_3_1[3] = '3-00-991-00-00-01'; // evita consultar la raiz 3-00-991-00-00-29 ya que se realiza aparte
        const hijos = hijos_2.concat(hijos_3, hijos_2_1, hijos_3_1);
        const obs: any[] = [];
        this.barra = 40;
        for ( const hijo of hijos) {
          obs.push(this.treeHelper.getFullArbolbyID(this.vigenciaSeleccionada, hijo, '-1'));
        }
        zip(...obs).subscribe((resHijos) => {
          res.raiz_2 = this.reconstruirArbol(res.raiz_2, resHijos, '2');
          res.raiz_3 = this.reconstruirArbol(res.raiz_3, resHijos.slice(hijos_2.length, hijos_2.length + hijos_3.length), '2');
          res.raiz_4 = this.reconstruirArbol(res.raiz_4, resHijos.slice(hijos_2.length + hijos_3.length, hijos_2.length + hijos_3.length + hijos_2_1.length), '1');
          res.raiz_5 = this.reconstruirArbol(res.raiz_5, resHijos.slice(hijos_2.length + hijos_3.length + hijos_2_1.length, ), '1');


          res.raiz_4[0].children[0].children[4] = res.raiz_6[0];
          res.raiz_5[0].children[0].children[3] = res.raiz_7[0];

          this.barra = 80;

          const childrenData2 = { children : []};
          childrenData2.children = childrenData2.children.concat(res.raiz_4);
          res.raiz_2[0].children[0].children[0].children[0] = Object.assign(res.raiz_2[0].children[0].children[0], childrenData2);

          const childrenData3 = { children : []};
          childrenData3.children = childrenData3.children.concat(res.raiz_5);
          res.raiz_3[0].children[0].children[0].children[0] = Object.assign(res.raiz_3[0].children[0].children[0], childrenData3);

          this.data = res.raiz_2.concat(res.raiz_3);
          this.dataSource2 = this.dataSourceBuilder2.create(this.data, getters);
          this.loadedTreeRubros();
        });
      });
    }
  }

  reconstruirArbol(raiz: any , hijos: any, nivel: string) {
    if (nivel === '2') {
      let contador: number = 0;
      raiz[0].children.forEach((element, index)  => {
        raiz[0].children[index].children.forEach((element2, index2)  => {
          const childrenData2 = { children : []};
          raiz[0].children[index].children[index2].Hijos.forEach((element3, index3) => {
            childrenData2.children = childrenData2.children.concat(hijos[contador]);
            raiz[0].children[index].children[index2] = Object.assign(raiz[0].children[index].children[index2], childrenData2);
            contador += 1;
         });
        });
      });
      return raiz;
    } else {
      let contador: number = 0;
      raiz[0].children.forEach((element, index)  => {
        const childrenData2 = { children : []};
        raiz[0].children[index].Hijos.forEach((element2, index2)  => {
            childrenData2.children = childrenData2.children.concat(hijos[contador]);
            raiz[0].children[index] = Object.assign(raiz[0].children[index], childrenData2);
            contador += 1;

        });
      });
      return raiz;
    }

  }

  consultarHijos(raiz: any, nivel: string)  {

    if (nivel === '2') {
      const hijos: string[] = [];
      raiz[0].children.forEach((element, index)  => {
         raiz[0].children[index].children.forEach((element2, index2)  => {
           raiz[0].children[index].children[index2].Hijos.forEach((element3, index3) => {
            hijos.push(element3);
          });
         });
      });
      return hijos;
    } else {
      const hijos: string[] = [];
      raiz[0].children.forEach((element, index)  => {
         raiz[0].children[index].Hijos.forEach((element2, index2)  => {
            hijos.push(element2);
         });
      });
      return hijos;
    }

  }

  loadTreeApropiacionesEstado() {
    const getters: NbGetters<EstructuraArbolRubrosApropiaciones, EstructuraArbolRubrosApropiaciones> = {
      dataGetter: (node: EstructuraArbolRubrosApropiaciones) => node.data || undefined,
      childrenGetter: (node: EstructuraArbolRubrosApropiaciones) => !!node.children && !!node.children.length ? node.children : [],
      expandedGetter: (node: EstructuraArbolRubrosApropiaciones) => !!node.expanded,
    };
    this.customColumn = 'Codigo';
    this.defaultColumns = ['Nombre', 'ValorInicial', 'ValorActual'];
    this.allColumns = [this.customColumn, ...this.defaultColumns];
    if (this.vigenciaSeleccionada) {
      this.treeHelper.getFullArbolEstado(this.vigenciaSeleccionada, 'aprobada', this.paramsFieldsName ? this.paramsFieldsName : '').subscribe(res => {
        this.data = res;
        this.dataSource2 = this.dataSourceBuilder2.create(this.data, getters);
        this.loadedTreeRubros();
      },
      );
    }
  }

  loadTree() {
    if (this.opcionSeleccionada === 'Rubros') {
      this.loadTreeRubros();
    } else if (this.opcionSeleccionada === 'Apropiaciones') {
      this.loadTreeApropiaciones();
    } else if (this.opcionSeleccionada === 'ApropiacionesEstado') {
      this.loadTreeApropiacionesEstado();
    }
  }
  updateTreeSignal($event) {
    this.loadTree();
  }

  updateSort(sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  getSortDirection(column: string): NbSortDirection {
    if (this.sortColumn === column) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
  }

  async onSelect(selectedItem: any, treegrid) {

    this.idHighlight = treegrid.elementRef.nativeElement.getAttribute('data-picker');
    this.rubroSeleccionado.emit(selectedItem.data);
  }

  getShowOn(index: number) {
    const minWithForMultipleColumns = 400;
    const nextColumnStep = 100;
    return minWithForMultipleColumns + nextColumnStep * index;
  }

  updateHighlight(newHighlight: ElementRef, row) {
    this.oldHighlight && this.renderer.setStyle(this.oldHighlight.nativeElement, 'background', 'white');
    if (row.Codigo === this.idHighlight) {
      this.renderer.setStyle(newHighlight.nativeElement, 'background', 'lightblue');
    }
    this.oldHighlight = newHighlight;
  }

  validHighlight(selectedItem: any, treegrid) {
    if (selectedItem.data.Codigo === this.idHighlight) {
      this.updateHighlight(treegrid.elementRef, selectedItem.data);
      return true;
    }
    return false;
  }

}

@Component({
  selector: 'ngx-nb-fs-icon',
  template: `
    <nb-tree-grid-row-toggle
      [expanded]="expanded"
      *ngIf="isDir(); else fileIcon"
    >
    </nb-tree-grid-row-toggle>
    <ng-template #fileIcon> </ng-template>
  `,
})
export class FsIconAComponent {
  @Input() kind: string;

  @Input() expanded: boolean;

  isDir(): boolean {
    return this.kind === 'dir';
  }
}
