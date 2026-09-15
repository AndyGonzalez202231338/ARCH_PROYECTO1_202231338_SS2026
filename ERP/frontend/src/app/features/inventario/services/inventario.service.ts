import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ProductoResponse } from '../../productos/models/producto.model';
import { CategoriaService } from '../../productos/services/categoria.service';
import { ProductoService } from '../../productos/services/producto.service';
import {
  CategoriaResumen,
  InventarioFiltros,
  MovimientoFiltros,
  MovimientoInventarioResponse,
  ProductoResumen,
  StockProductoRaw,
  StockProductoResponse,
} from '../models/inventario.model';

const BASE = `${API_BASE_URL}/api/admin/inventario`;

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);

  /** Stock actual, enriquecido con precioVenta + categoriaId desde /productos. */
  listarStock(filtros: InventarioFiltros = {}): Observable<StockProductoResponse[]> {
    const params = this.buildStockParams(filtros);
    return forkJoin({
      stock: this.http.get<StockProductoRaw[]>(`${BASE}/stock`, { params }),
      productos: this.productoService.listar(),
    }).pipe(map(({ stock, productos }) => this.enriquecer(stock, productos)));
  }

  /** Bajo stock, enriquecido igual. */
  listarBajoStock(umbral?: number): Observable<StockProductoResponse[]> {
    let params = new HttpParams();
    if (umbral != null) params = params.set('umbral', umbral);
    return forkJoin({
      stock: this.http.get<StockProductoRaw[]>(`${BASE}/bajo-stock`, { params }),
      productos: this.productoService.listar(),
    }).pipe(map(({ stock, productos }) => this.enriquecer(stock, productos)));
  }

  obtenerMovimientos(
    productoId: number,
    filtros: MovimientoFiltros = {},
  ): Observable<MovimientoInventarioResponse[]> {
    let params = new HttpParams();
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    return this.http.get<MovimientoInventarioResponse[]>(
      `${BASE}/movimientos/${productoId}`,
      { params },
    );
  }

  obtenerProductoResumen(productoId: number): Observable<ProductoResumen> {
    return this.productoService.obtener(productoId).pipe(
      map(p => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        categoriaNombre: p.categoriaNombre,
        stockActual: p.stockActual,
        stockMinimo: p.stockMinimo,
      })),
    );
  }

  listarCategorias(): Observable<CategoriaResumen[]> {
    return this.categoriaService.listar().pipe(
      map(cs => cs.map(c => ({ id: c.id, nombre: c.nombre }))),
    );
  }

  // ---------- helpers ----------

  private buildStockParams(filtros: InventarioFiltros): HttpParams {
    let params = new HttpParams();
    if (filtros.texto) params = params.set('texto', filtros.texto);
    if (filtros.categoriaId != null) params = params.set('categoriaId', filtros.categoriaId);
    if (filtros.soloBajoStock != null) params = params.set('soloBajoStock', filtros.soloBajoStock);
    return params;
  }

  private enriquecer(
    stock: StockProductoRaw[],
    productos: ProductoResponse[],
  ): StockProductoResponse[] {
    if (stock.length === 0) return [];

    const byId = new Map<number, ProductoResponse>(productos.map(p => [p.id, p]));

    return stock.map(s => {
      const p = byId.get(s.productoId);
      const precioVenta = p?.precioVenta ?? 0;
      const stockMinimo = s.stockMinimo ?? p?.stockMinimo ?? 0;
      return {
        productoId: s.productoId,
        codigo: s.codigo,
        nombre: s.nombre,
        categoria: s.categoria ?? p?.categoriaNombre ?? '—',
        categoriaId: p?.categoriaId ?? 0,
        stockActual: s.stockActual,
        stockMinimo,
        bajoStock: s.bajoStock ?? s.stockActual <= stockMinimo,
        precioVenta,
        valorInventario: +(s.stockActual * precioVenta).toFixed(2),
      };
    });
  }
}