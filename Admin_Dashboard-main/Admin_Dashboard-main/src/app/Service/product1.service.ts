import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../app/environments/environment"

// Adjust this URL according to your backend endpoint
const API_URL = environment.apiBaseUrl+'/api/products';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private http: HttpClient) {}

  // Optional: You can include token if your backend requires it
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  /**
   * Adds a new admin user.
   * @param adminData - The new admin's data.
   */

  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(API_URL , {
      headers: this.getAuthHeaders()
    });
  }


}
