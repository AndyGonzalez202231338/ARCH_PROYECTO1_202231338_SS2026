import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Toast } from '../../../../core/models/toast/toast';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClienteResponse } from '../../models/cliente.model';
import { EstadoVenta, VentaResumenResponse } from '../../models/venta.model';
import { mensajeDeError } from '../../services/api-error.util';
import { ClienteService } from '../../services/cliente.service';
import { VentaService } from '../../services/venta.service';

type EstadoFiltro = 'todos' | EstadoVenta;

const PAGE_SIZE = 10;

@Component({
  selector: 'app-venta-lista',
  imports: [CommonModule, Toast],
  templateUrl: './venta-lista.html',
  styleUrl: './venta-lista.scss',
})
export class VentaLista {
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly role = () => this.auth.getRole();

  /** Solo VENTAS puede registrar. */
  readonly puedeCrear = computed(() => this.role() === 'VENTAS');

  /** VENTAS y ADMINISTRACION pueden descargar la factura. */
  readonly puedeDescargarFactura = computed(
    () => this.role() === 'VENTAS' || this.role() === 'ADMINISTRACION',
  );

  /** Solo VENTAS y ADMINISTRACION pueden consultar el catálogo de clientes. */
  private readonly puedeListarClientes = computed(
    () => this.role() === 'VENTAS' || this.role() === 'ADMINISTRACION',
  );

  readonly subtitulo = computed(() =>
    this.puedeCrear() ? 'Administra las ventas a clientes' : 'Consulta las ventas a clientes',
  );

  readonly clientes = signal<ClienteResponse[]>([]);
  readonly ventas = signal<VentaResumenResponse[]>([]);
  readonly loading = signal(true);
  readonly errorCarga = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly descargandoId = signal<number | null>(null);

  readonly desde = signal('');
  readonly hasta = signal('');
  readonly clienteFilter = signal<number | null>(null);
  readonly estadoFilter = signal<EstadoFiltro>('todos');

  readonly hasFiltros = computed(
    () =>
      this.desde() !== '' ||
      this.hasta() !== '' ||
      this.clienteFilter() !== null ||
      this.estadoFilter() !== 'todos',
  );

  /** "estado" no es query param del backend: se filtra en cliente. */
  readonly ventasFiltradas = computed(() => {
    const estado = this.estadoFilter();
    return estado === 'todos' ? this.ventas() : this.ventas().filter(v => v.estado === estado);
  });

  readonly totalVentas = computed(() => this.ventasFiltradas().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalVentas() / PAGE_SIZE)));

  readonly paginatedVentas = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.ventasFiltradas().slice(start, start + PAGE_SIZE);
  });

  readonly rangoMostrado = computed(() => {
    if (this.totalVentas() === 0) return { desde: 0, hasta: 0 };
    const desde = (this.currentPage() - 1) * PAGE_SIZE + 1;
    const hasta = Math.min(this.currentPage() * PAGE_SIZE, this.totalVentas());
    return { desde, hasta };
  });

  readonly paginasVisibles = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1).slice(0, 3),
  );

  constructor() {
    // COMPRAS no tiene acceso al módulo de ventas. El roleGuard ya lo
    // bloquea, esto es la defensa en profundidad por si alguien entra
    // por URL directa con la matriz de permisos modificada.
    if (this.role() === 'COMPRAS') {
      this.notifications.error('No tienes permisos');
      this.router.navigate(['/dashboard']);
      return;
    }

    if (this.puedeListarClientes()) {
      this.clienteService.listar({ activo: true }).subscribe({
        next: data => this.clientes.set(data),
        error: () => this.notifications.error('No se pudieron cargar los clientes.'),
      });
    }

    effect(() => {
      const desde = this.desde();
      const hasta = this.hasta();
      const clienteId = this.clienteFilter();
      this.cargarVentas(desde, hasta, clienteId);
    });
  }

  private cargarVentas(desde: string, hasta: string, clienteId: number | null): void {
    this.loading.set(true);
    this.errorCarga.set(null);

    this.ventaService
      .listar({
        desde: desde ? `${desde}T00:00:00` : undefined,
        hasta: hasta ? `${hasta}T23:59:59` : undefined,
        clienteId: clienteId ?? undefined,
      })
      .subscribe({
        next: data => {
          this.ventas.set(data);
          this.currentPage.set(1);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.ventas.set([]);

          if (err.status === 403) {
            this.notifications.error('No tienes permisos');
            this.router.navigate(['/dashboard']);
            return;
          }

          const mensaje = mensajeDeError(err, 'No se pudo cargar la lista de ventas.');
          this.errorCarga.set(mensaje);
          this.notifications.error(mensaje);
        },
      });
  }

  onDesdeChange(valor: string): void {
    this.desde.set(valor);
  }

  onHastaChange(valor: string): void {
    this.hasta.set(valor);
  }

  onClienteChange(valor: string): void {
    this.clienteFilter.set(valor ? Number(valor) : null);
  }

  onEstadoChange(valor: string): void {
    this.estadoFilter.set(valor as EstadoFiltro);
    this.currentPage.set(1);
  }

  limpiarFiltros(): void {
    this.desde.set('');
    this.hasta.set('');
    this.clienteFilter.set(null);
    this.estadoFilter.set('todos');
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages()) return;
    this.currentPage.set(pagina);
  }

  nuevaVenta(): void {
    this.router.navigate(['/ventas', 'nueva']);
  }

  verDetalle(venta: VentaResumenResponse): void {
    this.router.navigate(['/ventas', venta.id]);
  }

  descargarFactura(venta: VentaResumenResponse): void {
    if (!this.puedeDescargarFactura() || this.descargandoId() !== null) return;

    this.descargandoId.set(venta.id);
    this.ventaService.descargarFactura(venta.id).subscribe({
      next: blob => {
        this.descargandoId.set(null);
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `factura_${venta.id}.pdf`;
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: (err: HttpErrorResponse) => {
        this.descargandoId.set(null);
        if (err.status === 403) {
          this.notifications.error('No tienes permisos');
          return;
        }
        this.notifications.error(mensajeDeError(err, 'No se pudo descargar la factura.'));
      },
    });
  }

  estadoBadgeClass(estado: EstadoVenta): string {
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
