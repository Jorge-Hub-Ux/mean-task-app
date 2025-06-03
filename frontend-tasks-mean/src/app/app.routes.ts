import { Routes } from '@angular/router';
import { APP_ROUTING } from './shared/models/routes.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: APP_ROUTING.AUTH,
    pathMatch: 'full',
  },
  {
    path: APP_ROUTING.AUTH,
    loadComponent: () =>
      import('./modules/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: APP_ROUTING.TASKS,
    loadComponent: () =>
      import('./modules/tasks/tasks.component').then((m) => m.TasksComponent),
  },
  {
    path: '**',
    redirectTo: APP_ROUTING.AUTH,
    pathMatch: 'full',
  },
];
