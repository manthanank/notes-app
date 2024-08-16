import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  private tokenExpirationTimer: any;

  http = inject(HttpClient);
  router = inject(Router);

  constructor() {
    this.autoLogin();
  }

  redirectToNotes() {
    this.router.navigate(['/notes']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  register(user: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/register`, user)
      .pipe(tap((response: any) => {}));
  }

  login(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, user).pipe(
      tap((response: any) => {
        this.handleAuthentication(response.token, response.expiresIn);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpirationDate');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    // this.router.navigate(['/login']);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, {
      password,
    });
  }

  private handleAuthentication(token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpirationDate', expirationDate.toISOString());
    this.autoLogout(expiresIn * 1000);
  }

  autoLogin() {
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
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
}
