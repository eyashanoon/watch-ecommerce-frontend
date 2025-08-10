import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../app/environments/environment"

// Adjust this URL according to your backend endpoint
const API_URL = environment.apiBaseUrl+'/api/admins';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
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
  addAdmin(adminData: any): Observable<any> {
    return this.http.post(API_URL, adminData, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Gets a list of all admins.
   */
  getAllAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/${"without-loggedin"}`, {
      headers: this.getAuthHeaders()
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
  updateAdminPassword(adminId: number, updatedData: any) {
  // Assuming your backend endpoint for password update
  return this.http.put(`${API_URL}/changePassword/${adminId}`, updatedData, {
      headers: this.getAuthHeaders()
    });}


  /**
   * Deletes an admin by ID.
   */
  deleteAdmin(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
