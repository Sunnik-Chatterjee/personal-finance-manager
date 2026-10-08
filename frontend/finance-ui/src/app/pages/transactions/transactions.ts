import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card';
import { TransactionItemComponent } from '../../shared/components/transaction-item/transaction-item';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { TransactionModalComponent } from '../../shared/components/transaction-modal/transaction-modal';
import { TransactionService } from '../../core/services/transaction.service';
import { ToastService } from '../../core/services/toast.service';
import {
  PaginationMeta,
  Transaction,
  TransactionFilters,
  TransactionType,
} from '../../core/models/transaction.model';

@Component({
  selector: 'app-transactions',
  imports: [
    NavbarComponent,
    GlassCardComponent,
    TransactionItemComponent,
    EmptyStateComponent,
    TransactionModalComponent,
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Transactions implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly toastService = inject(ToastService);

  protected readonly transactions = signal<Transaction[]>([]);
  protected readonly pagination = signal<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  protected readonly loading = signal<boolean>(false);

  protected readonly searchQuery = signal<string>('');
  protected readonly selectedType = signal<string>('');
  protected readonly selectedCategory = signal<string>('');
  protected readonly dateFrom = signal<string>('');
  protected readonly dateTo = signal<string>('');

  protected readonly isModalOpen = signal<boolean>(false);
  protected readonly selectedTransactionForEdit = signal<Transaction | null>(null);

  protected readonly categoryOptions = computed(() => {
    const cats = this.transactionService.categories();
    const type = this.selectedType();
    if (type === 'INCOME') return cats.INCOME;
    if (type === 'EXPENSE') return cats.EXPENSE;
    return Array.from(new Set([...cats.INCOME, ...cats.EXPENSE]));
  });

  ngOnInit(): void {
    this.transactionService.loadCategories().subscribe({ error: () => {} });
    this.loadTransactions();
  }

  protected loadTransactions(page: number = 1): void {
    this.loading.set(true);

    const filters: TransactionFilters = {
      page,
      limit: 10,
    };

    if (this.selectedType()) {
      filters.type = this.selectedType() as TransactionType;
    }
    if (this.selectedCategory()) {
      filters.category = this.selectedCategory();
    }
    if (this.dateFrom()) {
      filters.dateFrom = this.dateFrom();
    }
    if (this.dateTo()) {
      filters.dateTo = this.dateTo();
    }

    this.transactionService.getTransactions(filters).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          let list = res.data.transactions;
          const query = this.searchQuery().trim().toLowerCase();
          if (query) {
            list = list.filter(
              (tx) =>
                (tx.description && tx.description.toLowerCase().includes(query)) ||
                tx.category.toLowerCase().includes(query)
            );
          }
          this.transactions.set(list);
          this.pagination.set(res.data.pagination);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.loadTransactions(1);
    }, 280);
  }

  protected onTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedType.set(target.value);
    this.selectedCategory.set('');
    this.loadTransactions(1);
  }

  protected onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory.set(target.value);
    this.loadTransactions(1);
  }

  protected onDateFromChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dateFrom.set(target.value);
    this.loadTransactions(1);
  }

  protected onDateToChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dateTo.set(target.value);
    this.loadTransactions(1);
  }

  protected resetFilters(): void {
    this.searchQuery.set('');
    this.selectedType.set('');
    this.selectedCategory.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.loadTransactions(1);
  }

  protected goToPage(page: number): void {
    this.loadTransactions(page);
  }

  protected openAddModal(): void {
    this.selectedTransactionForEdit.set(null);
    this.isModalOpen.set(true);
  }

  protected onEditTransaction(transaction: Transaction): void {
    this.selectedTransactionForEdit.set(transaction);
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedTransactionForEdit.set(null);
  }

  protected onTransactionSaved(): void {
    this.loadTransactions(this.pagination().page);
    this.toastService.success('Transaction saved successfully!');
  }

  protected onDeleteTransaction(id: string): void {
    this.transactionService.deleteTransaction(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadTransactions(this.pagination().page);
          this.toastService.success('Transaction deleted.');
        }
      },
    });
  }
}
