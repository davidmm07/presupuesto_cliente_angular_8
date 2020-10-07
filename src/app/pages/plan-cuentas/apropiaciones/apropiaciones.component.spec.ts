import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
// import { ThemeModule } from '../../../@theme/theme.module';
import {
  NbActionsModule,
  NbLayoutModule,
  NbMenuModule,
  NbSearchModule,
  NbSidebarModule,
  NbUserModule,
  NbContextMenuModule,
  NbButtonModule,
  NbSelectModule,
  NbIconModule,
  NbThemeModule,
  NbCardModule,
} from '@nebular/theme';


import { ApropiacionesComponent } from './apropiaciones.component';

describe('ApropiacionesComponent', () => {
  let component: ApropiacionesComponent;
  let fixture: ComponentFixture<ApropiacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApropiacionesComponent],
      imports: [
        TranslateModule.forRoot(),
        NbActionsModule,
        NbLayoutModule,
        NbMenuModule,
        NbSearchModule,
        NbSidebarModule,
        NbUserModule,
        NbContextMenuModule,
        NbButtonModule,
        NbSelectModule,
        NbIconModule,
        NbThemeModule,
        NbCardModule,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApropiacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
