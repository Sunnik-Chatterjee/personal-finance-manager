import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  
  protected readonly toasts = this.toastService.toasts;
  
  protected close(id: string): void {
    this.toastService.remove(id);
  }
}
