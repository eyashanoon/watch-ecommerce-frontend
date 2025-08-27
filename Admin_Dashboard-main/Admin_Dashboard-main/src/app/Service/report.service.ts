// report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ReportDto {
  field: string | number;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl = 'http://10.10.33.90:8080/api/report';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // Product reports
  getYearlyProductReport(year?: string): Observable<ReportDto[]> {
    const url = `${this.baseUrl}/product/years${year ? '?year=' + year : ''}`;
    return this.http.get<ReportDto[]>(url, this.getAuthHeaders());
  }

  getMonthlyProductReport(year: string): Observable<ReportDto[]> {
    const url = `${this.baseUrl}/product/year?year=${year}`;
    return this.http.get<ReportDto[]>(url, this.getAuthHeaders());
  }

  getDailyProductReport(year: string, month: string): Observable<ReportDto[]> {
    const url = `${this.baseUrl}/product/month?year=${year}&month=${month}`;
    return this.http.get<ReportDto[]>(url, this.getAuthHeaders());
  }

  // Order reports
  getYearlyOrderReport(year?: string): Observable<ReportDto[]> {
    const url = `${this.baseUrl}/order/years${year ? '?year=' + year : ''}`;
    return this.http.get<ReportDto[]>(url, this.getAuthHeaders());
  }

  getMonthlyOrderReport(year: string): Observable<ReportDto[]> {
    const url = `${this.baseUrl}/order/year?year=${year}`;
    return this.http.get<ReportDto[]>(url, this.getAuthHeaders());
  }

  getDailyOrderReport(year: string, month: string): Observable<ReportDto[]> {
    const url = `${this.baseUrl}/order/month?year=${year}&month=${month}`;
    return this.http.get<ReportDto[]>(url, this.getAuthHeaders());
  }
}
