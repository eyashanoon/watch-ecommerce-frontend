import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './Pages/AdminDashBoard/admin-dashboard.component';
import { ProductsComponent } from './Pages/products/products.component';
import { AdminOrdersComponent } from './Pages/orders/orders.component';
import { HomeComponent } from './Pages/home/home.component';
import { AddProductComponent } from './Pages/add-product/add-product.component';
import { AdminGuard } from './Pages/guards/admin-guard';
import { CustomerGuard } from './Pages/customer-guards/customer-guard';

export const routes: Routes = [
  { path: 'admin', component: AdminDashboardComponent , canActivate: [AdminGuard]},

  { path: 'product/add', component: AddProductComponent, canActivate: [AdminGuard] },
  { path: 'product/edit/:id', component: AddProductComponent, canActivate: [AdminGuard] },

  { path: 'product', component: ProductsComponent },
  { path: '', component: HomeComponent },
  { path: 'orders', component: AdminOrdersComponent, canActivate: [AdminGuard] },

  {
    path: 'report',
    loadComponent: () => import('./Pages/report/report.component').then(m => m.ReportComponent), canActivate: [AdminGuard]
  },

  {
    path: 'control-admins',
    loadComponent: () => import('./Pages/control-admins/control-admins.component').then(m => m.ControlAdminsComponent), canActivate: [AdminGuard]
  },

  {
    path: 'sign-in',
    loadComponent: () => import('./Pages/sign-in/sign-in.component').then(m => m.SignInComponent)
  },


  {
    path: 'sign-up',
    loadComponent: () => import('./Pages/sign-up/sign-up.component').then(m => m.SignUpComponent)
  },

  {
    path: 'home',
    loadComponent: () => import('./Pages/home/home.component').then(m => m.HomeComponent)
  },




  {
    path: 'customer-profile',
    loadComponent: () => import('./Pages/customer-profile/customer-profile.component').then(m => m.CustomerProfileComponent)
  },

  {
    path: 'admin-profile',
    loadComponent: () => import('./Pages/admin-profile/admin-profile.component').then(m => m.AdminProfileComponent), canActivate: [AdminGuard]
  },

  {
    path: 'admin-product/:name',
    loadComponent: () => import('./Pages/ProductsDetails/productsDetails.component').then(m => m.ProductsDetailsComponent)
  },

  {
    path: 'admin/manage',
    loadComponent: () => import('./Pages/manage-admins/manage-admins.component').then(m => m.ManageAdminsComponent), canActivate: [AdminGuard]
  },

{
  path: 'wishlist',
  loadComponent: () =>
    import('./Pages/wishlist/wishlist.component').then(m => m.WishlistComponent)
}

,
{
  path: 'cart',
  loadComponent: () => import('./Pages/cart/cart.component').then(m => m.CartComponent)
}
,
{
  path: 'customer/orders',
  loadComponent: () => import('./Pages/customer-orders/customer-orders.component').then(m => m.CustomerOrdersComponent)
}
,

{
  path: 'recommendation',
  loadComponent: () => import('./Pages/recommendation/recommendation.component').then(m => m.RecommendationComponent)
}

];
