import { Component } from '@angular/core';
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
export class AppComponent {
  isAdminProfilePage = false;
  isControlAdmins=false;
  isHomePage = false;
  isAddProductPage = false;
  isAdminDashBoard = false;
  isCustomerDashBoard = false;
  isProductsPage= false;
  isManageAdmins=false;
  isAdminProductDetails=false;
  isCustomerProductDetails=false;

constructor(private router: Router, private authService: AuthService) {
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: NavigationEnd) => {
    this.isAdminProfilePage = event.url === '/admin-profile';
    this.isHomePage = event.url === '/home' || event.url === '/';
    this.isAddProductPage = event.url === '/add-product';
    this.isAdminDashBoard =   event.url === '/admin';
    this.isCustomerDashBoard = event.url === '/customer-dash-board';
    this.isProductsPage = event.url === '/product';
    this.isManageAdmins = event.url.includes('admin/manage');
    this.isAdminProductDetails = event.url.startsWith('/admin-product/');
this.isCustomerProductDetails = event.url.startsWith('/product/') && !this.isProductsPage;
    this.isControlAdmins = event.url === ('/control-admins');


  });
}

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToProducts() {
    this.router.navigate(['/product']);
  }

  goToAdminPanel() {
    this.router.navigate(['/admin']);
  }

  scrollToAbout(event: Event) {
    event.preventDefault();

    if (this.isHomePage) {
      const el = document.querySelector('#about');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      this.router.navigate(['/home'], { fragment: 'about' });
    }
  }

  goToSignInPage() {
    this.router.navigate(['/sign-in']);
  }

  goToSignUpPage() {
    this.router.navigate(['/sign-up']);
  }
goToPanel() {
  const userRoles = this.authService.getUserRoles(); // e.g. ['ADMIN'] or ['CUSTOMER']
  const isLoggedIn = this.authService.isLoggedIn();  // boolean

  if (userRoles.includes('CUSTOMER')) {
    this.router.navigate(['/customer-dash-board']);
  } 
  else if (userRoles.includes('ADMIN')) {
    this.router.navigate(['/admin']);
  } 
  else {
    this.router.navigate(['/home']);
  }
}

  
  signOut(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
