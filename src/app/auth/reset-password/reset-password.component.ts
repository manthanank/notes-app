import { Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup = new FormGroup({});
  token: string;

  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  fb = inject(FormBuilder);

  constructor() {
    this.token = this.route.snapshot.paramMap.get('token')!;
    this.resetPasswordForm = this.fb.group({
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {}

  get password() {
    return this.resetPasswordForm.get('password');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  onSubmit() {
    if (
      this.resetPasswordForm.value.password !==
      this.resetPasswordForm.value.confirmPassword
    ) {
      console.error('Passwords do not match');
      return;
    }

    this.authService
      .resetPassword(this.token, this.resetPasswordForm.value.password)
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
