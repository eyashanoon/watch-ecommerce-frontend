import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../app/environments/environment"

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl+'/api/auth';
  private roles: string[] = [];

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.decodeAndStoreRoles(token);
  }

  private decodeAndStoreRoles(token: string): void {
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

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('roles');
    this.roles = [];
  }

  getUserRoles(): string[] {
    if (this.roles.length > 0) {
      return this.roles;
    }
    const storedRoles = localStorage.getItem('roles');
    return storedRoles ? JSON.parse(storedRoles) : [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  hasAnyRole(rolesToCheck: string[]): boolean {
    const userRoles = this.getUserRoles();
    return rolesToCheck.some(role => userRoles.includes(role));
  }
}
