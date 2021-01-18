import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FredGaugeComponent } from './fred-gauge.component';

describe('FredGaugeComponent', () => {
  let component: FredGaugeComponent;
  let fixture: ComponentFixture<FredGaugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FredGaugeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FredGaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
