import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiResponse, AuthResponse, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'brofin_auth_token';
const USER_KEY = 'brofin_auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly _currentUser = signal<User | null>(this.getStoredUser());
  private readonly _token = signal<string | null>(this.getStoredToken());

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  register(dto: { name: string; email: string; password: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, dto).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setAuthSession(res.data.token, res.data.user);
        }
      })
    );
  }

  login(dto: { email: string; password: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, dto).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setAuthSession(res.data.token, res.data.user);
        }
      })
    );
  }

  logout(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
    this._token.set(null);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  setAuthSession(token: string, user: User): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
    this._token.set(token);
    this._currentUser.set(user);
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('aurora_auth_token');
    } catch {
      return null;
    }
  }

  private getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('aurora_auth_user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
