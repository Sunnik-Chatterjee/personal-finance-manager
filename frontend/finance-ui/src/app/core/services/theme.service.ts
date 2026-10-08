import { Injectable, computed, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'brofin_theme_preference';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly _themeMode = signal<ThemeMode>(this.getInitialThemeMode());
  private readonly _systemIsDark = signal<boolean>(this.getSystemDarkPreference());

  readonly themeMode = this._themeMode.asReadonly();
  
  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const mode = this._themeMode();
    if (mode === 'auto') {
      return this._systemIsDark() ? 'dark' : 'light';
    }
    return mode;
  });

  readonly isDark = computed<boolean>(() => this.resolvedTheme() === 'dark');

  constructor() {
    this.applyTheme(this.resolvedTheme());
    this.listenToSystemChanges();
  }

  setTheme(mode: ThemeMode): void {
    this._themeMode.set(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
    this.applyTheme(this.resolvedTheme());
  }

  private getInitialThemeMode(): ThemeMode {
    try {
      const saved = (localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('aurora_theme_preference')) as ThemeMode | null;
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
        return saved;
      }
    } catch {}
    return 'auto';
  }

  private getSystemDarkPreference(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  private listenToSystemChanges(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        this._systemIsDark.set(e.matches);
        if (this._themeMode() === 'auto') {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  private applyTheme(theme: ResolvedTheme): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
    }
  }
}
