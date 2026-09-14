import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Toast } from '../../../../core/models/toast/toast';
import { NotificationService } from '../../../../core/services/notification.service';
import { PermissionsService } from '../../../../core/permissions/permissions.service';
import { ConfirmDialog } from '../../../../shared/confirm-dialog/confirm-dialog';
import { CategoriaService } from '../../services/categoria.service';
import { ProductoService } from '../../services/producto.service';
import { CategoriaResponse } from '../../models/categoria.model';
import { ProductoResponse } from '../../models/producto.model';

type EstadoFiltro = 'todos' | 'activos' | 'inactivos';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-producto-lista',
  imports: [CommonModule, Toast, ConfirmDialog],
  templateUrl: './producto-lista.html',
  styleUrl: './producto-lista.scss',
})
export class ProductoLista {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly notifications = inject(NotificationService);
  private readonly permissions = inject(PermissionsService);
  private readonly router = inject(Router);

  /** true para ADMINISTRACION/INVENTARIO (acceso FULL); false para COMPRAS/VENTAS (solo lectura). */
  readonly puedeEditar = computed(() => this.permissions.canWrite('productos'));

  readonly categorias = signal<CategoriaResponse[]>([]);

  // --- Estado ---
  readonly productos = signal<ProductoResponse[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);

  readonly searchDisplay = signal('');
  readonly searchText = signal('');
  readonly categoriaFilter = signal<number | null>(null);
  readonly estadoFilter = signal<EstadoFiltro>('todos');
  readonly soloBajoStock = signal(false);

  // --- Diálogo de activar/desactivar ---
  readonly productoParaCambiarEstado = signal<ProductoResponse | null>(null);
  readonly procesandoAccion = signal(false);

  private debounceHandle?: ReturnType<typeof setTimeout>;

  readonly hasFiltros = computed(() =>
    this.searchText() !== '' ||
    this.categoriaFilter() !== null ||
    this.estadoFilter() !== 'todos' ||
    this.soloBajoStock(),
  );

  /** Filtro de bajo stock aplicado en cliente; el resto ya viene filtrado del backend. */
  readonly productosFiltrados = computed(() => {
    const lista = this.productos();
    return this.soloBajoStock() ? lista.filter(p => p.bajoStock) : lista;
  });

  readonly totalProductos = computed(() => this.productosFiltrados().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalProductos() / PAGE_SIZE)),
  );

  readonly paginatedProductos = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.productosFiltrados().slice(start, start + PAGE_SIZE);
  });

  readonly rangoMostrado = computed(() => {
    if (this.totalProductos() === 0) return { desde: 0, hasta: 0 };
    const desde = (this.currentPage() - 1) * PAGE_SIZE + 1;
    const hasta = Math.min(this.currentPage() * PAGE_SIZE, this.totalProductos());
    return { desde, hasta };
  });

  readonly paginasVisibles = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1).slice(0, 3);
  });

  constructor() {
    this.categoriaService.listar().subscribe({
      next: data => this.categorias.set(data),
      error: () => this.notifications.error('No se pudieron cargar las categorías.'),
    });

    effect(() => {
      const texto = this.searchText();
      const categoriaId = this.categoriaFilter();
      const estado = this.estadoFilter();
      const activo = estado === 'activos' ? true : estado === 'inactivos' ? false : undefined;
      this.cargarProductos(texto, categoriaId, activo);
    });

    // Reinicia a la página 1 cuando cambia el filtro de bajo stock (aplicado en cliente).
    effect(() => {
      this.soloBajoStock();
      this.currentPage.set(1);
    });
  }

  private cargarProductos(texto: string, categoriaId: number | null, activo?: boolean): void {
    this.loading.set(true);
    this.productoService
      .listar({ texto: texto || undefined, categoriaId: categoriaId ?? undefined, activo })
      .subscribe({
        next: data => {
          this.productos.set(data);
          this.currentPage.set(1);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notifications.error('No se pudo cargar la lista de productos.');
        },
      });
  }

  onBuscarInput(valor: string): void {
    this.searchDisplay.set(valor);
    clearTimeout(this.debounceHandle);
    this.debounceHandle = setTimeout(() => this.searchText.set(valor), 300);
  }

  onCategoriaChange(valor: string): void {
    this.categoriaFilter.set(valor ? Number(valor) : null);
  }

  onEstadoChange(valor: string): void {
    this.estadoFilter.set(valor as EstadoFiltro);
  }

  toggleBajoStock(): void {
    this.soloBajoStock.update(v => !v);
  }

  limpiarFiltros(): void {
    this.searchDisplay.set('');
    clearTimeout(this.debounceHandle);
    this.searchText.set('');
    this.categoriaFilter.set(null);
    this.estadoFilter.set('todos');
    this.soloBajoStock.set(false);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages()) return;
    this.currentPage.set(pagina);
  }

  nuevoProducto(): void {
    this.router.navigate(['/productos', 'nuevo']);
  }

  verProducto(producto: ProductoResponse): void {
    this.router.navigate(['/productos', producto.id]);
  }

  editarProducto(producto: ProductoResponse): void {
    this.router.navigate(['/productos', producto.id, 'editar']);
  }

  abrirConfirmacionEstado(producto: ProductoResponse): void {
    this.productoParaCambiarEstado.set(producto);
  }

  cerrarConfirmacionEstado(): void {
    this.productoParaCambiarEstado.set(null);
  }

  confirmarCambioEstado(): void {
    const producto = this.productoParaCambiarEstado();
    if (!producto) return;

    const accion$ = producto.activo
      ? this.productoService.desactivar(producto.id)
      : this.productoService.activar(producto.id);

    this.procesandoAccion.set(true);
    accion$.subscribe({
      next: () => {
        this.procesandoAccion.set(false);
        this.productoParaCambiarEstado.set(null);
        this.productos.update(lista =>
          lista.map(p => (p.id === producto.id ? { ...p, activo: !producto.activo } : p)),
        );
        this.notifications.success(
          producto.activo ? 'Producto desactivado correctamente.' : 'Producto activado correctamente.',
        );
      },
      error: () => {
        this.procesandoAccion.set(false);
        this.notifications.error('No se pudo actualizar el estado del producto.');
      },
    });
  }

  tituloConfirmacion(): string {
    const producto = this.productoParaCambiarEstado();
    if (!producto) return '';
    return producto.activo ? '¿Desactivar producto?' : '¿Activar producto?';
  }

  mensajeConfirmacion(): string {
    const producto = this.productoParaCambiarEstado();
    if (!producto) return '';
    return producto.activo
      ? `${producto.nombre} dejará de estar disponible para la venta mientras esté desactivado.`
      : `${producto.nombre} volverá a estar disponible para la venta.`;
  }

  trackByProductoId(_index: number, producto: ProductoResponse): number {
    return producto.id;
  }
}
