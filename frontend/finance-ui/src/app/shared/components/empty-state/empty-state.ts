import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input<string>('No transactions yet');
  readonly description = input<string>('Start tracking your income and expenses to unlock insights.');
  readonly actionLabel = input<string>('Add First Transaction');

  readonly actionClicked = output<void>();
}
