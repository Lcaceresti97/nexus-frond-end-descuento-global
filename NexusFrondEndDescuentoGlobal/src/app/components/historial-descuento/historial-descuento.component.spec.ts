import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialDescuentoComponent } from './historial-descuento.component';

describe('HistorialDescuentoComponent', () => {
  let component: HistorialDescuentoComponent;
  let fixture: ComponentFixture<HistorialDescuentoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistorialDescuentoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialDescuentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
