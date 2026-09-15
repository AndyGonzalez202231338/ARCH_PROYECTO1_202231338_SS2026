import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import {
  CompraResumenResponse,
  LogAuditoriaResponse, 
  ProductoBajoStockResponse,
  ReporteFiltros,
  ResumenVentasPeriodoResponse,
  TopClienteResponse,
  TopProductoResponse,
  TopProveedorResponse,
  VentaResumenResponse,
} from '../models/reporte.model';
import { MovimientoInventarioResponse } from '../../inventario/models/inventario.model';

const BASE = `${API_BASE_URL}/api/admin/reportes`;
const COMPRAS = `${API_BASE_URL}/api/admin/compras`;
const VENTAS = `${API_BASE_URL}/api/admin/ventas`;
const INVENTARIO = `${API_BASE_URL}/api/admin/inventario`;
const AUDITORIA = `${API_BASE_URL}/api/admin/auditoria`;

/**
 * Consume ReporteController + endpoints auxiliares de Compras, Ventas,
 * Inventario y Auditoría. El interceptor JWT agrega Authorization.
 */
@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);

  /* ---------------- Productos / Inventario ---------------- */

  productosMasVendidos(f: ReporteFiltros = {}): Observable<TopProductoResponse[]> {
    return this.http.get<TopProductoResponse[]>(`${BASE}/productos-mas-vendidos`, {
      params: this.params({
        top: f.top, desde: f.desde, hasta: f.hasta,
      }),
    });
  }

  productosMenorExistencia(top = 10): Observable<ProductoBajoStockResponse[]> {
    return this.http.get<ProductoBajoStockResponse[]>(`${BASE}/productos-menor-existencia`, {
      params: this.params({ top }),
    });
  }

  productosMasMovimientos(f: ReporteFiltros = {}): Observable<TopProductoResponse[]> {
    return this.http.get<TopProductoResponse[]>(`${BASE}/productos-mas-movimientos`, {
      params: this.params({ top: f.top, desde: f.desde, hasta: f.hasta }),
    });
  }

  historialMovimientos(productoId: number, f: ReporteFiltros = {}): Observable<MovimientoInventarioResponse[]> {
    return this.http.get<MovimientoInventarioResponse[]>(
      `${INVENTARIO}/movimientos/${productoId}`,
      { params: this.params({ desde: f.desde, hasta: f.hasta }) },
    );
  }

  /* ---------------- Compras / Proveedores ---------------- */

  comprasPorRango(f: ReporteFiltros & { proveedorId?: number } = {}): Observable<CompraResumenResponse[]> {
    return this.http.get<CompraResumenResponse[]>(COMPRAS, {
      params: this.params({ desde: f.desde, hasta: f.hasta, proveedorId: f.proveedorId }),
    });
  }

  topProveedores(top = 5): Observable<TopProveedorResponse[]> {
    return this.http.get<TopProveedorResponse[]>(`${BASE}/top-proveedores`, {
      params: this.params({ top }),
    });
  }

  productosMasAdquiridos(top = 10): Observable<TopProductoResponse[]> {
    return this.http.get<TopProductoResponse[]>(`${BASE}/productos-mas-adquiridos`, {
      params: this.params({ top }),
    });
  }

  /* ---------------- Ventas / Clientes ---------------- */

  ventasPorRango(f: ReporteFiltros & { clienteId?: number } = {}): Observable<VentaResumenResponse[]> {
    return this.http.get<VentaResumenResponse[]>(VENTAS, {
      params: this.params({ desde: f.desde, hasta: f.hasta, clienteId: f.clienteId }),
    });
  }

  topClientes(top = 10): Observable<TopClienteResponse[]> {
    return this.http.get<TopClienteResponse[]>(`${BASE}/top-clientes`, {
      params: this.params({ top }),
    });
  }

  productosMayoresIngresos(f: ReporteFiltros = {}): Observable<TopProductoResponse[]> {
    return this.http.get<TopProductoResponse[]>(`${BASE}/productos-mayores-ingresos`, {
      params: this.params({ top: f.top, desde: f.desde, hasta: f.hasta }),
    });
  }

  resumenVentas(f: ReporteFiltros = {}): Observable<ResumenVentasPeriodoResponse[]> {
    return this.http.get<ResumenVentasPeriodoResponse[]>(`${BASE}/resumen-ventas`, {
      params: this.params({
        agrupacion: f.agrupacion ?? 'MES',
        desde: f.desde, hasta: f.hasta,
      }),
    });
  }

  /* ---------------- Auditoría ---------------- */

  logsAuditoria(f: ReporteFiltros & {
    usuarioId?: number; modulo?: string; tipoAccion?: string; texto?: string;
  } = {}): Observable<LogAuditoriaResponse[]> {
    return this.http.get<LogAuditoriaResponse[]>(AUDITORIA, {
      params: this.params({
        desde: f.desde, hasta: f.hasta,
        usuarioId: f.usuarioId, modulo: f.modulo,
        tipoAccion: f.tipoAccion, texto: f.texto,
      }),
    });
  }

  /* ---------------- helper ---------------- */

  private params(src: Record<string, unknown>): HttpParams {
    let p = new HttpParams();
    for (const [k, v] of Object.entries(src)) {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    }
    return p;
  }
}