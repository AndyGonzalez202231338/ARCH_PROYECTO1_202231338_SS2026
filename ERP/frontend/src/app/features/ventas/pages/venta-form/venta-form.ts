import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Toast } from '../../../../core/models/toast/toast';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductoResponse } from '../../../productos/models/producto.model';
import { ProductoService } from '../../../productos/services/producto.service';
import { ClienteResponse } from '../../models/cliente.model';
import { DetalleVentaRequest, VentaRequest } from '../../models/venta.model';
import { mensajeDeError } from '../../services/api-error.util';
import { ClienteService } from '../../services/cliente.service';
import { InventarioService } from '../../services/inventario.service';
import { VentaService } from '../../services/venta.service';

const IVA_TASA = 0.19;

interface FilaValor {
  productoId: number | null;
  cantidad: number;
  precioUnitario: number;
}

@Component({
  selector: 'app-venta-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Toast],
  templateUrl: './venta-form.html',
  styleUrl: './venta-form.scss',
})
export class VentaForm {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly inventarioService = inject(InventarioService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  readonly role = () => this.auth.getRole();

  /** Solo el rol VENTAS puede registrar ventas (coincide con el backend). */
  readonly puedeCrear = computed(() => this.role() === 'VENTAS');

  readonly guardando = signal(false);
  readonly clientes = signal<ClienteResponse[]>([]);
  readonly productos = signal<ProductoResponse[]>([]);
  readonly filtrosProducto = signal<string[]>([]);

  /** productoId -> stockActual, según InventarioController. */
  readonly stockPorProducto = signal<Record<number, number>>({});

  /** Espejo reactivo del FormArray, para poder usar computed(). */
  private readonly filasValor = signal<FilaValor[]>([]);

  /** Mensaje del modal de conflicto (HTTP 409, stock insuficiente). */
  readonly conflictoMensaje = signal<string | null>(null);

  readonly form = this.fb.group({
    clienteId: [null as number | null, [Validators.required]],
    detalles: this.fb.array<FormGroup>([]),
  });

  get detalles(): FormArray<FormGroup> {
    return this.form.get('detalles') as FormArray<FormGroup>;
  }

  get clienteSeleccionado(): ClienteResponse | undefined {
    const id = this.form.get('clienteId')?.value;
    return this.clientes().find(c => c.id === id);
  }

  /** Stock disponible de cada renglón, en el mismo orden del FormArray. */
  readonly stockPorFila = computed(() =>
    this.filasValor().map(fila => (fila.productoId == null ? null : this.stockDe(fila.productoId))),
  );

  /** true en los renglones donde la cantidad supera el stock disponible. */
  readonly stockInsuficientePorFila = computed(() =>
    this.filasValor().map(fila => {
      if (fila.productoId == null) return false;
      const disponible = this.stockDe(fila.productoId);
      if (disponible == null) return false;
      return Number(fila.cantidad) > disponible;
    }),
  );

  readonly hayStockInsuficiente = computed(() =>
    this.stockInsuficientePorFila().some(Boolean),
  );

  readonly totales = computed(() => {
    const subtotal = this.filasValor().reduce(
      (acc, fila) => acc + (Number(fila.cantidad) || 0) * (Number(fila.precioUnitario) || 0),
      0,
    );
    const iva = subtotal * IVA_TASA;
    return { subtotal, iva, total: subtotal + iva };
  });

  /**
   * Método (no computed): `form.invalid` no es una signal, así que debe
   * reevaluarse en cada ciclo de detección de cambios.
   */
  guardarDeshabilitado(): boolean {
    return (
      this.form.invalid ||
      this.detalles.length === 0 ||
      this.hayStockInsuficiente() ||
      this.guardando()
    );
  }

  constructor() {
    if (!this.puedeCrear()) {
      this.notifications.error('No tienes permisos para esta acción');
      this.router.navigate(['/ventas']);
      return;
    }

    this.clienteService.listar({ activo: true }).subscribe({
      next: data => this.clientes.set(data),
      error: () => this.notifications.error('No se pudieron cargar los clientes.'),
    });

    this.productoService.listar({ activo: true }).subscribe({
      next: data => {
        this.productos.set(data);
        // Fallback: si el endpoint de inventario falla, se usa el
        // stockActual que ya viene en el producto.
        this.stockPorProducto.update(actual => {
          const mapa = { ...actual };
          data.forEach(p => {
            if (mapa[p.id] == null) mapa[p.id] = p.stockActual;
          });
          return mapa;
        });
      },
      error: () => this.notifications.error('No se pudieron cargar los productos.'),
    });

    this.inventarioService.listarStock().subscribe({
      next: stock => {
        this.stockPorProducto.update(actual => {
          const mapa = { ...actual };
          stock.forEach(s => (mapa[s.productoId] = s.stockActual));
          return mapa;
        });
      },
      error: () => this.notifications.warning('No se pudo consultar el stock en tiempo real.'),
    });

    this.detalles.valueChanges.subscribe(() => this.sincronizarFilas());

    this.agregarProducto();
  }

  /** Stock disponible de un producto, o null si aún no se conoce. */
  stockDe(productoId: number): number | null {
    return this.stockPorProducto()[productoId] ?? null;
  }

  private sincronizarFilas(): void {
    this.filasValor.set(
      this.detalles.controls.map(grupo => ({
        productoId: grupo.get('productoId')?.value ?? null,
        cantidad: Number(grupo.get('cantidad')?.value) || 0,
        precioUnitario: Number(grupo.get('precioUnitario')?.value) || 0,
      })),
    );
  }

  private crearFilaDetalle(): FormGroup {
    return this.fb.group({
      productoId: [null as number | null, [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
    });
  }

  agregarProducto(): void {
    this.detalles.push(this.crearFilaDetalle());
    this.filtrosProducto.update(arr => [...arr, '']);
    this.sincronizarFilas();
  }

  quitarProducto(index: number): void {
    this.detalles.removeAt(index);
    this.filtrosProducto.update(arr => arr.filter((_, i) => i !== index));
    this.sincronizarFilas();
  }

  onFiltroProductoChange(index: number, valor: string): void {
    this.filtrosProducto.update(arr => arr.map((v, i) => (i === index ? valor : v)));
  }

  productosFiltrados(index: number): ProductoResponse[] {
    const filtro = (this.filtrosProducto()[index] ?? '').trim().toLowerCase();
    const lista = this.productos();
    if (!filtro) return lista;
    return lista.filter(
      p => p.nombre.toLowerCase().includes(filtro) || p.codigo.toLowerCase().includes(filtro),
    );
  }

  onProductoSeleccionado(index: number, productoIdStr: string): void {
    const productoId = productoIdStr ? Number(productoIdStr) : null;
    const grupo = this.detalles.at(index);
    grupo.get('productoId')?.setValue(productoId);

    const producto = this.productos().find(p => p.id === productoId);
    if (producto) {
      // Se precarga el precio de venta; el usuario puede ajustarlo.
      grupo.get('precioUnitario')?.setValue(producto.precioVenta);
    }
    this.sincronizarFilas();
  }

  subtotalDe(index: number): number {
    const fila = this.filasValor()[index];
    if (!fila) return 0;
    return (Number(fila.cantidad) || 0) * (Number(fila.precioUnitario) || 0);
  }

  stockDisponibleDe(index: number): number | null {
    return this.stockPorFila()[index] ?? null;
  }

  stockInsuficienteEn(index: number): boolean {
    return this.stockInsuficientePorFila()[index] ?? false;
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  detalleInvalido(index: number, campo: string): boolean {
    const control = this.detalles.at(index).get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  cerrarConflicto(): void {
    this.conflictoMensaje.set(null);
  }

  cancelar(): void {
    this.router.navigate(['/ventas']);
  }

  formatoQuetzales(valor: number): string {
    return `Q ${valor.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  guardar(): void {
    if (this.form.invalid || this.detalles.length === 0) {
      this.form.markAllAsTouched();
      if (this.detalles.length === 0) {
        this.notifications.error('Agrega al menos un producto a la venta.');
      }
      return;
    }

    if (this.hayStockInsuficiente()) {
      this.notifications.error('Hay renglones con stock insuficiente.');
      return;
    }

    const valores = this.form.getRawValue();
    const detalles: DetalleVentaRequest[] = (valores.detalles as FilaValor[]).map(d => ({
      productoId: Number(d.productoId),
      cantidad: Number(d.cantidad),
      precioUnitario: Number(d.precioUnitario),
    }));

    const request: VentaRequest = {
      clienteId: Number(valores.clienteId),
      detalles,
    };

    this.guardando.set(true);

    this.ventaService.registrar(request).subscribe({
      next: venta => {
        this.guardando.set(false);
        this.notifications.success('Venta registrada correctamente');
        this.router.navigate(['/ventas', venta.id]);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);

        if (err.status === 403) {
          this.notifications.error('No tienes permisos');
          this.router.navigate(['/dashboard']);
          return;
        }

        if (err.status === 409) {
          this.conflictoMensaje.set(
            mensajeDeError(err, 'Stock insuficiente para completar la venta.'),
          );
          return;
        }

        this.notifications.error(mensajeDeError(err, 'Ocurrió un error al guardar la venta.'));
      },
    });
  }
}
