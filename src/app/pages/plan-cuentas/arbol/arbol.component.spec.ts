import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {HttpClientModule} from '@angular/common/http';

import {
  NbTreeGridModule,
  NbSelectModule,
  NbAlertModule,
  NbTabsetModule,
  NbStepperModule,
  NbCardModule,
  NbTooltipModule,
  NbCheckboxModule
} from '@nebular/theme';

import { ArbolComponent , FsIconAComponent } from './arbol.component';

describe('ArbolComponent', () => {
  let component: ArbolComponent;
  let fixture: ComponentFixture<ArbolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ArbolComponent, FsIconAComponent],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        FormsModule,
        NbTreeGridModule,
        NbSelectModule,
        NbAlertModule,
        NbTabsetModule,
        NbStepperModule,
        NbCardModule,
        NbTooltipModule,
        NbCheckboxModule
        // NbActionsModule,
        // NbLayoutModule,
        // NbMenuModule,
        // NbSearchModule,
        // NbSidebarModule,
        // NbUserModule,
        // NbContextMenuModule,
        // NbButtonModule,
        // NbSelectModule,
        // NbIconModule,
        // NbThemeModule,
        // NbCardModule,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArbolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
