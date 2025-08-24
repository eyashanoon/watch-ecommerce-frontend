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
    //headers: this.getAuthHeaders(),
    params: params
  });
}
  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/${id}`, {  });
  }
    getProductByName(name: String): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/products/name/${name}` );
  }
    updateProduct(id: number, productData: any): Observable<any> {
        console.log(productData);

    return this.http.put<any>(`${API_URL}/${id}`, productData, { });
  }
 addProduct(productData: any): Observable<any> {
  console.log(productData);
  return this.http.post<any>(API_URL, productData, {
    //headers: this.getAuthHeaders()
  });
}
 

}
 