import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Toast } from '../../../../core/models/toast/toast';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClienteService } from '../../services/cliente.service';
import { ClienteRequest, TIPOS_DOCUMENTO } from '../../models/cliente.model';
import { mensajeDeError } from '../../../ventas/services/api-error.util';


@Component({
  selector: 'app-cliente-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Toast],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.scss',
})
export class ClienteForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  /** Wrapper sobre getRole(), igual que en el listado. */
  readonly role = () => this.auth.getRole();

  readonly puedeEditar = computed(() => this.role() === 'VENTAS');

  readonly tiposDocumento = TIPOS_DOCUMENTO;

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly clienteId = this.idParam ? Number(this.idParam) : null;
  readonly modoEdicion = this.clienteId !== null;

  readonly titulo = computed(() => (this.modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente'));

  readonly cargandoDatos = signal(this.modoEdicion);
  readonly guardando = signal(false);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    tipoDocumento: ['CC', [Validators.required]],
    numeroDocumento: ['', [Validators.required, Validators.maxLength(30)]],
    telefono: [''],
    email: ['', [Validators.email]],
    direccion: ['', [Validators.maxLength(255)]],
    activo: [true],
  });

  constructor() {
    if (!this.puedeEditar()) {
      this.notifications.error('No tienes permisos para esta acción');
      this.router.navigate(['/clientes']);
      return;
    }

    if (this.modoEdicion && this.clienteId !== null) {
      this.clienteService.obtener(this.clienteId).subscribe({
        next: cliente => {
          this.form.patchValue({
            nombre: cliente.nombre,
            tipoDocumento: cliente.tipoDocumento,
            numeroDocumento: cliente.numeroDocumento,
            telefono: cliente.telefono ?? '',
            email: cliente.email ?? '',
            direccion: cliente.direccion ?? '',
            activo: cliente.activo,
          });
          this.cargandoDatos.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.cargandoDatos.set(false);
          if (err.status === 403) {
            this.notifications.error('No tienes permisos');
            this.router.navigate(['/dashboard']);
            return;
          }
          this.notifications.error(
            mensajeDeError(err, 'No se pudo cargar el cliente solicitado.'),
          );
          this.router.navigate(['/clientes']);
        },
      });
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onActivoChange(valor: boolean): void {
    this.form.get('activo')?.setValue(valor);
    this.form.get('activo')?.markAsDirty();
  }

  cancelar(): void {
    this.router.navigate(['/clientes']);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const request: ClienteRequest = {
      nombre: (valores.nombre ?? '').trim(),
      tipoDocumento: valores.tipoDocumento ?? 'CC',
      numeroDocumento: (valores.numeroDocumento ?? '').trim(),
      telefono: (valores.telefono ?? '').trim() || undefined,
      email: (valores.email ?? '').trim() || undefined,
      direccion: (valores.direccion ?? '').trim() || undefined,
      activo: valores.activo ?? true,
    };

    this.guardando.set(true);

    const peticion =
      this.modoEdicion && this.clienteId !== null
        ? this.clienteService.actualizar(this.clienteId, request)
        : this.clienteService.crear(request);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.notifications.success(
          this.modoEdicion ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente',
        );
        this.router.navigate(['/clientes']);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);

        if (err.status === 403) {
          this.notifications.error('No tienes permisos');
          this.router.navigate(['/dashboard']);
          return;
        }

        if (err.status === 409) {
          this.notifications.error(
            mensajeDeError(err, 'Ya existe un cliente con ese número de documento.'),
          );
          return;
        }

        this.notifications.error(mensajeDeError(err, 'Ocurrió un error al guardar el cliente.'));
      },
    });
  }
}
