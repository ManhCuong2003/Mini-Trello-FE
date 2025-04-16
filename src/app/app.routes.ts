import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((c) => c.AUTH_ROUTES),
  },
  {
    path: 'boards',
    loadComponent: () =>
      import('./components/board-list/board-list.component').then(
        (c) => c.BoardListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'boards/:boardId',
    loadComponent: () =>
      import('./components/board-detail/board-detail.component').then(
        (c) => c.BoardDetailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'boards',
    pathMatch: 'full',
  },
  // Wildcard route
  { path: '**', redirectTo: 'boards' },
];
