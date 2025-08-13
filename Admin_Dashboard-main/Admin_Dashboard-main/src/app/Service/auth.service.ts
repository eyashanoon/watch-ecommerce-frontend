import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl + '/api/auth';
  private roles: string[] = [];

  constructor(private http: HttpClient) {}

  // --- Authentication ---
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  saveToken(token: string, roles: string[], id: number): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('roles', JSON.stringify(roles));
    localStorage.setItem('id', id.toString());
    this.roles = roles;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('roles');
    localStorage.removeItem('id');
    this.roles = [];
  }

  // --- Roles Handling ---
  getUserRoles(): string[] {
    if (this.roles.length > 0) return this.roles;
    const storedRoles = localStorage.getItem('roles');
    return storedRoles ? JSON.parse(storedRoles) : [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  hasAnyRole(rolesToCheck: string[]): boolean {
    return rolesToCheck.some(role => this.hasRole(role));
  }

  // --- JWT Helper ---
  getEmailFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email || payload.sub || null;
    } catch {
      return null;
    }
  }

  decodeAndStoreRoles(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const extractedRoles = payload.roles || payload.role || [];
      this.roles = Array.isArray(extractedRoles) ? extractedRoles : [extractedRoles];
      localStorage.setItem('roles', JSON.stringify(this.roles));
    } catch (error) {
      console.error('Invalid token format', error);
      this.roles = [];
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  // --- Admin API ---
  getAdminById(id: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/api/admins/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateAdminProfile(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/api/admins/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  updateAdminProfilePassword(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/api/admins/changePassword/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  deleteAdminProfile(id: number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/api/admins/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // --- Customer API ---
  getCustomerById(id: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/api/customers/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateCustomerProfile(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/api/customers/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  updateCustomerPassword(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/api/customers/changePassword/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  deleteCustomerProfile(id: number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/api/customers/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
