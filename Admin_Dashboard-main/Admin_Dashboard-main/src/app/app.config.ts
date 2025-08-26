import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerDashBoardComponent } from './Pages/customer-dash-board/customer-dash-board.component';
import { AdminDashboardComponent } from './Pages/AdminDashBoard/admin-dashboard.component';
import { ProductsComponent } from './Pages/products/products.component';
import { AdminOrdersComponent } from './Pages/orders/orders.component';
import { HomeComponent } from './Pages/home/home.component';
import { CustomerProductsComponent } from './Pages/customer-products/customer-products.component';
import { AddProductComponent } from './Pages/add-product/add-product.component';
import { ReportComponent } from './Pages/report/report.component';
import { ControlAdminsComponent } from './Pages/control-admins/control-admins.component';
import { SignInComponent } from './Pages/sign-in/sign-in.component';
import { SignUpComponent } from './Pages/sign-up/sign-up.component';
import { ChartsComponent } from './Pages/charts/charts.component';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};

export const appImports = [
  RouterModule.forRoot(routes),
  FormsModule, // Import FormsModule in this configuration
  CommonModule,
  CustomerDashBoardComponent,
  AdminDashboardComponent,
  ProductsComponent,
  AdminOrdersComponent,
  HomeComponent,
  CustomerProductsComponent,
  AddProductComponent,
  ReportComponent,
  ControlAdminsComponent,
  SignInComponent,
  SignUpComponent,
  ChartsComponent
];
