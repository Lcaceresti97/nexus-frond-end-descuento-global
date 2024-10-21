import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDescuentoComponent } from './gestion-descuento.component';

describe('GestionDescuentoComponent', () => {
  let component: GestionDescuentoComponent;
  let fixture: ComponentFixture<GestionDescuentoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionDescuentoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionDescuentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
