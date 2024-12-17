import { Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;

  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {}

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  onSubmit() {
    this.authService
      .forgotPassword(this.forgotPasswordForm.value.email)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
}
