import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogDescuentoComponent } from './log-descuento.component';

describe('LogDescuentoComponent', () => {
  let component: LogDescuentoComponent;
  let fixture: ComponentFixture<LogDescuentoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogDescuentoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogDescuentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
