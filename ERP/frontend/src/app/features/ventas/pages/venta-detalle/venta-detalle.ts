import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Toast } from '../../../../core/models/toast/toast';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClienteResponse } from '../../models/cliente.model';
import { VentaResponse } from '../../models/venta.model';
import { mensajeDeError } from '../../services/api-error.util';
import { ClienteService } from '../../services/cliente.service';
import { VentaService } from '../../services/venta.service';

@Component({
  selector: 'app-venta-detalle',
  imports: [CommonModule, Toast],
  templateUrl: './venta-detalle.html',
  styleUrl: './venta-detalle.scss',
})
export class VentaDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  private readonly ventaId = Number(this.route.snapshot.paramMap.get('id'));

  readonly role = this.auth.getRole;

  readonly puedeDescargarFactura = computed(
    () => this.role() === 'VENTAS' || this.role() === 'ADMINISTRACION',
  );

  /** Solo VENTAS y ADMINISTRACION pueden leer el detalle del cliente. */
  private readonly puedeVerCliente = computed(
    () => this.role() === 'VENTAS' || this.role() === 'ADMINISTRACION',
  );

  readonly venta = signal<VentaResponse | null>(null);
  readonly cliente = signal<ClienteResponse | null>(null);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);
  readonly descargando = signal(false);

  constructor() {
    if (this.role() === 'COMPRAS') {
      this.notifications.error('No tienes permisos');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.cargarVenta();
  }

  private cargarVenta(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.ventaService.obtener(this.ventaId).subscribe({
      next: data => {
        this.venta.set(data);
        this.cargando.set(false);
        if (this.puedeVerCliente()) this.cargarCliente(data.clienteId);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);

        if (err.status === 403) {
          this.notifications.error('No tienes permisos');
          this.router.navigate(['/dashboard']);
          return;
        }

        const mensaje = mensajeDeError(err, 'No se pudo cargar la venta solicitada.');
        this.errorCarga.set(mensaje);
        this.notifications.error(mensaje);
      },
    });
  }

  /** Los datos completos del cliente no vienen en VentaResponse. */
  private cargarCliente(clienteId: number): void {
    this.clienteService.obtener(clienteId).subscribe({
      next: data => this.cliente.set(data),
      error: () => this.cliente.set(null),
    });
  }

  volver(): void {
    this.router.navigate(['/ventas']);
  }

  descargarFactura(): void {
    if (!this.puedeDescargarFactura() || this.descargando()) return;

    this.descargando.set(true);
    this.ventaService.descargarFactura(this.ventaId).subscribe({
      next: blob => {
        this.descargando.set(false);
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `factura_${this.ventaId}.pdf`;
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: (err: HttpErrorResponse) => {
        this.descargando.set(false);
        if (err.status === 403) {
          this.notifications.error('No tienes permisos');
          return;
        }
        this.notifications.error(mensajeDeError(err, 'No se pudo descargar la factura.'));
      },
    });
  }

  estadoBadgeClass(): string {
    const estado = this.venta()?.estado ?? 'PENDIENTE';
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
