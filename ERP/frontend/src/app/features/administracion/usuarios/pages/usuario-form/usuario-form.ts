import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Toast } from '../../../../../core/models/toast/toast';
import { AdminUsuarioService } from '../../services/admin-usuario.service';
import { AreaService } from '../../services/area.service';
import { AreaResponse } from '../../models/area.model';
import { UsuarioRequest } from '../../models/usuario.model';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-usuario-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Toast],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.scss',
})
export class UsuarioForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(AdminUsuarioService);
  private readonly areaService = inject(AreaService);
  private readonly notifications = inject(NotificationService);

  readonly areas = signal<AreaResponse[]>([]);

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly usuarioId = this.idParam ? Number(this.idParam) : null;
  readonly modoEdicion = this.usuarioId !== null;

  readonly cargandoDatos = signal(this.modoEdicion);
  readonly guardando = signal(false);

  readonly titulo = computed(() => (this.modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'));
  readonly breadcrumbActual = computed(() => (this.modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'));
  readonly textoBoton = computed(() => (this.modoEdicion ? 'Actualizar Usuario' : 'Guardar Usuario'));

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    password: this.modoEdicion
      ? ['']
      : ['', [Validators.required, Validators.minLength(6)]],
    areaId: [null as number | null, [Validators.required]],
    activo: [true],
  });

  constructor() {
    this.areaService.listar().subscribe({
      next: data => this.areas.set(data),
      error: () => this.notifications.error('No se pudieron cargar las áreas.'),
    });

    if (this.modoEdicion && this.usuarioId !== null) {
      this.usuarioService.obtener(this.usuarioId).subscribe({
        next: usuario => {
          this.form.patchValue({
            nombre: usuario.nombre,
            email: usuario.email,
            areaId: usuario.areaId,
            activo: usuario.activo,
          });
          this.cargandoDatos.set(false);
        },
        error: () => {
          this.cargandoDatos.set(false);
          this.notifications.error('No se pudo cargar el usuario solicitado.');
          this.router.navigate(['/usuarios']);
        },
      });
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const request: UsuarioRequest = {
      nombre: valores.nombre!,
      email: valores.email!,
      areaId: Number(valores.areaId),
      activo: valores.activo ?? true,
    };

    if (!this.modoEdicion) {
      request.password = valores.password || undefined;
    }

    this.guardando.set(true);

    const operacion$ = this.modoEdicion && this.usuarioId !== null
      ? this.usuarioService.actualizar(this.usuarioId, request)
      : this.usuarioService.crear(request);

    operacion$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.notifications.success(
          this.modoEdicion ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.',
        );
        this.router.navigate(['/usuarios']);
      },
      error: () => {
        this.guardando.set(false);
        this.notifications.error('Ocurrió un error al guardar el usuario.');
      },
    });
  }
}