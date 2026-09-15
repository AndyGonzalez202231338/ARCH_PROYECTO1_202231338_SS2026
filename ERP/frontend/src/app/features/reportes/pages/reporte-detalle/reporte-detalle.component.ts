// src/app/features/reportes/pages/reporte-detalle/reporte-detalle.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductoService } from '../../../productos/services/producto.service';
import { ProductoResponse } from '../../../productos/models/producto.model';
import {
  CompraResumenResponse,
  LogAuditoriaResponse,
  ProductoBajoStockResponse,
  ReporteFiltros,
  ResumenVentasPeriodoResponse,
  TipoReporte,
  TopClienteResponse,
  TopProductoResponse,
  TopProveedorResponse,
  VentaResumenResponse,
  getReporteConfig,
} from '../../models/reporte.model';
import { ReporteService } from '../../services/reporte.service';
import { MovimientoInventarioResponse } from '../../../inventario/models/inventario.model';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-reporte-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reporte-detalle.component.html',
  styleUrls: ['./reporte-detalle.component.scss'],
})
export class ReporteDetalleComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly service = inject(ReporteService);
  private readonly productoService = inject(ProductoService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /* ---------- Estado principal ---------- */
  readonly tipo = signal<TipoReporte>('productos-mas-vendidos');
  readonly config = computed(() => getReporteConfig(this.tipo()));
  readonly loading = signal(true);

  /* ---------- Filtros ---------- */
  readonly desde = signal<string>('');
  readonly hasta = signal<string>('');
  readonly top = signal<number>(10);
  readonly agrupacion = signal<'DIA' | 'MES' | 'ANIO'>('MES');
  readonly productoId = signal<number | null>(null);
  readonly texto = signal<string>('');

  /* ---------- Catálogo de productos (solo para historial) ---------- */
  readonly productos = signal<ProductoResponse[]>([]);

  /* ---------- Datos por tipo (evita uniones complejas) ---------- */
  readonly topProductos = signal<TopProductoResponse[]>([]);
  readonly bajoStock = signal<ProductoBajoStockResponse[]>([]);
  readonly topProveedores = signal<TopProveedorResponse[]>([]);
  readonly topClientes = signal<TopClienteResponse[]>([]);
  readonly movimientos = signal<MovimientoInventarioResponse[]>([]);
  readonly compras = signal<CompraResumenResponse[]>([]);
  readonly ventas = signal<VentaResumenResponse[]>([]);
  readonly resumen = signal<ResumenVentasPeriodoResponse[]>([]);
  readonly logs = signal<LogAuditoriaResponse[]>([]);

  /* ---------- Banderas de UI ---------- */
  readonly puedeVer = computed(() => {
    const cfg = this.config();
    return !!cfg && cfg.roles.includes(this.auth.getRole() as any);
  });

  readonly mostrarFechas = computed(() => !!this.config()?.usaFechas);
  readonly mostrarTop = computed(() => !!this.config()?.usaTop);
  readonly mostrarAgrupacion = computed(() => !!this.config()?.usaAgrupacion);
  readonly mostrarProducto = computed(() => !!this.config()?.usaProducto);

  readonly sinResultados = computed(() => {
    if (this.loading()) return false;
    switch (this.tipo()) {
      case 'productos-mas-vendidos':
      case 'productos-mas-movimientos':
      case 'productos-mas-adquiridos':
      case 'productos-mayores-ingresos': return this.topProductos().length === 0;
      case 'productos-menor-existencia': return this.bajoStock().length === 0;
      case 'top-proveedores':            return this.topProveedores().length === 0;
      case 'top-clientes':               return this.topClientes().length === 0;
      case 'historial-movimientos':      return this.movimientos().length === 0;
      case 'compras-por-rango':          return this.compras().length === 0;
      case 'ventas-por-rango':           return this.ventas().length === 0;
      case 'resumen-ventas':             return this.resumen().length === 0;
      case 'logs-auditoria':             return this.logs().length === 0;
    }
  });

  /* ---------- Ciclo de vida ---------- */
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const t = params.get('tipo') as TipoReporte;
      this.tipo.set(t);

      if (!this.puedeVer()) {
        this.notifications.warning('No tienes permiso para este reporte');
        this.router.navigate(['/reportes']);
        return;
      }

      if (this.mostrarProducto()) this.cargarProductos();
      this.cargar();
    });
  }

  /* ---------- Carga de datos ---------- */
  cargar(): void {
    this.loading.set(true);
    const f: ReporteFiltros = {
        desde: this.desde() || undefined,
        hasta: this.hasta() || undefined,
        top: this.top(),
        agrupacion: this.agrupacion(),
    };

    let obs$: Observable<unknown> | null = null;   

    switch (this.tipo()) {
        case 'productos-mas-vendidos':
        obs$ = this.service.productosMasVendidos(f); break;
        case 'productos-menor-existencia':
        obs$ = this.service.productosMenorExistencia(this.top()); break;
        case 'productos-mas-movimientos':
        obs$ = this.service.productosMasMovimientos(f); break;
        case 'historial-movimientos':
        if (!this.productoId()) {
            this.loading.set(false);
            this.movimientos.set([]);
            return;
        }
        obs$ = this.service.historialMovimientos(this.productoId()!, f); break;
        case 'compras-por-rango':
        obs$ = this.service.comprasPorRango(f); break;
        case 'top-proveedores':
        obs$ = this.service.topProveedores(this.top()); break;
        case 'productos-mas-adquiridos':
        obs$ = this.service.productosMasAdquiridos(this.top()); break;
        case 'ventas-por-rango':
        obs$ = this.service.ventasPorRango(f); break;
        case 'top-clientes':
        obs$ = this.service.topClientes(this.top()); break;
        case 'productos-mayores-ingresos':
        obs$ = this.service.productosMayoresIngresos(f); break;
        case 'resumen-ventas':
        obs$ = this.service.resumenVentas(f); break;
        case 'logs-auditoria':
        obs$ = this.service.logsAuditoria({ ...f, texto: this.texto() || undefined }); break;
    }

    if (!obs$) { this.loading.set(false); return; }   // salvavidas por si el tipo no matchea

    obs$.subscribe({
        next: (data) => { this.asignar(data); this.loading.set(false); },
        error: () => {
        this.loading.set(false);
        this.notifications.error('No se pudo cargar el reporte');
        },
    });
    }

    private asignar(data: unknown): void {
    switch (this.tipo()) {
        case 'productos-mas-vendidos':
        case 'productos-mas-movimientos':
        case 'productos-mas-adquiridos':
        case 'productos-mayores-ingresos':  this.topProductos.set(data as TopProductoResponse[]); break;
        case 'productos-menor-existencia':  this.bajoStock.set(data as ProductoBajoStockResponse[]); break;
        case 'top-proveedores':             this.topProveedores.set(data as TopProveedorResponse[]); break;
        case 'top-clientes':                this.topClientes.set(data as TopClienteResponse[]); break;
        case 'historial-movimientos':       this.movimientos.set(data as MovimientoInventarioResponse[]); break;
        case 'compras-por-rango':           this.compras.set(data as CompraResumenResponse[]); break;
        case 'ventas-por-rango':            this.ventas.set(data as VentaResumenResponse[]); break;
        case 'resumen-ventas':              this.resumen.set(data as ResumenVentasPeriodoResponse[]); break;
        case 'logs-auditoria':              this.logs.set(data as LogAuditoriaResponse[]); break;
    }
    }

  private cargarProductos(): void {
    this.productoService.listar({ activo: true }).subscribe(p => this.productos.set(p));
  }

  /* ---------- Acciones ---------- */
  aplicar(): void { this.cargar(); }

  limpiar(): void {
    this.desde.set('');
    this.hasta.set('');
    this.top.set(10);
    this.agrupacion.set('MES');
    this.productoId.set(null);
    this.texto.set('');
    this.cargar();
  }

  exportarCsv(): void {
    const { header, rows } = this.csvData();
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${this.tipo()}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.notifications.success('Reporte exportado');
  }

  private csvData(): { header: string[]; rows: string[][] } {
    switch (this.tipo()) {
      case 'productos-mas-vendidos':
      case 'productos-mas-movimientos':
      case 'productos-mas-adquiridos':
      case 'productos-mayores-ingresos':
        return {
          header: ['#', 'Código', 'Producto', 'Valor'],
          rows: this.topProductos().map((p, i) =>
            [String(i + 1), p.codigo ?? '', `"${p.nombre}"`, String(p.valor)]),
        };
      case 'productos-menor-existencia':
        return {
          header: ['Código', 'Producto', 'Stock', 'Mínimo'],
          rows: this.bajoStock().map(p =>
            [p.codigo, `"${p.nombre}"`, String(p.stockActual), String(p.stockMinimo)]),
        };
      case 'top-proveedores':
        return {
          header: ['#', 'Proveedor', 'Compras', 'Monto'],
          rows: this.topProveedores().map((p, i) =>
            [String(i + 1), `"${p.nombre}"`, String(p.cantidadCompras), p.montoTotal.toFixed(2)]),
        };
      case 'top-clientes':
        return {
          header: ['#', 'Cliente', 'Ventas', 'Monto'],
          rows: this.topClientes().map((c, i) =>
            [String(i + 1), `"${c.nombre}"`, String(c.cantidadVentas), c.montoTotal.toFixed(2)]),
        };
      case 'compras-por-rango':
        return {
          header: ['Número', 'Proveedor', 'Fecha', 'Total', 'Estado'],
          rows: this.compras().map(c =>
            [c.numeroCompra, `"${c.proveedorNombre}"`, c.fecha, c.total.toFixed(2), c.estado]),
        };
      case 'ventas-por-rango':
        return {
          header: ['Número', 'Cliente', 'Fecha', 'Total', 'Estado'],
          rows: this.ventas().map(v =>
            [v.numeroVenta, `"${v.clienteNombre}"`, v.fecha, v.total.toFixed(2), v.estado]),
        };
      case 'resumen-ventas':
        return {
          header: ['Período', 'Cantidad', 'Total'],
          rows: this.resumen().map(r =>
            [r.periodo, String(r.cantidadVentas), r.totalVentas.toFixed(2)]),
        };
      case 'historial-movimientos':
        return {
          header: ['Fecha', 'Tipo', 'Cantidad', 'Costo', 'Referencia', 'Usuario'],
          rows: this.movimientos().map(m =>
            [m.fecha, m.tipoMovimiento, String(m.cantidad),
             m.costoUnitario.toFixed(2),
             `${m.referenciaTipo} #${m.referenciaId}`, m.usuarioNombre]),
        };
      case 'logs-auditoria':
        return {
          header: ['Fecha', 'Usuario', 'Módulo', 'Acción', 'Detalle'],
          rows: this.logs().map(l =>
            [l.fecha, l.usuarioNombre, l.modulo, l.tipoAccion, `"${l.detalle}"`]),
        };
    }
  }

  /* ---------- Helpers de plantilla ---------- */
  maxResumen(): number {
    const r = this.resumen();
    return r.length ? Math.max(...r.map(x => x.totalVentas)) : 0;
  }
  alturaBarra(v: number): string {
    const max = this.maxResumen();
    if (!max) return '0%';
    return `${Math.max(4, (v / max) * 100)}%`;
  }
  esMonto(tipo: TipoReporte): boolean {
    return tipo === 'productos-mayores-ingresos' || tipo === 'productos-mas-adquiridos';
  }
  refLink(m: MovimientoInventarioResponse): string {
    return m.referenciaTipo === 'COMPRA' ? `/compras/${m.referenciaId}` : `/ventas/${m.referenciaId}`;
  }
}