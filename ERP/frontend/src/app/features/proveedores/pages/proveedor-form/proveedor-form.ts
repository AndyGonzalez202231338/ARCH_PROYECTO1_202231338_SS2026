import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Toast } from '../../../../core/models/toast/toast';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProveedorService } from '../../services/proveedor.service';
import { ProveedorRequest } from '../../models/proveedor.model';

@Component({
  selector: 'app-proveedor-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Toast],
  templateUrl: './proveedor-form.html',
  styleUrl: './proveedor-form.scss',
})
export class ProveedorForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly proveedorService = inject(ProveedorService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly proveedorId = this.idParam ? Number(this.idParam) : null;
  readonly modoEdicion = this.proveedorId !== null;

  readonly cargandoDatos = signal(this.modoEdicion);
  readonly guardando = signal(false);

  readonly titulo = computed(() => (this.modoEdicion ? 'Editar Proveedor' : 'Nuevo Proveedor'));
  readonly breadcrumbActual = computed(() => (this.modoEdicion ? 'Editar Proveedor' : 'Nuevo Proveedor'));
  readonly textoBoton = computed(() => (this.modoEdicion ? 'Actualizar Proveedor' : 'Guardar Proveedor'));

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    nit: ['', [Validators.required, Validators.maxLength(30)]],
    telefono: ['', [Validators.maxLength(30)]],
    email: ['', [Validators.email]],
    direccion: ['', [Validators.maxLength(255)]],
    activo: [true],
  });

  constructor() {
    // Solo COMPRAS puede crear o editar. Si alguien más llega por URL directa, se redirige al listado.
    if (this.auth.getRole() !== 'COMPRAS') {
      this.notifications.error('No tienes permisos para esta acción.');
      this.router.navigate(['/proveedores']);
      return;
    }

    if (this.modoEdicion && this.proveedorId !== null) {
      this.proveedorService.obtener(this.proveedorId).subscribe({
        next: proveedor => {
          this.form.patchValue({
            nombre: proveedor.nombre,
            nit: proveedor.nit,
            telefono: proveedor.telefono ?? '',
            email: proveedor.email ?? '',
            direccion: proveedor.direccion ?? '',
            activo: proveedor.activo,
          });
          this.cargandoDatos.set(false);
        },
        error: () => {
          this.cargandoDatos.set(false);
          this.notifications.error('No se pudo cargar el proveedor solicitado.');
          this.router.navigate(['/proveedores']);
        },
      });
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  cancelar(): void {
    this.router.navigate(['/proveedores']);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const request: ProveedorRequest = {
      nombre: valores.nombre!,
      nit: valores.nit!,
      telefono: valores.telefono || undefined,
      email: valores.email || undefined,
      direccion: valores.direccion || undefined,
      activo: valores.activo ?? true,
    };

    this.guardando.set(true);

    const operacion$ = this.modoEdicion && this.proveedorId !== null
      ? this.proveedorService.actualizar(this.proveedorId, request)
      : this.proveedorService.crear(request);

    operacion$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.notifications.success(
          this.modoEdicion ? 'Proveedor actualizado correctamente.' : 'Proveedor creado correctamente.',
        );
        this.router.navigate(['/proveedores']);
      },
      error: (err) => {
        this.guardando.set(false);
        const mensaje = err?.error?.message || 'Ocurrió un error al guardar el proveedor. Verifica que el NIT no esté ya registrado.';
        this.notifications.error(mensaje);
      },
    });
  }
}
