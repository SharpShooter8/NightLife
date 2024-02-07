import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
      },
      {
        path: 'map',
        loadComponent: () => import('./pages/map/map.page').then( m => m.MapPage)
      },
    ],
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
