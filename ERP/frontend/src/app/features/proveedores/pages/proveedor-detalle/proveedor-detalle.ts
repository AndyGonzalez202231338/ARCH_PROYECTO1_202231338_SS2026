import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Toast } from '../../../../core/models/toast/toast';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialog } from '../../../../shared/confirm-dialog/confirm-dialog';
import { ProveedorService } from '../../services/proveedor.service';
import { CompraService } from '../../services/compra.service';
import { ProveedorResponse } from '../../models/proveedor.model';
import { CompraResumenResponse } from '../../models/compra.model';

@Component({
  selector: 'app-proveedor-detalle',
  imports: [CommonModule, RouterLink, Toast, ConfirmDialog],
  templateUrl: './proveedor-detalle.html',
  styleUrl: './proveedor-detalle.scss',
})
export class ProveedorDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly proveedorService = inject(ProveedorService);
  private readonly compraService = inject(CompraService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly puedeEditar = computed(() => this.auth.getRole() === 'COMPRAS');
  readonly puedeActivar = computed(() => this.auth.getRole() === 'ADMINISTRACION');

  readonly proveedor = signal<ProveedorResponse | null>(null);
  readonly loading = signal(true);

  readonly compras = signal<CompraResumenResponse[]>([]);
  readonly cargandoCompras = signal(true);

  readonly confirmandoEstado = signal(false);
  readonly procesandoAccion = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.proveedorService.obtener(id).subscribe({
      next: data => {
        this.proveedor.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notifications.error('No se pudo cargar el proveedor solicitado.');
        this.router.navigate(['/proveedores']);
      },
    });

    // Sección opcional: últimas compras del proveedor. Si el endpoint falla
    // o no aplica, simplemente se muestra "Sin compras registradas".
    this.compraService.listarPorProveedor(id).subscribe({
      next: data => {
        this.compras.set(data.slice(0, 5));
        this.cargandoCompras.set(false);
      },
      error: () => {
        this.compras.set([]);
        this.cargandoCompras.set(false);
      },
    });
  }

  volver(): void {
    this.router.navigate(['/proveedores']);
  }

  editar(): void {
    const p = this.proveedor();
    if (!p) return;
    this.router.navigate(['/proveedores', p.id, 'editar']);
  }

  abrirConfirmacionEstado(): void {
    this.confirmandoEstado.set(true);
  }

  cerrarConfirmacionEstado(): void {
    this.confirmandoEstado.set(false);
  }

  confirmarCambioEstado(): void {
    const proveedor = this.proveedor();
    if (!proveedor) return;

    const accion$ = proveedor.activo
      ? this.proveedorService.desactivar(proveedor.id)
      : this.proveedorService.activar(proveedor.id);

    this.procesandoAccion.set(true);
    accion$.subscribe({
      next: () => {
        this.procesandoAccion.set(false);
        this.confirmandoEstado.set(false);
        this.proveedor.update(p => (p ? { ...p, activo: !p.activo } : p));
        this.notifications.success(
          proveedor.activo ? 'Proveedor desactivado correctamente.' : 'Proveedor activado correctamente.',
        );
      },
      error: () => {
        this.procesandoAccion.set(false);
        this.notifications.error('No se pudo actualizar el estado del proveedor.');
      },
    });
  }

  tituloConfirmacion(): string {
    const p = this.proveedor();
    if (!p) return '';
    return p.activo ? '¿Desactivar proveedor?' : '¿Activar proveedor?';
  }

  mensajeConfirmacion(): string {
    const p = this.proveedor();
    if (!p) return '';
    return p.activo
      ? `${p.nombre} dejará de estar disponible para nuevas compras mientras esté desactivado.`
      : `${p.nombre} volverá a estar disponible para nuevas compras.`;
  }
}
