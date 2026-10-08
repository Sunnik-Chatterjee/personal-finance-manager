import { Transaction } from './transaction.model';

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate?: number;
  monthlyCashFlow?: CashFlowPoint[];
  categoryBreakdown?: CategoryBreakdown[];
  recentTransactions: Transaction[];
  totalTransactionsCount?: number;
}

export interface FinancialInsight {
  type: 'positive' | 'warning' | 'info';
  text: string;
  subtext: string;
}

export interface CashFlowPoint {
  month: string;
  income: number;
  expense: number;
  savings?: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}
