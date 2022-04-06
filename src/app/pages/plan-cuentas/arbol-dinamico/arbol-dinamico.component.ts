import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import { forkJoin } from 'rxjs';
import { ArbolHelper, DynamicDataSource, DynamicFlatNode } from '../../../@core/helpers/arbol/arbolHelper';

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
  selector: 'ngx-arbol-dinamico',
  templateUrl: './arbol-dinamico.component.html',
  styleUrls: ['./arbol-dinamico.component.scss']
})
export class ArbolDinamicoComponent implements OnChanges {
  @Output() rubroSeleccionado = new EventEmitter<EstructuraArbolRubrosApropiaciones>();
  @Input() vigencia: string;
  idHighlight: any;
  vigenciaSeleccionada: string;

  constructor(private database: ArbolHelper) {
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database);
  }

  ngOnChanges(changes) {
    if (changes.vigencia !== undefined) {
      if (changes.vigencia.currentValue !== undefined) {
        this.vigenciaSeleccionada = changes.vigencia.currentValue;
        this.loadTree();
      }
    }
  }

  loadTree() {
    forkJoin({
      raiz2: this.database.initialData(this.vigenciaSeleccionada, '2', '0'),
      raiz3: this.database.initialData(this.vigenciaSeleccionada, '3', '0')
    }).subscribe(res => {
      const respuesta = res.raiz2.concat(res.raiz3);
      this.dataSource.data = respuesta;
    });
  }

  getSelectedRow(selectedRow) {
    this.rubroSeleccionado.emit(selectedRow);
  }

  treeControl: FlatTreeControl<DynamicFlatNode>;

  dataSource: DynamicDataSource;

  getLevel = (node: DynamicFlatNode) => node.level;

  isExpandable = (node: DynamicFlatNode) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;

}
