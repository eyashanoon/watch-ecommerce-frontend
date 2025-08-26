import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from './Pages/AdminDashBoard/admin-dashboard.component';
import { ProductsComponent } from './Pages/products/products.component';
import { AdminOrdersComponent } from './Pages/orders/orders.component';
import { HomeComponent } from './Pages/home/home.component';
import { AddProductComponent } from './Pages/add-product/add-product.component';
import { ControlAdminsComponent } from './Pages/control-admins/control-admins.component';
import { SignInComponent } from './Pages/sign-in/sign-in.component';
import { SignUpComponent } from './Pages/sign-up/sign-up.component';
import {RecommendationComponent} from  './Pages/recommendation/recommendation.component';


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
  AdminDashboardComponent,
  ProductsComponent,
  AdminOrdersComponent,
  HomeComponent,
  AddProductComponent,
  ControlAdminsComponent,
  SignInComponent,
  SignUpComponent,
  RecommendationComponent
];
