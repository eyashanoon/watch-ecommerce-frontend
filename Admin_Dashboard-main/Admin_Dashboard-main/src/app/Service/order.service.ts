// admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

// Backend API URL
const API_URL = environment.apiBaseUrl + '/api/orders';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) {}

  // Include token if backend requires it
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  /**
   * Adds a new admin user.
   * @param orderData - The new admin's data.
   */
  createOrder(orderData: any): Observable<any> {
    return this.http.post(API_URL, orderData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get all admins (paginated).
   */
  getAllAdmins(pageNumber: number = 1, pageSize: number = 20): Observable<{ content: any[]; [key: string]: any }> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<{ content: any[]; [key: string]: any }>(API_URL, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  /**
   * Get admin by ID
   */
  getAdminById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Updates an admin's information.
   */
  updateAdmin(id: number, updatedData: any): Observable<any> {
    return this.http.put(`${API_URL}/${id}`, updatedData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Updates an admin's password
   */
  updateAdminPassword(adminId: number, updatedData: any): Observable<any> {
    return this.http.put(`${API_URL}/changePassword/${adminId}`, updatedData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Deletes an admin by ID.
   */
  deleteAdmin(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
  getAllRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${API_URL}/roles`, { headers: this.getAuthHeaders() });
  }
}
