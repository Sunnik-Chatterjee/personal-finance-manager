import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { Transaction } from '../../../core/models/transaction.model';
import { formatINR } from '../../../core/utils/currency-formatter';

@Component({
  selector: 'app-transaction-item',
  templateUrl: './transaction-item.html',
  styleUrl: './transaction-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionItemComponent {
  readonly transaction = input.required<Transaction>();
  readonly allowActions = input<boolean>(true);

  readonly deleteRequested = output<string>();
  readonly editRequested = output<Transaction>();

  protected readonly confirmDelete = signal<boolean>(false);

  protected readonly formattedDate = computed(() => {
    const raw = this.transaction().date;
    if (!raw) return '';
    try {
      const d = new Date(raw);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return raw;
    }
  });

  protected readonly formattedAmount = computed(() => {
    const amount = this.transaction().amount;
    const type = this.transaction().type;
    return type === 'INCOME' ? `+${formatINR(amount)}` : `-${formatINR(amount)}`;
  });

  protected onCardClick(): void {
    if (this.confirmDelete()) {
      this.confirmDelete.set(false);
    }
  }

  protected toggleSlide(event: MouseEvent): void {
    event.stopPropagation();
    this.confirmDelete.update((v) => !v);
  }

  protected onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.editRequested.emit(this.transaction());
  }

  protected onConfirmDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteRequested.emit(this.transaction()._id);
    this.confirmDelete.set(false);
  }

  protected onCancelDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.confirmDelete.set(false);
  }
}
