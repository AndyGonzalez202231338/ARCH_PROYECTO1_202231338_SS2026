import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialog } from '../../../../shared/confirm-dialog/confirm-dialog';
import { Toast } from '../../../../core/models/toast/toast';

import { AuthService } from '../../../../core/services/auth.service';

import { NotificationService } from '../../../../core/services/notification.service';

import { VentaResumenResponse } from '../../../ventas/models/venta.model';
import { VentaService } from '../../../ventas/services/venta.service';
import { ClienteService } from '../../services/cliente.service';
import { ClienteResponse } from '../../models/cliente.model';
import { mensajeDeError } from '../../../ventas/services/api-error.util';

const MAX_VENTAS = 5;

@Component({
  selector: 'app-cliente-detalle',
  imports: [CommonModule, Toast, ConfirmDialog],
  templateUrl: './cliente-detalle.html',
  styleUrl: './cliente-detalle.scss',
})
export class ClienteDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);
  private readonly ventaService = inject(VentaService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  /** Wrapper sobre getRole(), igual que en el listado. */
  readonly role = () => this.auth.getRole();

  readonly puedeEditar = computed(() => this.role() === 'VENTAS');
  readonly puedeActivar = computed(() => this.role() === 'ADMINISTRACION');

  private readonly clienteId = Number(this.route.snapshot.paramMap.get('id'));

  readonly cliente = signal<ClienteResponse | null>(null);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);

  readonly ventas = signal<VentaResumenResponse[]>([]);
  readonly cargandoVentas = signal(true);

  readonly confirmarAbierto = signal(false);
  readonly procesandoAccion = signal(false);

  constructor() {
    const rol = this.role();
    if (rol !== 'VENTAS' && rol !== 'ADMINISTRACION') {
      this.notifications.error('No tienes permisos');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.cargarCliente();
    this.cargarVentas();
  }

  private cargarCliente(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.clienteService.obtener(this.clienteId).subscribe({
      next: data => {
        this.cliente.set(data);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);

        if (err.status === 403) {
          this.notifications.error('No tienes permisos');
          this.router.navigate(['/dashboard']);
          return;
        }

        const mensaje = mensajeDeError(err, 'No se pudo cargar el cliente solicitado.');
        this.errorCarga.set(mensaje);
        this.notifications.error(mensaje);
      },
    });
  }

  /** Últimas ventas del cliente. Si falla, la sección queda vacía sin ruido. */
  private cargarVentas(): void {
    this.cargandoVentas.set(true);
    this.ventaService.listar({ clienteId: this.clienteId }).subscribe({
      next: data => {
        const ordenadas = [...data].sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        );
        this.ventas.set(ordenadas.slice(0, MAX_VENTAS));
        this.cargandoVentas.set(false);
      },
      error: () => {
        this.ventas.set([]);
        this.cargandoVentas.set(false);
      },
    });
  }

  volver(): void {
    this.router.navigate(['/clientes']);
  }

  editar(): void {
    this.router.navigate(['/clientes', this.clienteId, 'editar']);
  }

  verVenta(venta: VentaResumenResponse): void {
    this.router.navigate(['/ventas', venta.id]);
  }

  abrirCambioEstado(): void {
    this.confirmarAbierto.set(true);
  }

  cerrarCambioEstado(): void {
    this.confirmarAbierto.set(false);
  }

  confirmarCambioEstado(): void {
    const cliente = this.cliente();
    if (!cliente) return;

    const desactivar = cliente.activo;
    this.procesandoAccion.set(true);

    const peticion = desactivar
      ? this.clienteService.desactivar(cliente.id)
      : this.clienteService.activar(cliente.id);

    peticion.subscribe({
      next: () => {
        this.procesandoAccion.set(false);
        this.confirmarAbierto.set(false);
        this.cliente.set({ ...cliente, activo: !desactivar });
        this.notifications.success(desactivar ? 'Cliente desactivado.' : 'Cliente activado.');
      },
      error: (err: HttpErrorResponse) => {
        this.procesandoAccion.set(false);
        if (err.status === 403) {
          this.notifications.error('No tienes permisos');
          return;
        }
        this.notifications.error(
          mensajeDeError(err, 'No se pudo actualizar el estado del cliente.'),
        );
      },
    });
  }

  tituloConfirmacion(): string {
    return this.cliente()?.activo ? '¿Desactivar este cliente?' : '¿Activar este cliente?';
  }

  mensajeConfirmacion(): string {
    const cliente = this.cliente();
    if (!cliente) return '';
    return cliente.activo
      ? `${cliente.nombre} dejará de aparecer en el registro de nuevas ventas.`
      : `${cliente.nombre} volverá a estar disponible para registrar ventas.`;
  }

  estadoBadgeClass(): string {
    return `badge-estado badge-estado--${this.cliente()?.activo ? 'activo' : 'inactivo'}`;
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
