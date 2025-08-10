import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDashBoardComponent } from './customer-dash-board.component';

describe('CustomerDashBoard', () => {
  let component: CustomerDashBoardComponent;
  let fixture: ComponentFixture<CustomerDashBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDashBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDashBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
