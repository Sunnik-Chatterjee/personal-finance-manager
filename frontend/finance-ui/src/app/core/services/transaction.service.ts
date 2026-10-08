import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { ApiResponse } from '../models/user.model';
import {
  CategoriesResponse,
  CreateTransactionDto,
  Transaction,
  TransactionFilters,
  TransactionsListResponse,
  UpdateTransactionDto,
} from '../models/transaction.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/transactions`;

  private categoriesLoaded = false;
  private readonly _categories = signal<CategoriesResponse>({
    INCOME: ['Salary', 'Freelance', 'Investment', 'Other'],
    EXPENSE: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'],
  });

  readonly categories = this._categories.asReadonly();

  loadCategories(): Observable<ApiResponse<CategoriesResponse>> {
    if (this.categoriesLoaded) {
      return of({ success: true, data: this._categories(), message: 'Cached categories' });
    }
    return this.http.get<ApiResponse<CategoriesResponse>>(`${this.baseUrl}/categories`).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.categoriesLoaded = true;
          this._categories.set(res.data);
        }
      })
    );
  }

  getTransactions(filters: TransactionFilters = {}): Observable<ApiResponse<TransactionsListResponse>> {
    let params = new HttpParams();

    if (filters.type) params = params.set('type', filters.type);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<ApiResponse<TransactionsListResponse>>(this.baseUrl, { params });
  }

  getTransactionById(id: string): Observable<ApiResponse<Transaction>> {
    return this.http.get<ApiResponse<Transaction>>(`${this.baseUrl}/${id}`);
  }

  createTransaction(dto: CreateTransactionDto): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(this.baseUrl, dto);
  }

  updateTransaction(id: string, dto: UpdateTransactionDto): Observable<ApiResponse<Transaction>> {
    return this.http.put<ApiResponse<Transaction>>(`${this.baseUrl}/${id}`, dto);
  }

  deleteTransaction(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
