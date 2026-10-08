import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/user.model';
import { DashboardSummary, FinancialInsight } from '../models/dashboard.model';
import { environment } from '../../../environments/environment';
import { formatINR } from '../utils/currency-formatter';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  getSummary(): Observable<ApiResponse<DashboardSummary>> {
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.apiUrl}/summary`);
  }

  calculateSavingsRate(income: number, expense: number): number {
    if (income <= 0) return 0;
    return Math.round(((income - expense) / income) * 100);
  }

  generateInsight(summary: DashboardSummary): FinancialInsight {
    const { totalIncome, totalExpense, balance } = summary;
    const savingsRate = this.calculateSavingsRate(totalIncome, totalExpense);

    if (totalIncome === 0 && totalExpense === 0) {
      return {
        type: 'info',
        text: 'Welcome to Aurora Finance',
        subtext: 'Add your first transaction to unlock deep automated analytics & cash flow trends.',
      };
    }

    if (savingsRate >= 30) {
      return {
        type: 'positive',
        text: `Impressive! You are saving ${savingsRate}% of your income.`,
        subtext: 'Your current net cash flow is healthy and well-balanced.',
      };
    }

    if (balance < 0) {
      return {
        type: 'warning',
        text: 'Expenses exceed income this period.',
        subtext: `Deficit of ${formatINR(Math.abs(balance))}. Consider reviewing discretionary spending.`,
      };
    }

    return {
      type: 'positive',
      text: `Savings rate is currently at ${savingsRate}%.`,
      subtext: 'Steady financial performance. Keep tracking all your inflows and outflows.',
    };
  }
}
