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
  selector: 'app-register',
  imports: [FormsModule, RouterLink, FinanceMascot],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
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

    const name = this.name().trim();
    const email = this.email().trim();
    const password = this.password();
    const confirmPassword = this.confirmPassword();

    if (!name || !email || !password || !confirmPassword) {
      this.formError.set('Please fill in all fields.');
      this.mood.set('failure');
      return;
    }

    if (password.length < 8) {
      this.formError.set('Password must be at least 8 characters.');
      this.mood.set('failure');
      return;
    }

    if (password !== confirmPassword) {
      this.formError.set('Passwords do not match.');
      this.mood.set('failure');
      return;
    }

    this.formError.set('');
    this.submitting.set(true);
    this.mood.set('loading');

    this.authService.register({ name, email, password }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.mood.set('success');
          this.toastService.success('Registration successful! Welcome to BroFin.');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 400);
        } else {
          this.mood.set('failure');
          this.formError.set(res.message || 'Registration failed.');
          this.toastService.error(res.message || 'Registration failed.');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.mood.set('failure');
        this.formError.set(err.error?.message || 'Registration failed. Please try again.');
        this.toastService.error(err.error?.message || 'Registration failed. Please try again.');
      },
    });
  }
}
