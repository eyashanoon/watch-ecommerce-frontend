import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../app/environments/environment"

// Adjust this URL according to your backend endpoint
const API_URL = environment.apiBaseUrl+'/api/product';

@Injectable({
  providedIn: 'root'
})
export class FeaturesService {
  constructor(private http: HttpClient) {}

  // Optional: You can include token if your backend requires it
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }
    getAllBands(): Observable<any[]> {
      return this.http.get<any[]>(`${API_URL}/${"band"}`, {
        headers: this.getAuthHeaders()
      });
    }
     getAllBrands(): Observable<any[]> {
      return this.http.get<any[]>(`${API_URL}/${"brand"}`, {
        headers: this.getAuthHeaders()
      });
    }
    getAllCases(): Observable<any[]> {
      return this.http.get<any[]>(`${API_URL}/${"case"}`, {
        headers: this.getAuthHeaders()
      });
    }
    getAllColors(): Observable<ColorsResponse> {
      return this.http.get<ColorsResponse>(`${API_URL}/${"colors"}`, {
        headers: this.getAuthHeaders()
      });
    }
    getAllDisplay_types(): Observable<any[]> {
      return this.http.get<any[]>(`${API_URL}/${"display_type"}`, {
        headers: this.getAuthHeaders()
      });
    }
    getAllNumbering_formats(): Observable<any[]> {
      return this.http.get<any[]>(`${API_URL}/${"numbering_format"}`, {
        headers: this.getAuthHeaders()
      });
    }
        getAllShapes(): Observable<any[]> {
      return this.http.get<any[]>(`${API_URL}/${"shape"}`, {
        headers: this.getAuthHeaders()
      });
    }







}


export interface ColorsResponse {
  Hands: string[];
  Background: string[];
  Band: string[];
}
