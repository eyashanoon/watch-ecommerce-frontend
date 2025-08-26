import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './Pages/AdminDashBoard/admin-dashboard.component';
import { ProductsComponent } from './Pages/products/products.component';
import { AdminOrdersComponent } from './Pages/orders/orders.component';
import { HomeComponent } from './Pages/home/home.component';
import { CustomerProductsComponent } from './Pages/customer-products/customer-products.component';
import { AddProductComponent } from './Pages/add-product/add-product.component';
import { ChartsComponent } from './Pages/charts/charts.component';


export const routes: Routes = [
  { path: 'admin', component: AdminDashboardComponent },

  { path: 'product/add', component: AddProductComponent },
  { path: 'product/edit/:id', component: AddProductComponent },

  { path: 'product', component: ProductsComponent },
  { path: '', component: HomeComponent },
  { path: 'orders', component: AdminOrdersComponent },
  { path: 'customer', component: CustomerProductsComponent },

  {
    path: 'report',
    loadComponent: () => import('./Pages/report/report.component').then(m => m.ReportComponent)
  },

  {
    path: 'control-admins',
    loadComponent: () => import('./Pages/control-admins/control-admins.component').then(m => m.ControlAdminsComponent)
  },

  {
    path: 'sign-in',
    loadComponent: () => import('./Pages/sign-in/sign-in.component').then(m => m.SignInComponent)
  },

  {
    path: 'customer-dash-board',
    loadComponent: () => import('./Pages/customer-dash-board/customer-dash-board.component').then(m => m.CustomerDashBoardComponent)
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
    path: 'customer-product',
    loadComponent: () => import('./Pages/customer-products/customer-products.component').then(m => m.CustomerProductsComponent)
  },

  {
    path: 'customer-profile',
    loadComponent: () => import('./Pages/customer-profile/customer-profile.component').then(m => m.CustomerProfileComponent)
  },

  {
    path: 'admin-profile',
    loadComponent: () => import('./Pages/admin-profile/admin-profile.component').then(m => m.AdminProfileComponent)
  },

  {
    path: 'admin-product/:name',
    loadComponent: () => import('./Pages/ProductsDetails/productsDetails.component').then(m => m.ProductsDetailsComponent)
  },

  {
    path: 'admin/manage',
    loadComponent: () => import('./Pages/manage-admins/manage-admins.component').then(m => m.ManageAdminsComponent)
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
  path: 'chart',
  loadComponent: () => import('./Pages/charts/charts.component').then(m => m.ChartsComponent)
},
{
  path: 'recommendation',
  loadComponent: () => import('./Pages/recommendation/recommendation.component').then(m => m.RecommendationComponent)
}






];
