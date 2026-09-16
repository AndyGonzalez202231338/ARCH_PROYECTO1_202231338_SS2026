import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmDialog } from '../../../../shared/confirm-dialog/confirm-dialog';
import { CompraResumenResponse, EstadoCompra } from '../../models/compra.model';
import { Toast } from '../../../../core/models/toast/toast';
import { CompraService } from '../../services/compra.service';
import { ProveedorService } from '../../services/proveedor.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProveedorResponse } from '../../models/proveedor.model';


type EstadoFiltro = 'todos' | EstadoCompra;

type AccionEstado = 'COMPLETADA' | 'ANULADA';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-compra-lista',
  imports: [CommonModule, Toast, ConfirmDialog],
  templateUrl: './compra-lista.html',
  styleUrl: './compra-lista.scss',
})
export class CompraLista {
  private readonly compraService = inject(CompraService);
  private readonly proveedorService = inject(ProveedorService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  // Solo ADMINISTRACION (lectura) y COMPRAS (full) llegan a este componente;
  // INVENTARIO/VENTAS son redirigidos por roleGuard antes de cargar la ruta.
  readonly role = computed(() => this.auth.currentUser()?.rol ?? null);
  readonly puedeGestionar = computed(() => this.role() === 'COMPRAS');

  readonly subtitulo = computed(() =>
    this.puedeGestionar() ? 'Administra las compras a proveedores' : 'Consulta las compras a proveedores',
  );

  readonly proveedores = signal<ProveedorResponse[]>([]);

  readonly compras = signal<CompraResumenResponse[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);

  readonly desde = signal('');
  readonly hasta = signal('');
  readonly proveedorFilter = signal<number | null>(null);
  readonly estadoFilter = signal<EstadoFiltro>('todos');

  readonly compraParaEstado = signal<CompraResumenResponse | null>(null);
  readonly accionEstado = signal<AccionEstado | null>(null);
  readonly procesandoAccion = signal(false);

  readonly hasFiltros = computed(() =>
    this.desde() !== '' || this.hasta() !== ''
    || this.proveedorFilter() !== null || this.estadoFilter() !== 'todos',
  );

  // "estado" no es un query param del backend: se filtra en cliente.
  readonly comprasFiltradas = computed(() => {
    const estado = this.estadoFilter();
    return estado === 'todos' ? this.compras() : this.compras().filter(c => c.estado === estado);
  });

  readonly totalCompras = computed(() => this.comprasFiltradas().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCompras() / PAGE_SIZE)));

  readonly paginatedCompras = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.comprasFiltradas().slice(start, start + PAGE_SIZE);
  });

  readonly rangoMostrado = computed(() => {
    if (this.totalCompras() === 0) return { desde: 0, hasta: 0 };
    const desde = (this.currentPage() - 1) * PAGE_SIZE + 1;
    const hasta = Math.min(this.currentPage() * PAGE_SIZE, this.totalCompras());
    return { desde, hasta };
  });

  readonly paginasVisibles = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1).slice(0, 3);
  });

  constructor() {
    this.proveedorService.listar(true).subscribe({
      next: data => this.proveedores.set(data),
      error: () => this.notifications.error('No se pudieron cargar los proveedores.'),
    });

    effect(() => {
      const desde = this.desde();
      const hasta = this.hasta();
      const proveedorId = this.proveedorFilter();
      this.cargarCompras(desde, hasta, proveedorId);
    });
  }

  private cargarCompras(desde: string, hasta: string, proveedorId: number | null): void {
    this.loading.set(true);
    this.compraService
      .listar({
        desde: desde ? `${desde}T00:00:00` : undefined,
        hasta: hasta ? `${hasta}T23:59:59` : undefined,
        proveedorId: proveedorId ?? undefined,
      })
      .subscribe({
        next: data => {
          this.compras.set(data);
          this.currentPage.set(1);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notifications.error('No se pudo cargar la lista de compras.');
        },
      });
  }

  onDesdeChange(valor: string): void {
    this.desde.set(valor);
  }

  onHastaChange(valor: string): void {
    this.hasta.set(valor);
  }

  onProveedorChange(valor: string): void {
    this.proveedorFilter.set(valor ? Number(valor) : null);
  }

  onEstadoChange(valor: string): void {
    this.estadoFilter.set(valor as EstadoFiltro);
    this.currentPage.set(1);
  }

  limpiarFiltros(): void {
    this.desde.set('');
    this.hasta.set('');
    this.proveedorFilter.set(null);
    this.estadoFilter.set('todos');
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages()) return;
    this.currentPage.set(pagina);
  }

  nuevaCompra(): void {
    this.router.navigate(['/compras', 'nueva']);
  }

  verDetalle(compra: CompraResumenResponse): void {
    this.router.navigate(['/compras', compra.id]);
  }

  puedeCambiarEstado(compra: CompraResumenResponse): boolean {
    return this.puedeGestionar() && compra.estado === 'PENDIENTE';
  }

  abrirRecibir(compra: CompraResumenResponse): void {
    this.compraParaEstado.set(compra);
    this.accionEstado.set('COMPLETADA');
  }

abrirCancelar(compra: CompraResumenResponse): void {
  this.compraParaEstado.set(compra);
  this.accionEstado.set('ANULADA');
}


  cerrarConfirmacionEstado(): void {
    this.compraParaEstado.set(null);
    this.accionEstado.set(null);
  }

  confirmarCambioEstado(): void {
    const compra = this.compraParaEstado();
    const accion = this.accionEstado();
    if (!compra || !accion) return;

    this.procesandoAccion.set(true);
    this.compraService.cambiarEstado(compra.id, accion).subscribe({
      next: actualizada => {
        this.procesandoAccion.set(false);
        this.compraParaEstado.set(null);
        this.accionEstado.set(null);
        this.compras.update(lista =>
          lista.map(c => (c.id === compra.id ? { ...c, estado: actualizada.estado } : c)),
        );
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
    return this.accionEstado() === 'COMPLETADA'
      ? '¿Marcar esta compra como COMPLETADA?'
      : '¿Anular esta compra?';
  }

  mensajeConfirmacion(): string {
    const compra = this.compraParaEstado();
    if (!compra) return '';
    return this.accionEstado() === 'COMPLETADA'
      ? `Se cargarán los productos de ${compra.numeroCompra} al inventario.`
      : `${compra.numeroCompra} quedará anulada y no podrá modificarse.`;
  }

  estadoBadgeClass(estado: EstadoCompra): string {
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
