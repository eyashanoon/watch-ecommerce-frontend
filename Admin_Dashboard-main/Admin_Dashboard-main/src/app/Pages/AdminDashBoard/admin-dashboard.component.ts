import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Service/auth.service';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { ReportService, ReportDto } from '../../Service/report.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [RouterModule, NgIf, BaseChartDirective, CommonModule],
  providers: [provideCharts(withDefaultRegisterables())]
})
export class AdminDashboardComponent implements AfterViewInit, OnInit {
  sidebarVisible = false;
  
  // Toast
  toastMessage: string = '';
  showToast: boolean = false;

  // Card selection
  selectedCard: number | null = null;

  // Chart settings
  public lineChartType: ChartType = 'line';

  public lineChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true
      }
    },
    elements: {
      line: {
        tension: 0.3, // smooth curves
        borderWidth: 2,
      },
      point: {
        radius: 4,
        backgroundColor: 'blue',
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value'
        }
      }
    }
  };

  // Yearly Product Chart (Example)
  public yearlyProductChartData: ChartData<'line'> = {
    labels: ['2021', '2022', '2023', '2024', '2025'],
    datasets: [{
      data: [12, 19, 14, 23, 30],
      label: 'Yearly Product Count',
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderWidth: 2,
      fill: true
    }]
  };

  // Monthly Product Chart (Example)
  public monthlyProductChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [5, 9, 7, 14, 10, 12],
      label: 'Monthly Product Count',
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderWidth: 2,
      fill: true
    }]
  };

  // Daily Product Chart (Example)
  public dailyProductChartData: ChartData<'line'> = {
    labels: ['1', '2', '3', '4', '5', '6', '7'],
    datasets: [{
      data: [1, 3, 2, 5, 4, 6, 3],
      label: 'Daily Product Count',
      borderColor: 'rgba(255, 206, 86, 1)',
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
      borderWidth: 2,
      fill: true
    }]
  };

  // Yearly Order Chart (Example)
  public yearlyOrderChartData: ChartData<'line'> = {
    labels: ['2021', '2022', '2023', '2024', '2025'],
    datasets: [{
      data: [8, 15, 10, 20, 25],
      label: 'Yearly Order Count',
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderWidth: 2,
      fill: true
    }]
  };

  // Monthly Order Chart (Example)
  public monthlyOrderChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [4, 6, 5, 10, 8, 12],
      label: 'Monthly Order Count',
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderWidth: 2,
      fill: true
    }]
  };

  // Daily Order Chart (Example)
  public dailyOrderChartData: ChartData<'line'> = {
    labels: ['1', '2', '3', '4', '5', '6', '7'],
    datasets: [{
      data: [2, 3, 1, 4, 3, 5, 2],
      label: 'Daily Order Count',
      borderColor: 'rgba(255, 159, 64, 1)',
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      borderWidth: 2,
      fill: true
    }]
  };

  constructor(private router: Router, private authService: AuthService, private reportService: ReportService) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.showToastMessage('⚠️ You must be signed in.');
      this.router.navigate(['/sign-in']);
      return;
    }

    // Load all charts
    this.loadYearlyProductChart();
    this.loadMonthlyProductChart();
    this.loadDailyProductChart();
    this.loadYearlyOrderChart();
    this.loadMonthlyOrderChart();
    this.loadDailyOrderChart();
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 5000);
  }

  toggleSidebar() { this.sidebarVisible = !this.sidebarVisible; }

  hasRole(role: string): boolean {
    const roles = this.authService.getUserRoles();
    const normalize = (r: string) => r.toUpperCase().replace('-', '_'); 
    return roles.some(r => normalize(r) === normalize(role));
  }

  goToProductPage() { this.router.navigate(['/product']); }
  goToHomePage() { this.router.navigate(['/home']); }
  goToOrderPage() { this.router.navigate(['/orders']); }
  goToReportPage() { this.router.navigate(['/report']); }
  goToManageAdminsPage() { this.router.navigate(['/admin/manage']); }

  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;
  ngAfterViewInit() {
    if (this.backgroundVideo) {
      const video = this.backgroundVideo.nativeElement;
      video.muted = true;
      video.play().catch(e => console.warn('Video play error:', e));
    }
  }

  signOut(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/sign-in']);
  }

  // ------------------- Product Charts -------------------
  loadYearlyProductChart(year?: string) {
    this.reportService.getYearlyProductReport(year).subscribe((res: ReportDto[]) => {
      this.yearlyProductChartData.labels = res.map(r => r.field.toString());
      this.yearlyProductChartData.datasets[0].data = res.map(r => r.count);
    });
  }

  loadMonthlyProductChart(year: string = new Date().getFullYear().toString()) {
    this.reportService.getMonthlyProductReport(year).subscribe((res: ReportDto[]) => {
      this.monthlyProductChartData.labels = res.map(r => `Month ${r.field}`);
      this.monthlyProductChartData.datasets[0].data = res.map(r => r.count);
    });
  }

  loadDailyProductChart(year: string = new Date().getFullYear().toString(), month: string = (new Date().getMonth() + 1).toString()) {
    this.reportService.getDailyProductReport(year, month).subscribe((res: ReportDto[]) => {
      this.dailyProductChartData.labels = res.map(r => `Day ${r.field}`);
      this.dailyProductChartData.datasets[0].data = res.map(r => r.count);
    });
  }

  // ------------------- Order Charts -------------------
  loadYearlyOrderChart(year?: string) {
    this.reportService.getYearlyOrdersReport(year).subscribe((res: ReportDto[]) => {
      this.yearlyOrderChartData.labels = res.map(r => r.field.toString());
      this.yearlyOrderChartData.datasets[0].data = res.map(r => r.count);
    });
  }

  loadMonthlyOrderChart(year: string = new Date().getFullYear().toString()) {
    this.reportService.getMonthlyOrdersReport(year).subscribe((res: ReportDto[]) => {
      this.monthlyOrderChartData.labels = res.map(r => `Month ${r.field}`);
      this.monthlyOrderChartData.datasets[0].data = res.map(r => r.count);
    });
  }

  loadDailyOrderChart(year: string = new Date().getFullYear().toString(), month: string = (new Date().getMonth() + 1).toString()) {
    this.reportService.getDailyOrdersReport(year, month).subscribe((res: ReportDto[]) => {
      this.dailyOrderChartData.labels = res.map(r => `Day ${r.field}`);
      this.dailyOrderChartData.datasets[0].data = res.map(r => r.count);
    });
  }
}
