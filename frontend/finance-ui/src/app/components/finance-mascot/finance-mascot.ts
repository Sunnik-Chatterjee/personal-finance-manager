import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  Alignment,
  DataType,
  Fit,
  Layout,
  Rive,
  RuntimeLoader,
  type ViewModelInstance,
  type ViewModelInstanceBoolean,
  type ViewModelInstanceEnum,
  type ViewModelInstanceTrigger,
} from '@rive-app/canvas';
import { RIVE_MASCOT } from '../../rive/rive-mascot.config';

export type MascotMood =
  | 'idle'
  | 'email'
  | 'password'
  | 'loading'
  | 'success'
  | 'failure';

@Component({
  selector: 'app-finance-mascot',
  templateUrl: './finance-mascot.html',
  styleUrl: './finance-mascot.scss',
})
export class FinanceMascot {
  readonly mood = input<MascotMood>('idle');

  private readonly canvasRef =
    viewChild<ElementRef<HTMLCanvasElement>>('riveCanvas');
  private readonly destroyRef = inject(DestroyRef);

  protected readonly hasError = signal<boolean>(false);

  private rive: Rive | null = null;
  private viewModel: ViewModelInstance | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    try {
      RuntimeLoader.setWasmUrl(RIVE_MASCOT.wasmUrl);
      RuntimeLoader.setWasmFallbackUrl(RIVE_MASCOT.wasmFallbackUrl);
    } catch {
      this.hasError.set(true);
    }

    afterNextRender(() => this.mount());

    effect(() => {
      this.mood();
      this.applyMood();
    });

    this.destroyRef.onDestroy(() => this.teardown());
  }

  private mount(): void {
    const canvasEl = this.canvasRef()?.nativeElement;
    if (!canvasEl) {
      this.hasError.set(true);
      return;
    }

    try {
      this.rive = new Rive({
        src: RIVE_MASCOT.src,
        canvas: canvasEl,
        autoplay: true,
        autoBind: true,
        artboard: RIVE_MASCOT.artboard,
        stateMachine: RIVE_MASCOT.stateMachine,
        layout: new Layout({
          fit: Fit.Contain,
          alignment: Alignment.Center,
        }),
        onLoad: () => {
          this.rive?.resizeDrawingSurfaceToCanvas();
          this.viewModel = this.rive?.viewModelInstance ?? null;
          this.applyMood();
        },
        onLoadError: () => {
          this.hasError.set(true);
        },
      });

      this.resizeObserver = new ResizeObserver(() => {
        this.rive?.resizeDrawingSurfaceToCanvas();
      });
      this.resizeObserver.observe(canvasEl);
    } catch {
      this.hasError.set(true);
    }
  }

  private applyMood(): void {
    const vmi = this.viewModel;
    if (!vmi) {
      return;
    }

    try {
      const { properties, financialStateValues, wrongAnswerValue } = RIVE_MASCOT;
      this.setBoolean(vmi, properties.emailFocus, false);
      this.setBoolean(vmi, properties.passwordFocus, false);
      this.setBoolean(vmi, properties.loading, false);

      switch (this.mood()) {
        case 'email':
          this.setBoolean(vmi, properties.emailFocus, true);
          this.setEnum(vmi, properties.financialStates, financialStateValues.idle);
          break;
        case 'password':
          this.setBoolean(vmi, properties.passwordFocus, true);
          this.setEnum(vmi, properties.financialStates, financialStateValues.idle);
          break;
        case 'loading':
          this.setBoolean(vmi, properties.loading, true);
          break;
        case 'success':
          this.setEnum(vmi, properties.financialStates, financialStateValues.success);
          this.fireTrigger(vmi, properties.successTrigger);
          break;
        case 'failure':
          this.setEnum(vmi, properties.financialStates, financialStateValues.failure);
          this.setEnum(vmi, properties.wrongAnswers, wrongAnswerValue);
          break;
        default:
          this.setEnum(vmi, properties.financialStates, financialStateValues.idle);
          break;
      }
    } catch {
      // Ignore animation state failure
    }
  }

  private setBoolean(vmi: ViewModelInstance, name: string, value: boolean): void {
    const property = this.findBoolean(vmi, name);
    if (property) {
      property.value = value;
    }
  }

  private setEnum(vmi: ViewModelInstance, name: string, value: string): void {
    const property = this.findEnum(vmi, name);
    if (property) {
      property.value = value;
    }
  }

  private fireTrigger(vmi: ViewModelInstance, name: string): void {
    this.findTrigger(vmi, name)?.trigger();
  }

  private findBoolean(
    vmi: ViewModelInstance,
    name: string,
  ): ViewModelInstanceBoolean | null {
    return vmi.boolean(name) ?? this.searchNested(vmi, (node) => node.boolean(name));
  }

  private findEnum(
    vmi: ViewModelInstance,
    name: string,
  ): ViewModelInstanceEnum | null {
    return vmi.enum(name) ?? this.searchNested(vmi, (node) => node.enum(name));
  }

  private findTrigger(
    vmi: ViewModelInstance,
    name: string,
  ): ViewModelInstanceTrigger | null {
    return vmi.trigger(name) ?? this.searchNested(vmi, (node) => node.trigger(name));
  }

  private searchNested<T>(
    vmi: ViewModelInstance,
    read: (node: ViewModelInstance) => T | null,
  ): T | null {
    for (const property of vmi.properties) {
      if (property.type !== DataType.viewModel) {
        continue;
      }
      const nested = vmi.viewModel(property.name);
      if (!nested) {
        continue;
      }
      const found = read(nested) ?? this.searchNested(nested, read);
      if (found) {
        return found;
      }
    }
    return null;
  }

  private teardown(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.viewModel = null;
    try {
      this.rive?.cleanup();
    } catch {
      // ignore
    }
    this.rive = null;
  }
}
