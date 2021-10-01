import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import {
  NbTreeGridModule,
  NbSelectModule,
  NbAlertModule,
  NbTabsetModule,
  NbStepperModule,
  NbCardModule,
  NbTooltipModule,
  // NbRadioModule,
  NbToastrService,
  NbSpinnerModule,
  NbCheckboxModule
} from '@nebular/theme';

import { ArbolComponent, FsIconAComponent } from './arbol.component';

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
        // NbRadioModule,
        NbSpinnerModule,
        NbCheckboxModule
      ],
      providers: [ NbToastrService ]
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
