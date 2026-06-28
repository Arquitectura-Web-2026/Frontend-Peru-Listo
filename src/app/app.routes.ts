import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

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
        path: 'presupuestos/nuevo',
        loadComponent: () => import('./pages/presupuestos/presupuesto-form.component').then(m => m.PresupuestoFormComponent),
      },
      {
        path: 'presupuestos/:id/editar',
        loadComponent: () => import('./pages/presupuestos/presupuesto-form.component').then(m => m.PresupuestoFormComponent),
      },
      {
        path: 'metas',
        loadComponent: () => import('./pages/metas/meta-list.component').then(m => m.MetaListComponent),
      },
      {
        path: 'metas/nuevo',
        loadComponent: () => import('./pages/metas/meta-form.component').then(m => m.MetaFormComponent),
      },
      {
        path: 'metas/:id/editar',
        loadComponent: () => import('./pages/metas/meta-form.component').then(m => m.MetaFormComponent),
      },
      {
        path: 'deudas',
        loadComponent: () => import('./pages/deudas/deuda-list.component').then(m => m.DeudaListComponent),
      },
      {
        path: 'deudas/nuevo',
        loadComponent: () => import('./pages/deudas/deuda-form.component').then(m => m.DeudaFormComponent),
      },
      {
        path: 'deudas/:id/editar',
        loadComponent: () => import('./pages/deudas/deuda-form.component').then(m => m.DeudaFormComponent),
      },
      {
        path: 'categorias',
        loadComponent: () => import('./pages/categorias/categoria-list.component').then(m => m.CategoriaListComponent),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
      },
      // Educación Financiera
      {
        path: 'educacion',
        loadComponent: () => import('./pages/educacion/articulo-list.component').then(m => m.ArticuloListComponent),
      },
      {
        path: 'educacion/categoria/:categoria',
        loadComponent: () => import('./pages/educacion/articulo-list.component').then(m => m.ArticuloListComponent),
      },
      {
        path: 'educacion/:id',
        loadComponent: () => import('./pages/educacion/articulo-detail.component').then(m => m.ArticuloDetailComponent),
      },
      // Admin (protected by authGuard already from parent + adminGuard)
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'admin/articulos',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/articulos/admin-articulo-list.component').then(m => m.AdminArticuloListComponent),
      },
      {
        path: 'admin/articulos/nuevo',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/articulos/admin-articulo-form.component').then(m => m.AdminArticuloFormComponent),
      },
      {
        path: 'admin/articulos/:id/editar',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/articulos/admin-articulo-form.component').then(m => m.AdminArticuloFormComponent),
      },
      {
        path: 'admin/usuarios',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/usuarios/admin-usuario-list.component').then(m => m.AdminUsuarioListComponent),
      },
      {
        path: 'admin/usuarios/:id',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/usuarios/admin-usuario-detail.component').then(m => m.AdminUsuarioDetailComponent),
      },
      // Default redirect inside layout
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  // Wildcard redirect
  { path: '**', redirectTo: '/dashboard' },
];
