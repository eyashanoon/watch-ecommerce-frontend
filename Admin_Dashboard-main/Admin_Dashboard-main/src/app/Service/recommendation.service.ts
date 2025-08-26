import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Recommendation {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {

  private baseUrl = 'api/recommend'; // Matches your Spring Boot endpoint

  constructor(private http: HttpClient) {}

  getRecommendations(): Observable<Recommendation[]> {
    // Using POST as per your backend controller
    return this.http.post<Recommendation[]>(`${environment.apiBaseUrl}/${this.baseUrl}`, {});
  }
}
