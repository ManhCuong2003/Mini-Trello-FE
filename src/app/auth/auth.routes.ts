import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then((c) => c.RegisterComponent),
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./google-callback/google-callback.component').then(
        (c) => c.GoogleCallbackComponent
      ),
  },
  {
    // route mặc định cho auth/
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
