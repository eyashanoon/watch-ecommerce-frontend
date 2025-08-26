import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './app/Service/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Page flags
  isAdminProfilePage = false;
  isCustomer = false;
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
   isWishlistPage = false; 
  isCartPage = false;
 isSignInPage = false;
  isSignUpPage = false;
  isOrdersPage = false;

  // User info
  userName: string = '';
  userEmail: string = '';
  userRole: string = '';

  constructor(private router: Router, public authService: AuthService) {} // made public so template can access

  ngOnInit(): void {
    // Load user info initially
    this.loadUserInfo();
    this.isCustomer = this.authService.hasRole('CUSTOMER');

    // Update page flags and user info on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updatePageFlags(event.url);
      this.loadUserInfo();
    });
  }
handleLogoClick() {
  if (this.authService.isLoggedIn()) {
    const roles = this.authService.getUserRoles();
    if (roles.includes('ADMIN')) {
      this.router.navigateByUrl('/admin', { skipLocationChange: false });
    } else if (roles.includes('CUSTOMER')) {
      this.router.navigateByUrl('/home', { skipLocationChange: false });
    } else {
      location.reload();
    }
  } else {
          this.router.navigateByUrl('/home', { skipLocationChange: false });
  }
}



loadUserInfo() {
  if (!this.authService.isLoggedIn()) {
    this.userName = '';
    return;
  }
  const userId = this.authService.getUserId();
  if (!userId) return;

  const roles = this.authService.getUserRoles();
  

  if (roles.includes('ADMIN')) {
    this.authService.getAdminById(userId).subscribe({
      next: (res: any) => {
        console.log('Admin data:', res);
        this.userName = res.name || res.username || this.generateNameFromEmail(this.authService.getEmailFromToken() || '');
        
      },
      error: () => {
        this.userName = this.generateNameFromEmail(this.authService.getEmailFromToken() || '');
      }
    });
  } else {
this.authService.getCustomerById(userId).subscribe({
  next: (res: any) => {
    console.log('Customer data:', res);
    this.userName = res.username || res.name || this.generateNameFromEmail(this.authService.getEmailFromToken() || '');
  },
  error: (err) => {
    console.error('Failed to fetch customer:', err);
    this.userName = this.generateNameFromEmail(this.authService.getEmailFromToken() || '');
  }
});

  }
}



// 🔹 Utility to generate a name from email
generateNameFromEmail(email: string): string {
  if (!email) return '';
  const namePart = email.split('@')[0];       // "d.d" from "d@d.d"
  return namePart.replace('.', ' ').replace('_', ' ').replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
}



updatePageFlags(url: string) {
  this.isSignInPage = url === '/sign-in';
  this.isSignUpPage = url === '/sign-up';

  // existing flags...
  this.isAdminProfilePage = url === '/admin-profile';
  this.isCustomerProfilePage = url === '/customer-profile';
  this.isHomePage = url === '/home' || url === '/';
  this.isAddProductPage = url.includes('/add-product');
  this.isAdminDashBoard = url === '/admin';
  this.isCustomerDashBoard = url === '/home';
  this.isProductsPage = url === '/product';
  this.isManageAdmins = url.includes('admin/manage');
  this.isAdminProductDetails = url.startsWith('/admin-product/');
  this.isCustomerProductDetails = url.startsWith('/product/') && !this.isProductsPage;
  this.isControlAdmins = url === '/control-admins';
  this.isWishlistPage = url === '/wishlist'; 
  this.isCartPage = url === '/cart';          
  this.isOrdersPage = url === '/orders';
}


  // 🔹 Navigation
  goToHome() { this.router.navigate(['/home']); }
  goToProducts() { this.router.navigate(['/product']); }
  goToCart() { this.router.navigate(['/cart']); }         
  goToWishlist() { this.router.navigate(['/wishlist']); }
  goToAdminPanel() { this.router.navigate(['/admin']); }
  goToCustomerPanel() { this.router.navigate(['/home']); }
  goToCustomerDashboard() { this.router.navigate(['/home']); } // ✅ new
  goToSignInPage() { this.router.navigate(['/sign-in']); }
  goToSignUpPage() { this.router.navigate(['/sign-up']); }
goToCustomerOrders() { this.router.navigate(['/customer/orders']); }



  goToPanel() {
    const roles = this.authService.getUserRoles();
    if (roles.includes('CUSTOMER')) this.router.navigate(['/home']);
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
