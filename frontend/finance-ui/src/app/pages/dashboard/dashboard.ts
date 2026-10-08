import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card';
import { RollingNumberComponent } from '../../shared/components/rolling-number/rolling-number';
import { TransactionItemComponent } from '../../shared/components/transaction-item/transaction-item';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { TransactionModalComponent } from '../../shared/components/transaction-modal/transaction-modal';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { ThemeService } from '../../core/services/theme.service';
import { DashboardSummary, FinancialInsight } from '../../core/models/dashboard.model';
import { formatINR } from '../../core/utils/currency-formatter';

export type ChartOptions = {
  series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart?: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  stroke?: ApexStroke;
  fill?: ApexFill;
  colors?: string[];
  dataLabels?: ApexDataLabels;
  grid?: ApexGrid;
  tooltip?: ApexTooltip;
  legend?: ApexLegend;
  plotOptions?: ApexPlotOptions;
  labels?: string[];
};

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    NgApexchartsModule,
    NavbarComponent,
    GlassCardComponent,
    RollingNumberComponent,
    TransactionItemComponent,
    EmptyStateComponent,
    TransactionModalComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly themeService = inject(ThemeService);

  protected readonly summary = signal<DashboardSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    recentTransactions: [],
    monthlyCashFlow: [],
    categoryBreakdown: [],
  });

  protected readonly isAddModalOpen = signal<boolean>(false);

  protected readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  protected readonly userFirstName = computed(() => {
    const user = this.authService.currentUser();
    if (!user?.name) return 'Explorer';
    return user.name.split(' ')[0];
  });

  protected readonly savingsRate = computed(() => {
    const s = this.summary();
    return this.dashboardService.calculateSavingsRate(s.totalIncome, s.totalExpense);
  });

  protected readonly insight = computed<FinancialInsight>(() => {
    return this.dashboardService.generateInsight(this.summary());
  });

  protected readonly hasMonthlyData = computed(() => {
    const points = this.summary().monthlyCashFlow;
    return Boolean(points && points.length > 0);
  });

  protected readonly hasExpenseData = computed(() => {
    const list = this.summary().categoryBreakdown;
    return Boolean(list && list.length > 0 && this.summary().totalExpense > 0);
  });

  protected readonly hasComparisonData = computed(() => {
    const s = this.summary();
    return s.totalIncome > 0 || s.totalExpense > 0;
  });

  protected cashFlowChartOptions: Partial<ChartOptions> = {};
  protected expenseChartOptions: Partial<ChartOptions> = {};
  protected barChartOptions: Partial<ChartOptions> = {};
  protected savingsChartOptions: Partial<ChartOptions> = {};

  constructor() {
    effect(() => {
      const isDark = this.themeService.isDark();
      const currentSummary = this.summary();
      this.initChartConfigurations(isDark, currentSummary);
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  protected loadDashboardData(): void {
    this.dashboardService.getSummary().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.summary.set(res.data);
        }
      },
      error: () => {},
    });
  }

  protected openAddModal(): void {
    this.isAddModalOpen.set(true);
  }

  protected closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  protected onTransactionSaved(): void {
    this.loadDashboardData();
  }

  private initChartConfigurations(isDark: boolean, summary: DashboardSummary): void {
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
    const cardBg = 'transparent';
    const fontFam = "'Geist', 'Inter', system-ui, sans-serif";

    const incomeColor = isDark ? '#10B981' : '#059669';
    const expenseColor = isDark ? '#F43F5E' : '#E11D48';
    const primaryIndigo = isDark ? '#6366F1' : '#4F46E5';
    const skyBlue = isDark ? '#38BDF8' : '#0284C7';
    const amberColor = isDark ? '#F59E0B' : '#D97706';

    const monthlyPoints = summary.monthlyCashFlow || [];
    const categoryPoints = summary.categoryBreakdown || [];

    if (monthlyPoints.length > 0) {
      const categories = monthlyPoints.map((p) => p.month);
      const incomeSeries = monthlyPoints.map((p) => p.income);
      const expenseSeries = monthlyPoints.map((p) => p.expense);

      this.cashFlowChartOptions = {
        series: [
          { name: 'Income', data: incomeSeries },
          { name: 'Expense', data: expenseSeries },
        ],
        chart: {
          type: 'area',
          height: 280,
          background: cardBg,
          toolbar: { show: false },
          animations: {
            enabled: true,
            speed: 600,
          },
        },
        colors: [incomeColor, expenseColor],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2.5 },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.35,
            opacityTo: 0.05,
            stops: [0, 95, 100],
          },
        },
        xaxis: {
          categories,
          labels: { style: { colors: textColor, fontFamily: fontFam } },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          labels: {
            style: { colors: textColor, fontFamily: fontFam },
            formatter: (val) => `₹${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`,
          },
        },
        grid: {
          borderColor: gridColor,
          strokeDashArray: 4,
          xaxis: { lines: { show: false } },
        },
        tooltip: {
          theme: isDark ? 'dark' : 'light',
          y: { formatter: (val) => `₹${val.toLocaleString('en-IN')}` },
        },
        legend: { show: false },
      };
    } else {
      this.cashFlowChartOptions = {};
    }

    if (categoryPoints.length > 0 && summary.totalExpense > 0) {
      const labels = categoryPoints.map((c) => c.category);
      const series = categoryPoints.map((c) => c.amount);

      this.expenseChartOptions = {
        series,
        labels,
        chart: {
          type: 'donut',
          height: 280,
          background: cardBg,
          animations: {
            enabled: true,
            speed: 600,
          },
        },
        colors: [primaryIndigo, skyBlue, incomeColor, amberColor, '#8B5CF6', '#EC4899', '#64748B', '#14B8A6'],
        stroke: {
          show: true,
          colors: [isDark ? '#13161D' : '#FFFFFF'],
          width: 2,
        },
        plotOptions: {
          pie: {
            donut: {
              size: '72%',
              labels: {
                show: true,
                name: { color: textColor, fontFamily: fontFam },
                value: {
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontFamily: fontFam,
                  fontWeight: 700,
                  formatter: (val) => `₹${Number(val).toLocaleString('en-IN')}`,
                },
                total: {
                  show: true,
                  label: 'Total Outflow',
                  color: textColor,
                  formatter: () => `₹${summary.totalExpense.toLocaleString('en-IN')}`,
                },
              },
            },
          },
        },
        legend: {
          position: 'bottom',
          labels: { colors: textColor },
          fontFamily: fontFam,
        },
        tooltip: {
          theme: isDark ? 'dark' : 'light',
          y: { formatter: (val) => `₹${val.toLocaleString('en-IN')}` },
        },
        dataLabels: { enabled: false },
      };
    } else {
      this.expenseChartOptions = {};
    }

    if (summary.totalIncome > 0 || summary.totalExpense > 0) {
      this.barChartOptions = {
        series: [
          {
            name: 'Volume',
            data: [summary.totalIncome, summary.totalExpense],
          },
        ],
        chart: {
          type: 'bar',
          height: 240,
          background: cardBg,
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 6,
            distributed: true,
            barHeight: '42%',
          },
        },
        colors: [incomeColor, expenseColor],
        dataLabels: {
          enabled: true,
          textAnchor: 'start',
          style: { colors: ['#ffffff'], fontFamily: fontFam, fontWeight: 600 },
          formatter: (val) => `₹${Number(val).toLocaleString('en-IN')}`,
          offsetX: 10,
        },
        xaxis: {
          categories: ['Income', 'Expense'],
          labels: {
            style: { colors: textColor, fontFamily: fontFam },
            formatter: (val) => `₹${Number(val).toLocaleString('en-IN')}`,
          },
          axisBorder: { show: false },
        },
        yaxis: {
          labels: { style: { colors: textColor, fontFamily: fontFam, fontWeight: 600 } },
        },
        grid: {
          borderColor: gridColor,
          strokeDashArray: 4,
          yaxis: { lines: { show: false } },
        },
        tooltip: {
          theme: isDark ? 'dark' : 'light',
          y: { formatter: (val) => `₹${val.toLocaleString('en-IN')}` },
        },
      };
    } else {
      this.barChartOptions = {};
    }

    if (monthlyPoints.length > 0) {
      const categories = monthlyPoints.map((p) => p.month);
      const savingsSeries = monthlyPoints.map((p) => p.savings ?? (p.income - p.expense));

      this.savingsChartOptions = {
        series: [
          {
            name: 'Net Retained Savings',
            data: savingsSeries,
          },
        ],
        chart: {
          type: 'line',
          height: 240,
          background: cardBg,
          toolbar: { show: false },
          animations: { enabled: true, speed: 600 },
        },
        colors: [primaryIndigo],
        stroke: { curve: 'smooth', width: 3 },
        dataLabels: { enabled: false },
        xaxis: {
          categories,
          labels: { style: { colors: textColor, fontFamily: fontFam } },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          labels: {
            style: { colors: textColor, fontFamily: fontFam },
            formatter: (val) => `₹${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`,
          },
        },
        grid: {
          borderColor: gridColor,
          strokeDashArray: 4,
        },
        tooltip: {
          theme: isDark ? 'dark' : 'light',
          y: { formatter: (val) => `₹${val.toLocaleString('en-IN')}` },
        },
      };
    } else {
      this.savingsChartOptions = {};
    }
  }
}
