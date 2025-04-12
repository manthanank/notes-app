import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, PasswordResetResponse, UserCredentials } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  private tokenExpirationTimer: number | null = null;
  private currentUser: any = null;

  http = inject(HttpClient);
  router = inject(Router);

  constructor() {
    this.autoLogin();
  }

  redirectToNotes(): void {
    this.router.navigate(['/notes']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    // Try to load from localStorage
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
      return this.currentUser;
    }
    
    return null;
  }

  register(user: UserCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, user)
      .pipe(tap((response: AuthResponse) => {
        this.handleAuthentication(response.token, response.expiresIn, response.user);
      }));
  }

  login(user: UserCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, user).pipe(
      tap((response: AuthResponse) => {
        this.handleAuthentication(response.token, response.expiresIn, response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpirationDate');
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  forgotPassword(email: string): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.apiUrl}/reset-password/${token}`, {
      password,
    });
  }

  private handleAuthentication(token: string, expiresIn: number, user: any): void {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpirationDate', expirationDate.toISOString());
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUser = user;
    this.autoLogout(expiresIn * 1000);
  }

  autoLogin(): void {
    const token = this.getToken();
    const expirationDate = new Date(
      localStorage.getItem('tokenExpirationDate') || ''
    );
    if (!token || expirationDate <= new Date()) {
      this.logout();
      return;
    }
    const expiresIn = expirationDate.getTime() - new Date().getTime();
    this.autoLogout(expiresIn);
    
    // Load current user
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
    }
  }

  autoLogout(expirationDuration: number): void {
    this.tokenExpirationTimer = window.setTimeout(() => {
      this.logout();
    }, expirationDuration) as unknown as number;
  }
  
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && user.roles && user.roles.includes('admin');
  }
}
