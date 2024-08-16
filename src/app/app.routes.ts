import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { NoteResolverService } from './core/services/notes-resolver.service';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'notes',
    loadComponent: () =>
      import('./components/note-list/note-list.component').then(
        (m) => m.NoteListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'note/:id',
    loadComponent: () =>
      import('./components/note-detail/note-detail.component').then(
        (m) => m.NoteDetailComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'new-note',
    loadComponent: () =>
      import('./components/note-form/note-form.component').then(
        (m) => m.NoteFormComponent
      ),
  },
  {
    path: 'edit-note/:id',
    loadComponent: () =>
      import('./components/note-form/note-form.component').then(
        (m) => m.NoteFormComponent
      ),
    canActivate: [AuthGuard],
    resolve: {
      note: NoteResolverService,
    },
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password/:token',
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
