import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpParams  } from '@angular/common/http';
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
getAllProducts(filters: any): Observable<{ content: Product[]; [key: string]: any }> {
  let params = new HttpParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== '' && value !== undefined) {
      params = params.set(key, String(value));
    }
  });

  return this.http.get<{content: Product[]; [key: string]: any}>(API_URL, {
    headers: this.getAuthHeaders(),
    params: params
  });
}
 

}
