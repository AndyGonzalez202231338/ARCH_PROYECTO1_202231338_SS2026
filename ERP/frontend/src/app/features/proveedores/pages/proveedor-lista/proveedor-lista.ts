import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Toast } from '../../../../core/models/toast/toast';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialog } from '../../../../shared/confirm-dialog/confirm-dialog';
import { ProveedorService } from '../../services/proveedor.service';
import { ProveedorResponse } from '../../models/proveedor.model';

type EstadoFiltro = 'todos' | 'activos' | 'inactivos';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-proveedor-lista',
  imports: [CommonModule, Toast, ConfirmDialog],
  templateUrl: './proveedor-lista.html',
  styleUrl: './proveedor-lista.scss',
})
export class ProveedorLista {
  private readonly proveedorService = inject(ProveedorService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** COMPRAS crea/edita; ADMINISTRACION solo consulta y activa/desactiva. */
  readonly puedeEditar = computed(() => this.auth.getRole() === 'COMPRAS');
  readonly puedeActivar = computed(() => this.auth.getRole() === 'ADMINISTRACION');

  // --- Estado ---
  readonly proveedores = signal<ProveedorResponse[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);

  readonly searchDisplay = signal('');
  readonly searchText = signal('');
  readonly estadoFilter = signal<EstadoFiltro>('todos');

  // --- Diálogo de activar/desactivar ---
  readonly proveedorParaCambiarEstado = signal<ProveedorResponse | null>(null);
  readonly procesandoAccion = signal(false);

  private debounceHandle?: ReturnType<typeof setTimeout>;

  readonly hasFiltros = computed(() =>
    this.searchText() !== '' || this.estadoFilter() !== 'todos',
  );

  readonly totalProveedores = computed(() => this.proveedores().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalProveedores() / PAGE_SIZE)),
  );

  readonly paginatedProveedores = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.proveedores().slice(start, start + PAGE_SIZE);
  });

  readonly rangoMostrado = computed(() => {
    if (this.totalProveedores() === 0) return { desde: 0, hasta: 0 };
    const desde = (this.currentPage() - 1) * PAGE_SIZE + 1;
    const hasta = Math.min(this.currentPage() * PAGE_SIZE, this.totalProveedores());
    return { desde, hasta };
  });

  readonly paginasVisibles = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1).slice(0, 3);
  });

  constructor() {
    effect(() => {
      const texto = this.searchText();
      const estado = this.estadoFilter();
      const activo = estado === 'activos' ? true : estado === 'inactivos' ? false : undefined;
      this.cargarProveedores(texto, activo);
    });
  }

  private cargarProveedores(texto: string, activo?: boolean): void {
    this.loading.set(true);
    this.proveedorService.listar({ texto: texto || undefined, activo }).subscribe({
      next: data => {
        this.proveedores.set(data);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notifications.error('No se pudo cargar la lista de proveedores.');
      },
    });
  }

  onBuscarInput(valor: string): void {
    this.searchDisplay.set(valor);
    clearTimeout(this.debounceHandle);
    this.debounceHandle = setTimeout(() => this.searchText.set(valor), 300);
  }

  onEstadoChange(valor: string): void {
    this.estadoFilter.set(valor as EstadoFiltro);
  }

  limpiarFiltros(): void {
    this.searchDisplay.set('');
    clearTimeout(this.debounceHandle);
    this.searchText.set('');
    this.estadoFilter.set('todos');
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages()) return;
    this.currentPage.set(pagina);
  }

  nuevoProveedor(): void {
    this.router.navigate(['/proveedores', 'nuevo']);
  }

  verProveedor(proveedor: ProveedorResponse): void {
    this.router.navigate(['/proveedores', proveedor.id]);
  }

  editarProveedor(proveedor: ProveedorResponse): void {
    this.router.navigate(['/proveedores', proveedor.id, 'editar']);
  }

  abrirConfirmacionEstado(proveedor: ProveedorResponse): void {
    this.proveedorParaCambiarEstado.set(proveedor);
  }

  cerrarConfirmacionEstado(): void {
    this.proveedorParaCambiarEstado.set(null);
  }

  confirmarCambioEstado(): void {
    const proveedor = this.proveedorParaCambiarEstado();
    if (!proveedor) return;

    const accion$ = proveedor.activo
      ? this.proveedorService.desactivar(proveedor.id)
      : this.proveedorService.activar(proveedor.id);

    this.procesandoAccion.set(true);
    accion$.subscribe({
      next: () => {
        this.procesandoAccion.set(false);
        this.proveedorParaCambiarEstado.set(null);
        this.proveedores.update(lista =>
          lista.map(p => (p.id === proveedor.id ? { ...p, activo: !proveedor.activo } : p)),
        );
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
    const proveedor = this.proveedorParaCambiarEstado();
    if (!proveedor) return '';
    return proveedor.activo ? '¿Desactivar proveedor?' : '¿Activar proveedor?';
  }

  mensajeConfirmacion(): string {
    const proveedor = this.proveedorParaCambiarEstado();
    if (!proveedor) return '';
    return proveedor.activo
      ? `${proveedor.nombre} dejará de estar disponible para nuevas compras mientras esté desactivado.`
      : `${proveedor.nombre} volverá a estar disponible para nuevas compras.`;
  }

  trackByProveedorId(_index: number, proveedor: ProveedorResponse): number {
    return proveedor.id;
  }
}
