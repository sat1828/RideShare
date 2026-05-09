import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PillionComponent } from './pillion.component';

describe('PillionComponent', () => {
  let component: PillionComponent;
  let fixture: ComponentFixture<PillionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PillionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PillionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
