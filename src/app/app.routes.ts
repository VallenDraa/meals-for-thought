import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent() {
          return import('./features/discover/discover.component').then(
            (module) => module.DiscoverComponent
          );
        },
      },
      {
        path: 'profile',
        loadComponent() {
          return import('./features/discover/discover.component').then(
            (module) => module.DiscoverComponent
          );
        },
      },
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        title: 'Login | MealsForThought',
        loadComponent() {
          return import('./core/auth/pages/login/login.component').then(
            (module) => module.LoginComponent
          );
        },
      },
      {
        path: 'register',
        title: 'Register | MealsForThought',
        loadComponent() {
          return import('./core/auth/pages/register/register.component').then(
            (module) => module.RegisterComponent
          );
        },
      },
    ],
  },
];
