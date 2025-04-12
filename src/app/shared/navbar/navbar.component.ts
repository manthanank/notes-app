import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, NgClass],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  authService = inject(AuthService);
  router = inject(Router);
  themeService = inject(ThemeService);
  showMobileMenu = signal(false);

  constructor() {}

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.set(!this.showMobileMenu());
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.showMobileMenu.set(false);
  }
}
