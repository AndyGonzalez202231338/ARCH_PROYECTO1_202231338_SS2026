import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import {
  CategoriaResumen,
  StockProductoResponse,
} from '../../models/inventario.model';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-inventario-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inventario-stock.component.html',
  styleUrls: ['./inventario-stock.component.scss'],
})
export class InventarioStockComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly service = inject(InventarioService);

  // ---- Permisos por rol
  readonly role = () => this.auth.getRole();
  readonly puedeVerMovimientos = computed(() => this.role() === 'ADMINISTRACION' || this.role() === 'INVENTARIO');


  // ---- Estado
  readonly items = signal<StockProductoResponse[]>([]);
  readonly categorias = signal<CategoriaResumen[]>([]);
  readonly loading = signal(true);

  // ---- Filtros
  readonly search = signal('');
  readonly categoriaId = signal<number | null>(null);
  readonly soloBajoStock = signal(false);

  // ---- Paginación
  readonly page = signal(1);
  readonly pageSize = 15;

  // ---- Derivados
  readonly filtrados = computed(() => {
    const t = this.search().toLowerCase().trim();
    const cid = this.categoriaId();
    const onlyLow = this.soloBajoStock();
    return this.items().filter(p => {
      if (t && !`${p.codigo} ${p.nombre}`.toLowerCase().includes(t)) return false;
      if (cid != null && p.categoriaId !== cid) return false;
      if (onlyLow && !p.bajoStock) return false;
      return true;
    });
  });

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.filtrados().length / this.pageSize)),
  );

  readonly paginados = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtrados().slice(start, start + this.pageSize);
  });

  readonly hayFiltros = computed(() =>
    !!this.search() || this.categoriaId() != null || this.soloBajoStock(),
  );

  // ---- KPIs
  readonly totalProductos = computed(() => this.items().length);
  readonly totalBajoStock = computed(() => this.items().filter(p => p.bajoStock).length);
  readonly totalSinStock = computed(() => this.items().filter(p => p.stockActual === 0).length);
  readonly valorTotal = computed(() =>
    this.items().reduce((acc, p) => acc + p.valorInventario, 0),
  );

  ngOnInit(): void {
    this.service.listarCategorias().subscribe(c => this.categorias.set(c));
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.service.listarStock().subscribe({
      next: data => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFiltroChange(): void {
    this.page.set(1);
  }

  limpiarFiltros(): void {
    this.search.set('');
    this.categoriaId.set(null);
    this.soloBajoStock.set(false);
    this.page.set(1);
  }

  irPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas()) return;
    this.page.set(p);
  }

  exportarCsv(): void {
    const rows = this.filtrados();
    const header = ['Código', 'Producto', 'Categoría', 'Stock', 'Mínimo', 'Precio venta', 'Valor inventario'];
    const csv = [
      header.join(','),
      ...rows.map(p => [
        p.codigo, `"${p.nombre}"`, p.categoria,
        p.stockActual, p.stockMinimo,
        p.precioVenta.toFixed(2), p.valorInventario.toFixed(2),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario-stock-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- Helpers de badge
  badgeStockClass(p: StockProductoResponse): string {
    if (p.stockActual === 0) return 'badge badge--danger';
    if (p.bajoStock) return 'badge badge--warning';
    return 'badge badge--success';
  }
  badgeStockTexto(p: StockProductoResponse): string {
    if (p.stockActual === 0) return 'SIN STOCK';
    if (p.bajoStock) return 'BAJO';
    return 'OK';
  }
  rowClass(p: StockProductoResponse): string {
    if (p.stockActual === 0) return 'row--danger';
    if (p.bajoStock) return 'row--warning';
    return '';
  }

  trackById = (_: number, p: StockProductoResponse) => p.productoId;
}