import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent  } from './admin-dashboard.component';

describe('AdminDashboardComponent ', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent ], // because App is a standalone component
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AdminDashboardComponent );
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AdminDashboardComponent );
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
expect(compiled.querySelector('h1')?.textContent).toContain('La Royale Admin Dashboard');
  });
});
