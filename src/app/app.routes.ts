import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
  },

  // Protected routes — nested under MainLayout
  {
    path: '',
    loadComponent: () => import('./shared/layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'gastos',
        loadComponent: () => import('./pages/gastos/gasto-list.component').then(m => m.GastoListComponent),
      },
      {
        path: 'gastos/nuevo',
        loadComponent: () => import('./pages/gastos/gasto-form.component').then(m => m.GastoFormComponent),
      },
      {
        path: 'gastos/:id/editar',
        loadComponent: () => import('./pages/gastos/gasto-form.component').then(m => m.GastoFormComponent),
      },
      {
        path: 'ingresos',
        loadComponent: () => import('./pages/ingresos/ingreso-list.component').then(m => m.IngresoListComponent),
      },
      {
        path: 'ingresos/nuevo',
        loadComponent: () => import('./pages/ingresos/ingreso-form.component').then(m => m.IngresoFormComponent),
      },
      {
        path: 'ingresos/:id/editar',
        loadComponent: () => import('./pages/ingresos/ingreso-form.component').then(m => m.IngresoFormComponent),
      },
      {
        path: 'presupuestos',
        loadComponent: () => import('./pages/presupuestos/presupuesto-list.component').then(m => m.PresupuestoListComponent),
      },
      {
        path: 'metas',
        loadComponent: () => import('./pages/metas/meta-list.component').then(m => m.MetaListComponent),
      },
      {
        path: 'deudas',
        loadComponent: () => import('./pages/deudas/deuda-list.component').then(m => m.DeudaListComponent),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
      },
      // Default redirect inside layout
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  // Wildcard redirect
  { path: '**', redirectTo: '/dashboard' },
];
