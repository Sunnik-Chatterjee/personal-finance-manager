import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ModalComponent } from '../modal/modal';
import { TransactionService } from '../../../core/services/transaction.service';
import {
  CreateTransactionDto,
  Transaction,
  TransactionType,
} from '../../../core/models/transaction.model';

@Component({
  selector: 'app-transaction-modal',
  imports: [ModalComponent],
  templateUrl: './transaction-modal.html',
  styleUrl: './transaction-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionModalComponent {
  private readonly transactionService = inject(TransactionService);

  readonly isOpen = input.required<boolean>();
  readonly transactionToEdit = input<Transaction | null>(null);

  readonly closed = output<void>();
  readonly saved = output<void>();

  protected readonly type = signal<TransactionType>('EXPENSE');
  protected readonly amount = signal<string>('');
  protected readonly category = signal<string>('Food');
  protected readonly description = signal<string>('');
  protected readonly date = signal<string>(new Date().toISOString().split('T')[0]);

  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');

  protected readonly isEditMode = computed(() => !!this.transactionToEdit());

  protected readonly availableCategories = computed(() => {
    const cats = this.transactionService.categories();
    return this.type() === 'INCOME' ? cats.INCOME : cats.EXPENSE;
  });

  constructor() {
    effect(() => {
      const editTx = this.transactionToEdit();
      if (editTx) {
        this.type.set(editTx.type);
        this.amount.set(editTx.amount.toString());
        this.category.set(editTx.category);
        this.description.set(editTx.description || '');
        this.date.set(editTx.date ? editTx.date.split('T')[0] : new Date().toISOString().split('T')[0]);
      } else {
        this.resetForm();
      }
    });

    effect(() => {
      const categories = this.availableCategories();
      if (!categories.includes(this.category()) && categories.length > 0) {
        this.category.set(categories[0]);
      }
    });
  }

  protected setType(newType: TransactionType): void {
    this.type.set(newType);
    const available = newType === 'INCOME'
      ? this.transactionService.categories().INCOME
      : this.transactionService.categories().EXPENSE;
    if (available.length > 0) {
      this.category.set(available[0]);
    }
  }

  protected onAmountChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.amount.set(target.value);
  }

  protected onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.category.set(target.value);
  }

  protected onDescriptionChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.description.set(target.value);
  }

  protected onDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.date.set(target.value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const numAmount = parseFloat(this.amount());
    if (isNaN(numAmount) || numAmount <= 0) {
      this.errorMessage.set('Please enter a valid positive amount.');
      return;
    }

    if (!this.category()) {
      this.errorMessage.set('Please select a category.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const dto: CreateTransactionDto = {
      type: this.type(),
      amount: numAmount,
      category: this.category(),
      description: this.description().trim() || undefined,
      date: this.date(),
    };

    const editTx = this.transactionToEdit();
    const request$ = editTx
      ? this.transactionService.updateTransaction(editTx._id, dto)
      : this.transactionService.createTransaction(dto);

    request$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.saved.emit();
          this.onClose();
        } else {
          this.errorMessage.set(res.message || 'Operation failed');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to save transaction');
      },
    });
  }

  protected onClose(): void {
    this.resetForm();
    this.closed.emit();
  }

  private resetForm(): void {
    this.type.set('EXPENSE');
    this.amount.set('');
    this.category.set('Food');
    this.description.set('');
    this.date.set(new Date().toISOString().split('T')[0]);
    this.errorMessage.set('');
    this.submitting.set(false);
  }
}
