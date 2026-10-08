import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  FinanceMascot,
  type MascotMood,
} from '../../components/finance-mascot/finance-mascot';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, FinanceMascot],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly mood = signal<MascotMood>('idle');
  protected readonly submitting = signal(false);
  protected readonly formError = signal('');

  protected onEmailFocus(): void {
    if (!this.submitting()) {
      this.mood.set('email');
    }
  }

  protected onPasswordFocus(): void {
    if (!this.submitting()) {
      this.mood.set('password');
    }
  }

  protected onFieldBlur(): void {
    if (!this.submitting() && this.mood() !== 'success' && this.mood() !== 'failure') {
      this.mood.set('idle');
    }
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.submitting()) {
      return;
    }

    const email = this.email().trim();
    const password = this.password();

    if (!email || !password) {
      this.formError.set('Please fill in both email and password.');
      this.mood.set('failure');
      return;
    }

    this.formError.set('');
    this.submitting.set(true);
    this.mood.set('loading');

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.mood.set('success');
          this.toastService.success('Login successful! Welcome back.');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 400);
        } else {
          this.mood.set('failure');
          this.formError.set(res.message || 'Login failed. Please verify credentials.');
          this.toastService.error(res.message || 'Login failed. Please verify credentials.');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.mood.set('failure');
        this.formError.set(err.error?.message || 'Invalid email or password.');
        this.toastService.error(err.error?.message || 'Invalid email or password.');
      },
    });
  }
}
