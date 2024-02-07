import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'access-portal',
    pathMatch: 'full',
  },
  {
    path: 'access-portal',
    loadComponent: () => import('./pages/access-portal/access-portal.page').then( m => m.AccessPortalPage)
  },
];
