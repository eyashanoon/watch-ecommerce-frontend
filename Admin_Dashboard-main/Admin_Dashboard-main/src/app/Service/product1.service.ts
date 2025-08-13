import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from "../../app/environments/environment";
import { Product } from '../models/product.model';

const API_URL = environment.apiBaseUrl + '/api/products';

@Injectable({
  providedIn: 'root'
})
export class ProductService1 {
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  // Return the Page object directly
  getAllProducts(): Observable<{ content: Product[]; [key: string]: any }> {
    return this.http.get<{ content: Product[]; [key: string]: any }>(API_URL, {
      headers: this.getAuthHeaders()
    });
  }

  // Optional helper to directly get the array of products
  getAllProductsArray(): Observable<Product[]> {
    return this.getAllProducts().pipe(map(page => page.content));
  }
}
