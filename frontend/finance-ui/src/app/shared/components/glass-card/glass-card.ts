import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-glass-card',
  templateUrl: './glass-card.html',
  styleUrl: './glass-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlassCardComponent {
  readonly interactive = input<boolean>(false);
  readonly glow = input<boolean>(false);
  readonly variant = input<'standard' | 'hero' | 'secondary'>('standard');
}
