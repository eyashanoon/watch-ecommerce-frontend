import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportDto {
  field: number; // year, month, or day
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private productBaseUrl = 'http://localhost:8080/api/report/product';
  private orderBaseUrl = 'http://localhost:8080/api/report/order';

  constructor(private http: HttpClient) {}

  // ---------------- Product Reports ----------------
  getYearlyProductReport(year?: string): Observable<ReportDto[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    return this.http.get<ReportDto[]>(`${this.productBaseUrl}/years`, { params });
  }

  getMonthlyProductReport(year: string): Observable<ReportDto[]> {
    let params = new HttpParams().set('year', year);
    return this.http.get<ReportDto[]>(`${this.productBaseUrl}/year`, { params });
  }

  getDailyProductReport(year: string, month: string): Observable<ReportDto[]> {
    let params = new HttpParams().set('year', year).set('month', month);
    return this.http.get<ReportDto[]>(`${this.productBaseUrl}/month`, { params });
  }

  // ---------------- Order Reports ----------------
  getYearlyOrdersReport(year?: string): Observable<ReportDto[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    return this.http.get<ReportDto[]>(`${this.orderBaseUrl}/years`, { params });
  }

  getMonthlyOrdersReport(year: string): Observable<ReportDto[]> {
    let params = new HttpParams().set('year', year);
    return this.http.get<ReportDto[]>(`${this.orderBaseUrl}/year`, { params });
  }

  getDailyOrdersReport(year: string, month: string): Observable<ReportDto[]> {
    let params = new HttpParams().set('year', year).set('month', month);
    return this.http.get<ReportDto[]>(`${this.orderBaseUrl}/month`, { params });
  }
}
