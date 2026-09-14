import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Toast } from '../../../../core/models/toast/toast';
import { CompraService } from '../../services/compra.service';
import { ProveedorService } from '../../services/proveedor.service';
import { ProductoService } from '../../services/producto.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProveedorResponse } from '../../models/proveedor.model';
import { ProductoResponse } from '../../../productos/models/producto.model';
import { CompraRequest, DetalleCompraRequest, EstadoCompra } from '../../models/compra.model';



const IVA_TASA = 0.12;

@Component({
  selector: 'app-compra-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Toast],
  templateUrl: './compra-form.html',
  styleUrl: './compra-form.scss',
})
export class CompraForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly compraService = inject(CompraService);
  private readonly proveedorService = inject(ProveedorService);
  private readonly productoService = inject(ProductoService);
  private readonly notifications = inject(NotificationService);

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly compraId = this.idParam ? Number(this.idParam) : null;
  readonly modoEdicion = this.compraId !== null;

  readonly titulo = computed(() => (this.modoEdicion ? 'Editar Compra' : 'Nueva Compra'));
  readonly breadcrumbActual = computed(() => (this.modoEdicion ? 'Editar Compra' : 'Nueva Compra'));

  readonly cargandoDatos = signal(this.modoEdicion);
  readonly guardando = signal(false);

  readonly proveedores = signal<ProveedorResponse[]>([]);
  readonly productos = signal<ProductoResponse[]>([]);
  readonly filtrosProducto = signal<string[]>([]);

  /** Estado real de la compra cargada (solo en edición). */
  readonly estadoActual = signal<EstadoCompra>('PENDIENTE');
  /** Detalles y proveedor solo se pueden modificar si la compra está PENDIENTE (o es nueva). */
  readonly puedeModificarDetalle = computed(() => !this.modoEdicion || this.estadoActual() === 'PENDIENTE');

  readonly totales = signal({ subtotal: 0, iva: 0, total: 0 });

  readonly form = this.fb.group({
    proveedorId: [null as number | null, [Validators.required]],
    detalles: this.fb.array<FormGroup>([]),
  });

  get detalles(): FormArray<FormGroup> {
    return this.form.get('detalles') as FormArray<FormGroup>;
  }

  get proveedorSeleccionado(): ProveedorResponse | undefined {
    const id = this.form.get('proveedorId')?.value;
    return this.proveedores().find(p => p.id === id);
  }

  constructor() {
    this.proveedorService.listar(true).subscribe({
      next: data => this.proveedores.set(data),
      error: () => this.notifications.error('No se pudieron cargar los proveedores.'),
    });

    this.productoService.listar({ activo: true }).subscribe({
      next: data => this.productos.set(data),
      error: () => this.notifications.error('No se pudieron cargar los productos.'),
    });

    this.detalles.valueChanges.subscribe(() => this.recalcularTotales());

    if (this.modoEdicion && this.compraId !== null) {
      this.compraService.obtener(this.compraId).subscribe({
        next: compra => {
          this.estadoActual.set(compra.estado);
          this.form.patchValue({ proveedorId: compra.proveedorId });

          compra.detalles.forEach(detalle => {
            this.detalles.push(this.crearFilaDetalle({
              productoId: detalle.productoId,
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario,
            }));
            this.filtrosProducto.update(arr => [...arr, '']);
          });

          if (compra.estado !== 'PENDIENTE') {
            this.form.get('proveedorId')?.disable();
          }

          this.recalcularTotales();
          this.cargandoDatos.set(false);
        },
        error: () => {
          this.cargandoDatos.set(false);
          this.notifications.error('No se pudo cargar la compra solicitada.');
          this.router.navigate(['/compras']);
        },
      });
    } else {
      this.agregarProducto();
    }
  }

  private crearFilaDetalle(valores?: { productoId: number; cantidad: number; precioUnitario: number }): FormGroup {
    return this.fb.group({
      productoId: [valores?.productoId ?? null, [Validators.required]],
      cantidad: [valores?.cantidad ?? 1, [Validators.required, Validators.min(1)]],
      precioUnitario: [valores?.precioUnitario ?? 0, [Validators.required, Validators.min(0)]],
    });
  }

  agregarProducto(): void {
    if (!this.puedeModificarDetalle()) return;
    this.detalles.push(this.crearFilaDetalle());
    this.filtrosProducto.update(arr => [...arr, '']);
  }

  quitarProducto(index: number): void {
    if (!this.puedeModificarDetalle()) return;
    this.detalles.removeAt(index);
    this.filtrosProducto.update(arr => arr.filter((_, i) => i !== index));
    this.recalcularTotales();
  }

  onFiltroProductoChange(index: number, valor: string): void {
    this.filtrosProducto.update(arr => arr.map((v, i) => (i === index ? valor : v)));
  }

  productosFiltrados(index: number): ProductoResponse[] {
    const filtro = (this.filtrosProducto()[index] ?? '').trim().toLowerCase();
    const lista = this.productos();
    if (!filtro) return lista;
    return lista.filter(p =>
      p.nombre.toLowerCase().includes(filtro) || p.codigo.toLowerCase().includes(filtro),
    );
  }

  onProductoSeleccionado(index: number, productoIdStr: string): void {
    const productoId = productoIdStr ? Number(productoIdStr) : null;
    const grupo = this.detalles.at(index);
    grupo.get('productoId')?.setValue(productoId);

    const producto = this.productos().find(p => p.id === productoId);
    if (producto) {
      grupo.get('precioUnitario')?.setValue(producto.precioCompra);
    }
  }

  subtotalDe(index: number): number {
    const grupo = this.detalles.at(index);
    const cantidad = Number(grupo.get('cantidad')?.value) || 0;
    const precio = Number(grupo.get('precioUnitario')?.value) || 0;
    return cantidad * precio;
  }

  private recalcularTotales(): void {
    const subtotal = this.detalles.controls.reduce((acc, grupo) => {
      const cantidad = Number(grupo.get('cantidad')?.value) || 0;
      const precio = Number(grupo.get('precioUnitario')?.value) || 0;
      return acc + cantidad * precio;
    }, 0);
    const iva = subtotal * IVA_TASA;
    this.totales.set({ subtotal, iva, total: subtotal + iva });
  }

  formatoQuetzales(valor: number): string {
    return `Q ${valor.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  detalleInvalido(index: number, campo: string): boolean {
    const control = this.detalles.at(index).get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  cancelar(): void {
    this.router.navigate(['/compras']);
  }

  guardar(): void {
    if (this.form.invalid || this.detalles.length === 0) {
      this.form.markAllAsTouched();
      if (this.detalles.length === 0) {
        this.notifications.error('Agrega al menos un producto a la compra.');
      }
      return;
    }

    const valores = this.form.getRawValue();
    const detalles: DetalleCompraRequest[] = valores.detalles.map((d: any) => ({
      productoId: Number(d.productoId),
      cantidad: Number(d.cantidad),
      precioUnitario: Number(d.precioUnitario),
    }));

    const request: CompraRequest = {
      proveedorId: Number(valores.proveedorId),
      detalles,
    };

    this.guardando.set(true);

    // El backend actual solo expone registrar() (POST) y cambiarEstado();
    // no hay un endpoint de actualización de detalles todavía. En modo
    // edición se vuelve a registrar como referencia — ajusta esto cuando
    // el backend exponga un PUT /api/admin/compras/{id}.
    this.compraService.registrar(request).subscribe({
      next: () => {
        this.guardando.set(false);
        this.notifications.success('Compra registrada correctamente.');
        this.router.navigate(['/compras']);
      },
      error: () => {
        this.guardando.set(false);
        this.notifications.error('Ocurrió un error al guardar la compra.');
      },
    });
  }
}
