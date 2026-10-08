import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'app-rolling-number',
  templateUrl: './rolling-number.html',
  styleUrl: './rolling-number.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RollingNumberComponent {
  readonly value = input.required<number>();
  readonly prefix = input<string>('');
  readonly suffix = input<string>('');
  readonly decimals = input<number>(0);
  readonly duration = input<number>(0.7); // 700ms as per design spec

  private readonly numberDisplay = viewChild<ElementRef<HTMLElement>>('numberDisplay');

  protected readonly animatedValue = signal<number>(0);

  protected readonly formattedValue = computed(() => {
    const val = this.animatedValue();
    const dec = this.decimals();
    // For rolling numbers in currency context, use fixed 2 decimal places
    // But allow override for non-currency use cases
    // Use toLocaleString directly since prefix/suffix are handled by template
    return val.toLocaleString('en-IN', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    });
  });

  private tween: gsap.core.Tween | null = null;
  private currentNum = 0;

  constructor() {
    effect(() => {
      const targetVal = this.value();
      this.animateTo(targetVal);
    });
  }

  private animateTo(target: number): void {
    if (this.tween) {
      this.tween.kill();
    }

    const obj = { val: this.currentNum };

    this.tween = gsap.to(obj, {
      val: target,
      duration: this.duration(),
      ease: 'power2.out',
      onUpdate: () => {
        this.animatedValue.set(obj.val);
      },
      onComplete: () => {
        this.currentNum = target;
        this.animatedValue.set(target);
      },
    });

    const el = this.numberDisplay()?.nativeElement;
    if (el) {
      gsap.fromTo(
        el,
        { y: -3, opacity: 0.8 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power1.out' }
      );
    }
  }
}
