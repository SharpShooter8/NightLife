import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard'
import { AccessPortalPage } from './pages/access-portal/access-portal.page';
import { ProfilePage } from './pages/profile/profile.page';
import { MapPage } from './pages/map/map.page';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['home/map']);

export const routes: Routes = [

  {
    path: 'access-portal',
    component: AccessPortalPage,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToHome }
  },

  {
    path: 'home',
    component: HomePage,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    children: [
      {
        path: 'profile',
        component: ProfilePage,
      },
      {
        path: 'map',
        component: MapPage,
      },
    ],
  },

  {
    path: '',
    redirectTo: 'access-portal',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'access-portal',
    pathMatch: 'full',
  },

];
