import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
 import { environment } from "../../app/environments/environment";


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
  localStorage.setItem('roles', JSON.stringify(roles));  // store array as JSON string
  localStorage.setItem('id', id.toString());             // convert number to string
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
    localStorage.removeItem('id');
    this.roles = [];
  }

  // --- Roles Handling ---
  getUserRoles(): string[] {
    if (this.roles.length > 0) return this.roles;
    const storedRoles = localStorage.getItem('roles');
    return storedRoles ? JSON.parse(storedRoles) : [];
  }
  // --- JWT Helper ---
getUserId(): number | null {
  const id = localStorage.getItem('id');
  return id ? +id : null;
}

getUsernameFromToken(): string | null {
  const token = this.getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username || payload.name || null;
  } catch {
    return null;
  }
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
    console.log( data);
    return this.http.put(`${environment.apiBaseUrl}/api/admins/gg`, data, {
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
    return this.http.get(`${environment.apiBaseUrl}/api/customers/me`, {
      headers: this.getAuthHeaders()
    });
  }

  updateCustomerProfile(id: number, data: any): Observable<any> {
    console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv");
    console.log(data);
        console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv");

    return this.http.put(`${environment.apiBaseUrl}/api/customers`, data, {
      headers: this.getAuthHeaders()
    });
  }

  updateCustomerPassword(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/api/customers/changePassword/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  getCard(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/api/cards/me`,{
      headers:this.getAuthHeaders()
    });
  }

    createCard(cardData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/api/cards`, cardData, {
      headers: this.getAuthHeaders()
    });
  }

   getCardByCustomerID(id: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/api/cards/customer/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

   getMyCard(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/api/cards/me`, {
      headers: this.getAuthHeaders()
    });
  }

   updateCard(cardData: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/api/cards`, cardData, {
      headers: this.getAuthHeaders()
    });
  }
  updateCustomerPayment(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/api/customers/${id}/payment`, data, {
      headers: this.getAuthHeaders()
    });
  }

  deleteCustomerProfile(id: number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/api/customers/${id}`, {
      headers: this.getAuthHeaders()
    });
  }


  // --- New method: get user profile by email ---
  getUserById(id: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/api/admins/${id}`,{
      headers:this.getAuthHeaders()
    });
  }

  updateUserProfile(id:number,userData: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/api/admins/${id}`, userData,{
      headers:this.getAuthHeaders()
      
    });
  }
  
  updateUserProfilePassword(id:number,userData: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/api/admins/changePassword/${id}`, userData,{
      headers:this.getAuthHeaders()
      
    });
  }


  deleteUserProfile( id:number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/api/admins/${id}`,{
      headers:this.getAuthHeaders()
    });
  }

  getCard(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/api/cards/me`,{
      headers:this.getAuthHeaders()
    });
  }

    createCard(cardData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/api/cards`, cardData, {
      headers: this.getAuthHeaders()
    });
  }

   getCardByCustomerID(id: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/api/cards/customer/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

   getMyCard(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/api/cards/me`, {
      headers: this.getAuthHeaders()
    });
  }

   updateCard(cardData: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/api/cards`, cardData, {
      headers: this.getAuthHeaders()
    });
  }



    registerCustomer(customerData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/api/customers`, customerData);
  }
 

}
