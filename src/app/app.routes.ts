import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/registro/registro').then(m => m.Registro)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    children: [
      { path: 'inicio', loadComponent: () => import('./features/inicio/inicio').then(m => m.Inicio) },
      { path: 'perfil', loadComponent: () => import('./features/perfil/perfil').then(m => m.Perfil) },
      { path: 'mascotas', loadComponent: () => import('./features/mascotas/lista/mascotas-lista').then(m => m.MascotasLista) },
      { path: 'mascotas/nueva', loadComponent: () => import('./features/mascotas/form/mascota-form').then(m => m.MascotaForm) },
      { path: 'mascotas/:id/editar', loadComponent: () => import('./features/mascotas/form/mascota-form').then(m => m.MascotaForm) },
      { path: 'mascotas/:id', loadComponent: () => import('./features/mascotas/detalle/mascota-detalle').then(m => m.MascotaDetalle) },
      { path: 'citas', loadComponent: () => import('./features/citas/lista/citas-lista').then(m => m.CitasLista) },
      { path: 'citas/nueva', loadComponent: () => import('./features/citas/form/cita-form').then(m => m.CitaForm) },
      { path: 'citas/:id/editar', loadComponent: () => import('./features/citas/form/cita-form').then(m => m.CitaForm) },
      { path: 'clinicas', loadComponent: () => import('./features/directorio/directorio').then(m => m.Directorio) }
    ]
  },
  { path: '**', redirectTo: 'inicio' }
];
