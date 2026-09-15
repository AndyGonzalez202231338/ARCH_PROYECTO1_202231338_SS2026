import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { StockProductoResponse } from '../../models/inventario.model';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-inventario-bajo-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inventario-bajo-stock.component.html',
  styleUrls: ['./inventario-bajo-stock.component.scss'],
})
export class InventarioBajoStockComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly service = inject(InventarioService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ---- Permisos
  readonly role = () => this.auth.getRole();
  readonly esCompras = computed(() => this.role() === 'COMPRAS');
  readonly esInventario = computed(() => this.role() === 'INVENTARIO');

  // ---- Estado
  readonly items = signal<StockProductoResponse[]>([]);
  readonly loading = signal(true);
  readonly umbral = signal<number | null>(null);
  readonly umbralInput = signal<number | null>(null);

  readonly page = signal(1);
  readonly pageSize = 15;

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.items().length / this.pageSize)),
  );

  readonly paginados = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.items().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap.get('umbral');
    if (qp != null && qp !== '') {
      const n = Number(qp);
      if (!Number.isNaN(n)) {
        this.umbral.set(n);
        this.umbralInput.set(n);
      }
    }
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.service.listarBajoStock(this.umbral() ?? undefined).subscribe({
      next: data => {
        this.items.set(data);
        this.loading.set(false);
        this.page.set(1);
      },
      error: () => this.loading.set(false),
    });
  }

  aplicarUmbral(): void {
    const v = this.umbralInput();
    const valido = v != null && !Number.isNaN(v) && v >= 0 ? v : null;
    this.umbral.set(valido);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: valido != null ? { umbral: valido } : {},
      queryParamsHandling: 'merge',
    });

    this.cargar();
  }

  limpiarUmbral(): void {
    this.umbral.set(null);
    this.umbralInput.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
    this.cargar();
  }

  deficit(p: StockProductoResponse): number {
    return Math.max(0, p.stockMinimo - p.stockActual);
  }

  irPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas()) return;
    this.page.set(p);
  }

  irACompras(): void {
    this.router.navigate(['/compras/nueva']);
  }

  trackById = (_: number, p: StockProductoResponse) => p.productoId;
}