import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Toast } from '../../../../core/models/toast/toast';
import { NotificationService } from '../../../../core/services/notification.service';
import { PermissionsService } from '../../../../core/permissions/permissions.service';
import { ProductoService } from '../../services/producto.service';
import { ProductoResponse } from '../../models/producto.model';

@Component({
  selector: 'app-producto-detalle',
  imports: [CommonModule, RouterLink, Toast],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.scss',
})
export class ProductoDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productoService = inject(ProductoService);
  private readonly notifications = inject(NotificationService);
  private readonly permissions = inject(PermissionsService);

  readonly puedeEditar = computed(() => this.permissions.canWrite('productos'));

  readonly producto = signal<ProductoResponse | null>(null);
  readonly loading = signal(true);

  readonly margenGanancia = computed(() => {
    const p = this.producto();
    if (!p) return 0;
    return p.precioVenta - p.precioCompra;
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productoService.obtener(id).subscribe({
      next: data => {
        this.producto.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notifications.error('No se pudo cargar el producto solicitado.');
        this.router.navigate(['/productos']);
      },
    });
  }

  volver(): void {
    this.router.navigate(['/productos']);
  }

  editar(): void {
    const p = this.producto();
    if (!p) return;
    this.router.navigate(['/productos', p.id, 'editar']);
  }
}
