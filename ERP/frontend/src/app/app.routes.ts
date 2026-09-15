import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AppLayout } from './layout/app-layout/app-layout';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

const placeholder = () =>
  import('./shared/placeholder-page/placeholder-page').then(
    m => m.PlaceholderPage
  );

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [authGuard], data: { publicOnly: true } },
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },

      // --- Gestión de usuarios: solo ADMIN ---
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { permission: 'usuarios', title: 'Usuarios' },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/administracion/usuarios/pages/usuarios-lista/usuarios-lista').then(
                m => m.UsuariosLista,
              ),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/administracion/usuarios/pages/usuario-form/usuario-form').then(
                m => m.UsuarioForm,
              ),
          },
          {
            path: ':id/editar',
            loadComponent: () =>
              import('./features/administracion/usuarios/pages/usuario-form/usuario-form').then(
                m => m.UsuarioForm,
              ),
          },
        ],
      },

      // --- Productos ---
      {
        path: 'productos',
        canActivate: [roleGuard],
        data: { permission: 'productos', title: 'Productos' },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/productos/pages/producto-lista/producto-lista').then(
                m => m.ProductoLista,
              ),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/productos/pages/producto-form/producto-form').then(
                m => m.ProductoForm,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/productos/pages/producto-detalle/producto-detalle').then(
                m => m.ProductoDetalle,
              ),
          },
          {
            path: ':id/editar',
            loadComponent: () =>
              import('./features/productos/pages/producto-form/producto-form').then(
                m => m.ProductoForm,
              ),
          },
        ],
      },

      // --- Proveedores ---
      {
        path: 'proveedores',
        canActivate: [roleGuard],
        data: { permission: 'proveedores', title: 'Proveedores' },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/proveedores/pages/proveedor-lista/proveedor-lista').then(
                m => m.ProveedorLista,
              ),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/proveedores/pages/proveedor-form/proveedor-form').then(
                m => m.ProveedorForm,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/proveedores/pages/proveedor-detalle/proveedor-detalle').then(
                m => m.ProveedorDetalle,
              ),
          },
          {
            path: ':id/editar',
            loadComponent: () =>
              import('./features/proveedores/pages/proveedor-form/proveedor-form').then(
                m => m.ProveedorForm,
              ),
          },
        ],
      },

      // --- Clientes ---
      {
        path: 'clientes',
        canActivate: [roleGuard],
        data: { permission: 'clientes', title: 'Clientes' },
        loadComponent: placeholder,
      },

      // --- Compras ---
      {
        path: 'compras',
        canActivate: [roleGuard],
        data: { permission: 'compras-consultar', title: 'Compras' },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/compras/pages/compra-lista/compra-lista').then(
                m => m.CompraLista,
              ),
          },
          {
            path: 'nueva',
            canActivate: [roleGuard],
            data: { permission: 'compras-registrar', title: 'Registrar compra' },
            loadComponent: () =>
              import('./features/compras/pages/compra-form/compra-form').then(
                m => m.CompraForm,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/compras/pages/compra-detalle/compra-detalle').then(
                m => m.CompraDetalle,
              ),
          },
        ],
      },

      // --- Ventas ---
      {
        path: 'ventas',
        canActivate: [roleGuard],
        data: { permission: 'ventas-consultar', title: 'Ventas' },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/ventas/pages/venta-lista/venta-lista').then(
                m => m.VentaLista,
              ),
          },
          {
            path: 'nueva',
            canActivate: [roleGuard],
            data: { permission: 'ventas-registrar', title: 'Nueva venta' },
            loadComponent: () =>
              import('./features/ventas/pages/venta-form/venta-form').then(
                m => m.VentaForm,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/ventas/pages/venta-detalle/venta-detalle').then(
                m => m.VentaDetalle,
              ),
          },
        ],
      },

      // --- Inventario ---
      {
        path: 'inventario',
        canActivate: [roleGuard],
        data: { permission: 'inventario-stock', title: 'Inventario' },
        loadComponent: placeholder,
      },
      {
        path: 'inventario/movimientos',
        canActivate: [roleGuard],
        data: { permission: 'inventario-movimientos', title: 'Movimientos de inventario' },
        loadComponent: placeholder,
      },
      {
        path: 'inventario/alertas',
        canActivate: [roleGuard],
        data: { permission: 'inventario-ajustes', title: 'Ajustes de inventario' },
        loadComponent: placeholder,
      },

      // --- Reportes ---
      {
        path: 'reportes',
        canActivate: [roleGuard],
        data: { permission: 'reportes', title: 'Reportes' },
        loadComponent: placeholder,
      },

      // --- Logs de auditoría: solo ADMIN ---
      {
        path: 'actividad',
        canActivate: [roleGuard],
        data: { permission: 'logs-auditoria', title: 'Actividad del sistema' },
        loadComponent: placeholder,
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];