import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Toast } from '../../../../core/models/toast/toast';
import { NotificationService } from '../../../../core/services/notification.service';
import { PermissionsService } from '../../../../core/permissions/permissions.service';
import { CategoriaService } from '../../services/categoria.service';
import { ProductoService } from '../../services/producto.service';
import { CategoriaResponse } from '../../models/categoria.model';
import { ProductoRequest, UNIDADES_MEDIDA } from '../../models/producto.model';

@Component({
  selector: 'app-producto-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Toast],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.scss',
})
export class ProductoForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly notifications = inject(NotificationService);
  private readonly permissions = inject(PermissionsService);

  readonly unidadesMedida = UNIDADES_MEDIDA;
  readonly categorias = signal<CategoriaResponse[]>([]);

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly productoId = this.idParam ? Number(this.idParam) : null;
  readonly modoEdicion = this.productoId !== null;

  readonly cargandoDatos = signal(this.modoEdicion);
  readonly guardando = signal(false);

  readonly titulo = computed(() => (this.modoEdicion ? 'Editar Producto' : 'Nuevo Producto'));
  readonly breadcrumbActual = computed(() => (this.modoEdicion ? 'Editar Producto' : 'Nuevo Producto'));
  readonly textoBoton = computed(() => (this.modoEdicion ? 'Actualizar Producto' : 'Guardar Producto'));

  readonly form = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: [''],
    categoriaId: [null as number | null, [Validators.required]],
    precioCompra: [null as number | null, [Validators.required, Validators.min(0)]],
    precioVenta: [null as number | null, [Validators.required, Validators.min(0)]],
    unidadMedida: ['UND', [Validators.required]],
    stockMinimo: [null as number | null, [Validators.required, Validators.min(0)]],
    activo: [true],
  });

  constructor() {
    // Solo INVENTARIO/ADMINISTRACION (acceso FULL sobre 'productos') pueden crear o editar.
    // Si alguien más llega por URL directa, se redirige al listado.
    if (!this.permissions.canWrite('productos')) {
      this.notifications.error('No tienes permisos para esta acción.');
      this.router.navigate(['/productos']);
      return;
    }

    this.categoriaService.listar().subscribe({
      next: data => this.categorias.set(data),
      error: () => this.notifications.error('No se pudieron cargar las categorías.'),
    });

    if (this.modoEdicion && this.productoId !== null) {
      this.productoService.obtener(this.productoId).subscribe({
        next: producto => {
          this.form.patchValue({
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion ?? '',
            categoriaId: producto.categoriaId,
            precioCompra: producto.precioCompra,
            precioVenta: producto.precioVenta,
            unidadMedida: producto.unidadMedida,
            stockMinimo: producto.stockMinimo,
            activo: producto.activo,
          });
          this.cargandoDatos.set(false);
        },
        error: () => {
          this.cargandoDatos.set(false);
          this.notifications.error('No se pudo cargar el producto solicitado.');
          this.router.navigate(['/productos']);
        },
      });
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  cancelar(): void {
    this.router.navigate(['/productos']);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const request: ProductoRequest = {
      codigo: valores.codigo!,
      nombre: valores.nombre!,
      descripcion: valores.descripcion || undefined,
      categoriaId: Number(valores.categoriaId),
      precioCompra: Number(valores.precioCompra),
      precioVenta: Number(valores.precioVenta),
      unidadMedida: valores.unidadMedida!,
      stockMinimo: Number(valores.stockMinimo),
      activo: valores.activo ?? true,
    };

    this.guardando.set(true);

    const operacion$ = this.modoEdicion && this.productoId !== null
      ? this.productoService.actualizar(this.productoId, request)
      : this.productoService.crear(request);

    operacion$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.notifications.success(
          this.modoEdicion ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.',
        );
        this.router.navigate(['/productos']);
      },
      error: () => {
        this.guardando.set(false);
        this.notifications.error('Ocurrió un error al guardar el producto.');
      },
    });
  }
}
