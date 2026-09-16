import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ConfirmDialog } from '../../../../shared/confirm-dialog/confirm-dialog';
import { AuthService } from '../../../../core/services/auth.service';
import { CompraService } from '../../services/compra.service';
import { CompraResponse } from '../../models/compra.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { Toast } from '../../../../core/models/toast/toast';


type AccionEstado = 'COMPLETADA' | 'ANULADA';

@Component({
  selector: 'app-compra-detalle',
  imports: [CommonModule, Toast, ConfirmDialog],
  templateUrl: './compra-detalle.html',
  styleUrl: './compra-detalle.scss',
})
export class CompraDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly compraService = inject(CompraService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  private readonly compraId = Number(this.route.snapshot.paramMap.get('id'));

  readonly compra = signal<CompraResponse | null>(null);
  readonly cargando = signal(true);
  readonly procesandoAccion = signal(false);
  readonly accionEstado = signal<AccionEstado | null>(null);
  readonly confirmarAbierto = signal(false);

  // Solo ADMINISTRACION (lectura) y COMPRAS (full) llegan aquí; roleGuard
  // bloquea a INVENTARIO/VENTAS antes de cargar la ruta.
  readonly role = computed(() => this.auth.currentUser()?.rol ?? null);
  readonly puedeGestionar = computed(() => this.role() === 'COMPRAS');



  readonly puedeRecibir = computed(() => {
    const estado = this.compra()?.estado;
    return this.puedeGestionar() && estado === 'PENDIENTE';
  });

  readonly puedeCancelar = computed(() => this.puedeRecibir());

  constructor() {
    this.cargarCompra();
  }

  private cargarCompra(): void {
    this.cargando.set(true);
    this.compraService.obtener(this.compraId).subscribe({
      next: data => {
        this.compra.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.notifications.error('No se pudo cargar la compra solicitada.');
        this.router.navigate(['/compras']);
      },
    });
  }

  volver(): void {
    this.router.navigate(['/compras']);
  }

  abrirRecibir(): void {
    this.accionEstado.set('COMPLETADA');
    this.confirmarAbierto.set(true);
  }

  abrirCancelar(): void {
    this.accionEstado.set('ANULADA');
    this.confirmarAbierto.set(true);
  }

  cerrarConfirmacion(): void {
    this.confirmarAbierto.set(false);
    this.accionEstado.set(null);
  }

  confirmarCambioEstado(): void {
    const accion = this.accionEstado();
    if (!accion) return;

    this.procesandoAccion.set(true);
    this.compraService.cambiarEstado(this.compraId, accion).subscribe({
      next: actualizada => {
        this.procesandoAccion.set(false);
        this.confirmarAbierto.set(false);
        this.accionEstado.set(null);
        this.compra.set(actualizada);
        this.notifications.success(
          accion === 'COMPLETADA'
            ? 'Compra completada correctamente. Inventario actualizado.'
            : 'Compra anulada.',
        );
      },
      error: () => {
        this.procesandoAccion.set(false);
        this.notifications.error('No se pudo actualizar el estado de la compra.');
      },
    });
  }

  tituloConfirmacion(): string {
    return this.accionEstado() === 'COMPLETADA' ? '¿Marcar esta compra como COMPLETADA?' : '¿Anular esta compra?';
  }

  mensajeConfirmacion(): string {
    return this.accionEstado() === 'COMPLETADA'
      ? 'Se cargarán los productos de esta compra al inventario.'
      : 'La compra quedará marcada como anulada y no podrá modificarse.';
  }

  estadoBadgeClass(): string {
    const estado = this.compra()?.estado ?? 'PENDIENTE';
    return `badge-estado badge-estado--${estado.toLowerCase()}`;
  }

  formatoFecha(fecha: string): string {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  formatoQuetzales(valor: number): string {
    return `Q ${valor.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
