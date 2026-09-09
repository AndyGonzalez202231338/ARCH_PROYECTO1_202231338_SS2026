import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AppLayout } from './layout/app-layout/app-layout';
import { authGuard } from './core/guards/auth-guard';
// import { roleGuard } from './core/guards/role-guard'; // lo usas cuando agregues pestañas por rol

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [authGuard], data: { publicOnly: true } },
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      // futuras pestañas van aquí, ej:
      // { path: 'productos', component: ProductosComponent, canActivate: [roleGuard], data: { roles: ['ADMIN','COMPRAS','INVENTARIO','VENTAS'] } },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];