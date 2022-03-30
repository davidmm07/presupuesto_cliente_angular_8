import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArbolDinamicoComponent } from './arbol-dinamico.component';

describe('ArbolDinamicoComponent', () => {
  let component: ArbolDinamicoComponent;
  let fixture: ComponentFixture<ArbolDinamicoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArbolDinamicoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArbolDinamicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
