import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { ReportService, ReportDto } from '../../Service/report.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())] // ✅ register Chart.js
})
export class ReportComponent implements OnInit {

  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Products Sold' }]
  };
  public barChartOptions: ChartOptions = { responsive: true };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadYearlyReport();
  }

  loadYearlyReport(year?: string) {
    this.reportService.getYearlyProductReport(year).subscribe((res: ReportDto[]) => {
      this.barChartData.labels = res.map(r => r.field.toString());
      this.barChartData.datasets[0].data = res.map(r => r.count);
    });
  }

  loadMonthlyReport(year: string) {
    this.reportService.getMonthlyProductReport(year).subscribe((res: ReportDto[]) => {
      this.barChartData.labels = res.map(r => `Month ${r.field}`);
      this.barChartData.datasets[0].data = res.map(r => r.count);
    });
  }

  loadDailyReport(year: string, month: string) {
    this.reportService.getDailyProductReport(year, month).subscribe((res: ReportDto[]) => {
      this.barChartData.labels = res.map(r => `Day ${r.field}`);
      this.barChartData.datasets[0].data = res.map(r => r.count);
    });
  }
}
