import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service'; // 👈 CAMBIO
import {
  MovimientoFiltros,
  MovimientoInventarioResponse,
  ProductoResumen,
} from '../../models/inventario.model';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-inventario-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inventario-movimientos.component.html',
  styleUrls: ['./inventario-movimientos.component.scss'],
})
export class InventarioMovimientosComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly service = inject(InventarioService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService); // 👈 CAMBIO

  readonly role = () => this.auth.getRole();
  readonly puedeVerMovimientos = computed(() =>
    this.role() === 'ADMINISTRACION' || this.role() === 'INVENTARIO',
  );

  readonly productoId = Number(this.route.snapshot.paramMap.get('productoId'));
  readonly producto = signal<ProductoResumen | null>(null);
  readonly movimientos = signal<MovimientoInventarioResponse[]>([]);
  readonly loading = signal(true);

  readonly desde = signal<string>('');
  readonly hasta = signal<string>('');
  readonly tipo = signal<'ENTRADA' | 'SALIDA' | ''>('');

  readonly page = signal(1);
  readonly pageSize = 20;

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.movimientos().length / this.pageSize)),
  );
  readonly paginados = computed(() => {
    const s = (this.page() - 1) * this.pageSize;
    return this.movimientos().slice(s, s + this.pageSize);
  });

  readonly totalMovimientos = computed(() => this.movimientos().length);

  ngOnInit(): void {
    if (!this.puedeVerMovimientos()) {
      this.notifications.warning('No tienes permisos para ver movimientos');
      this.router.navigate(['/inventario']);
      return;
    }
    this.cargarProducto();
    this.cargar();
  }


  cargarProducto(): void {
    this.service.obtenerProductoResumen(this.productoId).subscribe(p => this.producto.set(p));
  }

  cargar(): void {
    this.loading.set(true);
    const filtros: MovimientoFiltros = {
      desde: this.desde() || undefined,
      hasta: this.hasta() || undefined,
      tipo: this.tipo() || undefined,
    };
    this.service.obtenerMovimientos(this.productoId, filtros).subscribe({
      next: data => {
        this.movimientos.set(data);
        this.loading.set(false);
        this.page.set(1);
      },
      error: () => this.loading.set(false),
    });
  }

  aplicarFiltros(): void { this.cargar(); }

  limpiarFiltros(): void {
    this.desde.set('');
    this.hasta.set('');
    this.tipo.set('');
    this.cargar();
  }

  irPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas()) return;
    this.page.set(p);
  }

  /** Ruta destino del link de referencia (COMPRA / VENTA). */
  refLink(m: MovimientoInventarioResponse): string {
    return m.referenciaTipo === 'COMPRA'
      ? `/compras/${m.referenciaId}`
      : `/ventas/${m.referenciaId}`;
  }

  trackById = (_: number, m: MovimientoInventarioResponse) => m.id;
}