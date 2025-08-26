// src/app/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../Service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

 canActivate(): boolean {
  if (!this.authService.isLoggedIn() || 
      !(this.authService.hasRole('admin') || this.authService.hasRole('OWNER'))) {
    this.router.navigate(['/home']); // Redirect to home
    return false;
  }
  return true; // ✅ Allow access
}
}
