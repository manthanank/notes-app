import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated and has admin role
  const currentUser = authService.getCurrentUser();
  if (authService.isAuthenticated() && currentUser?.roles?.includes('admin')) {
    return true;
  }
  
  // Not an admin, redirect to home page
  router.navigate(['/']);
  return false;
};