import { Component, inject, OnInit, signal } from '@angular/core';
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
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterLink, NgClass],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  error = signal<string>('');
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((state) => !state);
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.authService
      .register({
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
      })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          localStorage.setItem('token', res.token);
          this.router.navigate(['/notes']);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
          this.error.set(err?.error?.message || 'An error occurred');
        },
      });
  }
}
