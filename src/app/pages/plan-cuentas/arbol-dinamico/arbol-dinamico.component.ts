import {FlatTreeControl} from '@angular/cdk/tree';
import {Component} from '@angular/core';
import { ArbolHelper, DynamicDataSource, DynamicFlatNode } from '../../../@core/helpers/arbol/arbolHelper';

@Component({
  selector: 'ngx-arbol-dinamico',
  templateUrl: './arbol-dinamico.component.html',
  styleUrls: ['./arbol-dinamico.component.scss']
})
export class ArbolDinamicoComponent {

  constructor(database: ArbolHelper) {
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database);
    database.initialData("2022","2","0").subscribe(res => {
      this.dataSource.data = res;
    });
  }

  treeControl: FlatTreeControl<DynamicFlatNode>;

  dataSource: DynamicDataSource;

  getLevel = (node: DynamicFlatNode) => node.level;

  isExpandable = (node: DynamicFlatNode) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;

}
