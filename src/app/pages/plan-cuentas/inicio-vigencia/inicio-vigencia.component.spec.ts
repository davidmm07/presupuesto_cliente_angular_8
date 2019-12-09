import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioVigenciaComponent } from './inicio-vigencia.component';

describe('InicioVigenciaComponent', () => {
  let component: InicioVigenciaComponent;
  let fixture: ComponentFixture<InicioVigenciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InicioVigenciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InicioVigenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
