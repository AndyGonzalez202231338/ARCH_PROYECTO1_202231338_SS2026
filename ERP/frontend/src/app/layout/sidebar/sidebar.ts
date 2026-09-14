import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Icon, IconName } from '../../shared/icon/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MenuItem {
  label: string;
  icon: IconName;
  path: string;
}

const MENU_BY_ROLE: Record<string, MenuItem[]> = {
  ADMINISTRACION: [
    { label: 'Dashboard', icon: 'home', path: '/dashboard' },
    { label: 'Productos', icon: 'cube', path: '/productos' },
    { label: 'Proveedores', icon: 'truck', path: '/proveedores' },
    { label: 'Compras', icon: 'shopping-cart', path: '/compras' },
    { label: 'Inventario', icon: 'archive-box', path: '/inventario' },
    { label: 'Clientes', icon: 'users', path: '/clientes' },
    { label: 'Ventas', icon: 'chart-bar', path: '/ventas' },
    { label: 'Reportes', icon: 'document-chart-bar', path: '/reportes' },
    { label: 'Usuarios', icon: 'user-circle', path: '/usuarios' },
    { label: 'Actividad', icon: 'list-bullet', path: '/actividad' },
  ],
  COMPRAS: [
    { label: 'Dashboard', icon: 'home', path: '/dashboard' },
    { label: 'Productos', icon: 'cube', path: '/productos' },
    { label: 'Proveedores', icon: 'truck', path: '/proveedores' },
    { label: 'Compras', icon: 'shopping-cart', path: '/compras' },
    { label: 'Inventario', icon: 'archive-box', path: '/inventario' },
    { label: 'Reportes', icon: 'document-chart-bar', path: '/reportes' },
    //{ label: 'Historial de compras', icon: 'clipboard-document-list', path: '/compras/historial' },
  ],
  INVENTARIO: [
    { label: 'Dashboard', icon: 'home', path: '/dashboard' },
    { label: 'Productos', icon: 'cube', path: '/productos' },
    { label: 'Inventario', icon: 'archive-box', path: '/inventario' },
    { label: 'Movimientos', icon: 'arrow-path', path: '/inventario/movimientos' },
    { label: 'Alertas de existencias', icon: 'exclamation-triangle', path: '/inventario/alertas' },
  ],
  VENTAS: [
    { label: 'Dashboard', icon: 'home', path: '/dashboard' },
    { label: 'Clientes', icon: 'users', path: '/clientes' },
    { label: 'Productos', icon: 'cube', path: '/productos' },
    { label: 'Ventas', icon: 'chart-bar', path: '/ventas' },
    { label: 'Nueva venta', icon: 'shopping-cart', path: '/ventas/nueva' },
    { label: 'Historial de ventas', icon: 'clipboard-document-list', path: '/ventas/historial' },
  ],
};

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input() role = 'ADMINISTRACION';
  @Input() open = false;
  @Output() closeMenu = new EventEmitter<void>();

  get menu(): MenuItem[] {
    return MENU_BY_ROLE[this.role] ?? [];
  }

  get roleLabel(): string {
    if (!this.role) return '';
    return this.role.charAt(0) + this.role.slice(1).toLowerCase();
  }

  close(): void {
    this.closeMenu.emit();
  }
}
