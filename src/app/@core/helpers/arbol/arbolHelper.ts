import {CollectionViewer, SelectionChange, DataSource} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Injectable} from '@angular/core';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { RequestManager } from '../../managers/requestManager';

export class DynamicFlatNode {
  constructor(
    public item: any,
    public level = 1,
    public expandable = false,
    public isLoading = false,
  ) {}
}

export class DynamicDataSource implements DataSource<DynamicFlatNode> {
  children: any;
  dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);

  get data(): DynamicFlatNode[] {
    return this.dataChange.value;
  }
  set data(value: DynamicFlatNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeControl: FlatTreeControl<DynamicFlatNode>,
    private _database: ArbolHelper,
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
    this._treeControl.expansionModel.changed.subscribe(change => {
      if (
        (change as SelectionChange<DynamicFlatNode>).added ||
        (change as SelectionChange<DynamicFlatNode>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<DynamicFlatNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
    if (change.added) {
      change.added.forEach(node => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach(node => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  async toggleNode(node: DynamicFlatNode, expand: boolean) {
    node.isLoading = true;
    if ( expand && node.item.Hijos.length ) {
      await this._database.getChildren('2022', node.item.Codigo).then(res => {
        this.children = res[0].children;
      });
    }

    const index = this.data.indexOf(node);
    if (!this.children || index < 0) {
      node.isLoading = false;
      // If no children, or cannot find the node, no op
      return;
    }

    if (expand && this.children) {
      const nodes = this.children.map(
        name => new DynamicFlatNode(name.data, node.level + 1, !!name.Hijos.length),
      );
      this.children = [];
      this.data.splice(index + 1, 0, ...nodes);
    } else {
      let count = 0;
      for (let i = index + 1; i < this.data.length
        && this.data[i].level > node.level; i++, count++) {}
      this.data.splice(index + 1, count);
    }
    // notify the change
    this.dataChange.next(this.data);
    node.isLoading = false;
  }

  updateNode(node: any, parentId: string) {
    if (parentId === '') {
        const index = this.data.map(e => e.item.Id.toString() + (e.item.TipoNivelId ? e.item.TipoNivelId.Id.toString() : 'el')).
            indexOf(node.Id.toString() + (node.TipoNivelId ? node.TipoNivelId.Id.toString() : 'el'));
        this.data[index].item = node;
    } else {
        const parent = this.data.find(e => e.item.Id === parentId);
        const parentIndex = this.data.map(e => e.item.Id).indexOf(parentId);
        this.data[parentIndex].expandable = true;
        const nodes = <DynamicFlatNode>{ item: node, level: parent.level + 1, expandable: false };
        const expanded = parentIndex < this.data.length - 1 && this.data[parentIndex].expandable &&
            parent.level === this.data[parentIndex + 1].level - 1;
        if (expanded) {
            this.data.splice(parentIndex + 1, 0, nodes);
        }
    }
    this.dataChange.next(this.data);
  }
}

@Injectable({
    providedIn: 'root',
})
export class ArbolHelper {

    constructor(private rqManager: RequestManager) { }

    initialData(vigencia = '0', id: string , level = '0') {
      this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');
      const unidadEjecutora = 1;
      return this.rqManager.get(`arbol_rubro_apropiacion/arbol_apropiacion_valores/${unidadEjecutora}/${vigencia}/${id}?nivel=${level}`).pipe(
        map(
          (res) => {
            return res.map(
              node => new DynamicFlatNode(node.data, 0, !!node.data.Hijos.length),
            );
          },
        ),
      );
    }

    getChildren(vigencia = '0', id: string , level = '1') {
      this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');
      const unidadEjecutora = 1;
      return new Promise<any>(resolve => {
        this.rqManager.get(`arbol_rubro_apropiacion/arbol_apropiacion_valores/${unidadEjecutora}/${vigencia}/${id}?nivel=${level}`).toPromise().then(res => {
          resolve(res);
        },
        );
      });
    }

    /**
      * Gets full arbol
      *  returns full rubro's tree information (all nodes and branches).
      * @returns  data with tree structure for the ndTree module.
      */
    public getFullArbol(vigencia = '0') {
        this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');
        // this.rqManager.setPath('DUMMY_SERVICE');
        // Set the optional branch for the API request.
        const unidadEjecutora = 1;
        // const raiz = 3;
        // call request manager for the tree's data.
        return this.rqManager.get(`arbol_rubro_apropiacion/arbol_apropiacion_valores/${unidadEjecutora}/${vigencia}`);
    }
    /**
      * Gets full arbol
      *  returns full rubro's tree information (all nodes and branches).
      * @returns  data with tree structure for the ndTree module.
      */
    public getFullArbolbyID(vigencia = '0', id: string , level = '-1') {
        this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');
        // this.rqManager.setPath('DUMMY_SERVICE');
        // Set the optional branch for the API request.
        const unidadEjecutora = 1;
        // const raiz = 3;
        // call request manager for the tree's data.
        return this.rqManager.get(`arbol_rubro_apropiacion/arbol_apropiacion_valores/${unidadEjecutora}/${vigencia}/${id}?nivel=${level}`);
    }

    /**
      * Gets full nodo
      *  returns full rubro's tree information (all nodes and branches).
      * @returns  data with tree structure for the ndTree module.
      */
    public getFullNodobyID(vigencia = '0', id: string , level = '-1') {
        this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');
        // this.rqManager.setPath('DUMMY_SERVICE');
        // Set the optional branch for the API request.
        const unidadEjecutora = 1;
        // const raiz = 3;
        // call request manager for the tree's data.
        return this.rqManager.get(`arbol_rubro_apropiacion/arbol_apropiacion_valores/${unidadEjecutora}/${vigencia}/${id}?nivel=${level}`);
    }

    /**
      * Gets full arbol by Estado
      *  returns full rubro's tree information (all nodes and branches).
      * @returns  data with tree structure for the ndTree module.
      */
    public getFullArbolEstado(vigencia = '0', estado = 'registrada', params?: any) {

    let query = '';
    if (params) {
      const queryString = Object.keys(params).map(key => key + ':' + params[key]).join(',');
        query = `?query=${queryString}`;
    }
        this.rqManager.setPath('PLAN_CUENTAS_MONGO_SERVICE');
        // this.rqManager.setPath('DUMMY_SERVICE');
        // Set the optional branch for the API request.
        const unidadEjecutora = 1;
        // const raiz = 3;
        // call request manager for the tree's data.
        return this.rqManager.get(`arbol_rubro_apropiacion/arbol_por_estado/${unidadEjecutora}/${vigencia}/${estado}/${query}`);
    }

}
