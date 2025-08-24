import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './app/Service/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Page flags
  isAdminProfilePage = false;
  isCustomerProfilePage = false;
  isControlAdmins = false;
  isHomePage = false;
  isAddProductPage = false;
  isAdminDashBoard = false;
  isCustomerDashBoard = false;
  isProductsPage = false;
  isManageAdmins = false;
  isAdminProductDetails = false;
  isCustomerProductDetails = false;
  isWishlistPage = false;   // ✅ new

  // User info
  userName: string = '';
  userEmail: string = '';
  userRole: string = '';

  constructor(private router: Router, public authService: AuthService) {} // made public so template can access

  ngOnInit(): void {
    // Load user info initially
    this.loadUserInfo();

    // Update page flags and user info on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updatePageFlags(event.url);
      this.loadUserInfo();
    });
  }

  loadUserInfo() {
    if (!this.authService.isLoggedIn()) {
      this.userName = this.userEmail = this.userRole = '';
      return;
    }

    this.userEmail = this.authService.getEmailFromToken() || '';
    const roles = this.authService.getUserRoles();
    this.userRole = roles.includes('ADMIN') ? 'Admin' : 'Customer';
    const userId = this.authService.getUserId();

    if (!userId) return;

    if (roles.includes('ADMIN')) {
      this.authService.getAdminById(userId).subscribe({
        next: (res: any) => this.userName = res.name || res.username || 'Admin',
        error: () => this.userName = 'Admin'
      });
    } else {
      this.authService.getCustomerById(userId).subscribe({
        next: (res: any) => this.userName = res.name || res.username || 'Customer',
        error: () => this.userName = 'Customer'
      });
    }
  }

  updatePageFlags(url: string) {
    this.isAdminProfilePage = url === '/admin-profile';
    this.isCustomerProfilePage = url === '/customer-profile';
    this.isHomePage = url === '/home' || url === '/';
    this.isAddProductPage = url.includes('/add-product');
    this.isAdminDashBoard = url === '/admin';
    this.isCustomerDashBoard = url === '/customer-dash-board';
    this.isProductsPage = url === '/product';
    this.isManageAdmins = url.includes('admin/manage');
    this.isAdminProductDetails = url.startsWith('/admin-product/');
    this.isCustomerProductDetails = url.startsWith('/product/') && !this.isProductsPage;
    this.isControlAdmins = url === '/control-admins';
    this.isWishlistPage = url === '/wishlist'; // ✅ new
  }

  // 🔹 Navigation
  goToHome() { this.router.navigate(['/home']); }
  goToProducts() { this.router.navigate(['/product']); }
  goToCart() { this.router.navigate(['/cart']); }           // ✅ new
  goToWishlist() { this.router.navigate(['/wishlist']); }   // ✅ new
  goToAdminPanel() { this.router.navigate(['/admin']); }
  goToCustomerPanel() { this.router.navigate(['/customer-dash-board']); }
  goToCustomerDashboard() { this.router.navigate(['/customer-dash-board']); } // ✅ new
  goToSignInPage() { this.router.navigate(['/sign-in']); }
  goToSignUpPage() { this.router.navigate(['/sign-up']); }

  // 🔹 Cart count
  get cartCount(): number {   // ✅ new
    try {
      const raw = localStorage.getItem('cart') || '[]';
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.reduce((sum, item) => sum + (Number(item.selectedQty || 1)), 0)
        : 0;
    } catch {
      return 0;
    }
  }

  // 🔹 Utility
  scrollToAbout(event: Event) {
    event.preventDefault();
    if (this.isHomePage) {
      const el = document.querySelector('#about');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/home'], { fragment: 'about' });
    }
  }

  goToPanel() {
    const roles = this.authService.getUserRoles();
    if (roles.includes('CUSTOMER')) this.router.navigate(['/customer-dash-board']);
    else if (roles.includes('ADMIN')) this.router.navigate(['/admin']);
    else this.router.navigate(['/home']);
  }

  signOut(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/']);
    this.userName = this.userEmail = this.userRole = '';
  }
}
