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
    console.log(orderData);
    return this.http.post(API_URL, orderData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get all admins (paginated).
   */
  getAllOrderForMe( ): Observable<any> {
    return this.http.get (`${API_URL}`+`/me`, {
      headers: this.getAuthHeaders(),

    });
  }

  /**
   * Get admin by ID
   */
  getOrders( ): Observable<any> {
    return this.http.get(`${API_URL}`, {
      headers: this.getAuthHeaders()
    });
  }
updateOrderStatus(id: number, status: string): Observable<any> {
  return this.http.put<any>(
    `${API_URL}/${id}/status`,
    {status:status}, // wrap the status in quotes
    { headers: this.getAuthHeaders() }
  );
}



  /**
   * Updates an admin's information.
   */

}
