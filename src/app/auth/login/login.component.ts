import { Component, inject, signal } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink, NgClass],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  error = signal<string>('');
  showPassword = signal<boolean>(false);

  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((state) => !state);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.authService
      .login({
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      })
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          this.router.navigate(['/notes']);
        },
        error: (err) => {
          console.error(err);
          this.error.set(err?.error?.message || 'An error occurred');
        },
      });
  }
}
