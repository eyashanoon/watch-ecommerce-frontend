import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Service/auth.service';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartOptions } from 'chart.js';
import { ReportService, ReportDto } from '../../Service/report.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [RouterModule, NgIf, BaseChartDirective, CommonModule],
  providers: [provideCharts(withDefaultRegisterables())]
})
export class AdminDashboardComponent implements AfterViewInit, OnInit {
  lineChartType: 'line' = 'line';

  // Default chart options
  lineChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { enabled: true, mode: 'index', intersect: false }
    },
    elements: {
      line: { tension: 0.3, borderWidth: 2, fill: false },
      point: { radius: 4 }
    },
    scales: {
      x: { display: true, title: { display: true, text: 'Time', font: { size: 14, weight: 'bold' } }, ticks: { autoSkip: false } },
      y: { display: true, beginAtZero: true, title: { display: true, text: 'Count', font: { size: 14, weight: 'bold' } }, ticks: { stepSize: 1 } }
    }
  };

  // Smaller X-axis font specifically for daily charts
  dailyChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { enabled: true, mode: 'index', intersect: false }
    },
    elements: {
      line: { tension: 0.3, borderWidth: 2, fill: false },
      point: { radius: 4 }
    },
    scales: {
      x: {
        display: true,
        title: { display: true, text: 'Time', font: { size: 12, weight: 'bold' } },
        ticks: { font: { size: 10 } } // smaller numbers
      },
      y: {
        display: true,
        beginAtZero: true,
        title: { display: true, text: 'Count', font: { size: 14, weight: 'bold' } },
        ticks: { stepSize: 1 }
      }
    }
  };

  hoveredCard: number | null = null;
  selectedCard: number | null = null;
  sidebarVisible = false;
  toastMessage = '';
  showToast = false;

  // Chart data placeholders
  yearlyProductChartData: any = { labels: [], datasets: [] };
  monthlyProductChartData: any = { labels: [], datasets: [] };
  dailyProductChartData: any = { labels: [], datasets: [] };
  yearlyOrderChartData: any = { labels: [], datasets: [] };
  monthlyOrderChartData: any = { labels: [], datasets: [] };
  dailyOrderChartData: any = { labels: [], datasets: [] };

  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.showToastMessage('⚠️ You must be signed in.');
      this.router.navigate(['/sign-in']);
      return;
    }
    this.loadAllCharts();
  }

  ngAfterViewInit() {
    if (this.backgroundVideo) {
      const video = this.backgroundVideo.nativeElement;
      video.muted = true;
      video.play().catch(e => console.warn('Video play error:', e));
    }
  }

  toggleSidebar() { this.sidebarVisible = !this.sidebarVisible; }
  hasRole(role: string): boolean {
    const roles = this.authService.getUserRoles();
    return roles.some(r => r.toUpperCase().replace('-', '_') === role.toUpperCase().replace('-', '_'));
  }
  goToProductPage() { this.router.navigate(['/product']); }
  goToHomePage() { this.router.navigate(['/home']); }
  goToOrderPage() { this.router.navigate(['/orders']); }
  goToReportPage() { this.router.navigate(['/report']); }
  goToManageAdminsPage() { this.router.navigate(['/admin/manage']); }
  signOut(event: Event) { event.preventDefault(); this.authService.logout(); this.router.navigate(['/sign-in']); }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 5000);
  }

  loadAllCharts() {
    this.loadYearlyProductChart();
    this.loadMonthlyProductChart();
    this.loadDailyProductChart();
    this.loadYearlyOrderChart();
    this.loadMonthlyOrderChart();
    this.loadDailyOrderChart();
  }

  // ---------------- Product Charts ----------------
  loadYearlyProductChart(year?: string) {
    this.reportService.getYearlyProductReport(year).subscribe({
      next: (res: ReportDto[]) => {
        this.yearlyProductChartData = {
          labels: res.map(r => r.field.toString()),
          datasets: [{ data: res.map(r => r.count), label: 'Products', borderColor: '#007bff', backgroundColor: '#007bff', pointBackgroundColor: '#007bff' }]
        };
      },
      error: () => this.showToastMessage('Error loading yearly product data')
    });
  }

  loadMonthlyProductChart(year: string = new Date().getFullYear().toString()) {
    this.reportService.getMonthlyProductReport(year).subscribe({
      next: (res: ReportDto[]) => {
        const months = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);
        const counts = months.map((_, i) => res.find(r => Number(r.field) === i + 1)?.count ?? 0);
        this.monthlyProductChartData = {
          labels: months,
          datasets: [{ data: counts, label: 'Products', borderColor: '#28a745', backgroundColor: '#28a745', pointBackgroundColor: '#28a745' }]
        };
      },
      error: () => this.showToastMessage('Error loading monthly product data')
    });
  }

  loadDailyProductChart(year: string = new Date().getFullYear().toString(), month: string = (new Date().getMonth() + 1).toString()) {
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
    this.reportService.getDailyProductReport(year, month).subscribe({
      next: (res: ReportDto[]) => {
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        this.dailyProductChartData = {
          labels: days.map(d => `${d}`),
          datasets: [{ data: days.map(d => res.find(r => Number(r.field) === d)?.count ?? 0), label: 'Products', borderColor: '#ff6384', backgroundColor: '#ff6384', pointBackgroundColor: '#ff6384' }]
        };
      },
      error: () => this.showToastMessage('Error loading daily product data')
    });
  }

  // ---------------- Order Charts ----------------
  loadYearlyOrderChart(year?: string) {
    this.reportService.getYearlyOrderReport(year).subscribe({
      next: (res: ReportDto[]) => {
        this.yearlyOrderChartData = {
          labels: res.map(r => r.field.toString()),
          datasets: [{ data: res.map(r => r.count), label: 'Orders', borderColor: '#6f42c1', backgroundColor: '#6f42c1', pointBackgroundColor: '#6f42c1' }]
        };
      },
      error: () => this.showToastMessage('Error loading yearly order data')
    });
  }

  loadMonthlyOrderChart(year: string = new Date().getFullYear().toString()) {
    this.reportService.getMonthlyOrderReport(year).subscribe({
      next: (res: ReportDto[]) => {
        const months = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);
        const counts = months.map((_, i) => res.find(r => Number(r.field) === i + 1)?.count ?? 0);
        this.monthlyOrderChartData = {
          labels: months,
          datasets: [{ data: counts, label: 'Orders', borderColor: '#fd7e14', backgroundColor: '#fd7e14', pointBackgroundColor: '#fd7e14' }]
        };
      },
      error: () => this.showToastMessage('Error loading monthly order data')
    });
  }

  loadDailyOrderChart(year: string = new Date().getFullYear().toString(), month: string = (new Date().getMonth() + 1).toString()) {
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
    this.reportService.getDailyOrderReport(year, month).subscribe({
      next: (res: ReportDto[]) => {
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        this.dailyOrderChartData = {
          labels: days.map(d => `${d}`),
          datasets: [{ data: days.map(d => res.find(r => Number(r.field) === d)?.count ?? 0), label: 'Orders', borderColor: '#20c997', backgroundColor: '#20c997', pointBackgroundColor: '#20c997' }]
        };
      },
      error: () => this.showToastMessage('Error loading daily order data')
    });
  }
}
