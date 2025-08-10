import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditProductComponent } from './edit-product.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  // Import FormsModule here
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';  // Import this for mocking the route parameters

describe('EditProductComponent', () => {
  let component: EditProductComponent;
  let fixture: ComponentFixture<EditProductComponent>;

  // Mock ActivatedRoute to simulate route parameters
  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy().and.returnValue('1')  // Mocking the parameter 'id' as '1'
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        BrowserModule,
        FormsModule,
        RouterModule,
        RouterTestingModule,  // Use this for routing during tests
        CommonModule
      ],
      declarations: [EditProductComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute }  // Provide the mock
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Add more tests below, if needed
});
