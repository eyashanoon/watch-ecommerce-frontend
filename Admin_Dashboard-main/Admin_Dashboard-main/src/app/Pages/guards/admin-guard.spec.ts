import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminGuard } from './admin-guard';
import { AuthService } from '../../Service/auth.service';
import { of } from 'rxjs';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'hasRole']);
    const routeSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routeSpy },
      ]
    });

    guard = TestBed.inject(AdminGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow admin', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.hasRole.and.returnValue(true);

    expect(guard.canActivate()).toBeTrue();
  });

  it('should block non-admin and redirect', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.hasRole.and.returnValue(false);

    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });
});
