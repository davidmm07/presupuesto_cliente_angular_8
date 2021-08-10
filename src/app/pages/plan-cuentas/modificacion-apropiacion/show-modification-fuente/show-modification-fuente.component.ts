import { Component, OnInit, SimpleChanges, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'ngx-show-modification-fuente',
  templateUrl: './show-modification-fuente.component.html',
  styleUrls: ['./show-modification-fuente.component.scss']
})
export class ShowModificationFuenteComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    this.afectationData = changes['afectationData'].currentValue;
}
constructor() { }
@Input() afectationData: Array<any>;
@Output() afectationDataChange = new EventEmitter();
@Input() readonly: boolean = false;
ngOnInit() { }
public removeAprData(daprData: any) {
    this.afectationData = this.afectationData.filter(data => data !== daprData);
    this.afectationDataChange.emit(this.afectationData);
}

}
