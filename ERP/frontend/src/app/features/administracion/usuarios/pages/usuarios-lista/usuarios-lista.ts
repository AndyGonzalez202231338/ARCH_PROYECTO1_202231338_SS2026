import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Toast } from '../../../../../core/models/toast/toast';
import { ConfirmDialog } from '../../../../../shared/confirm-dialog/confirm-dialog';
import { AdminUsuarioService } from '../../services/admin-usuario.service';
import { AreaService } from '../../services/area.service';
import { UsuarioResponse } from '../../models/usuario.model';
import { AreaResponse } from '../../models/area.model';
import { PasswordDialog } from '../../components/password-dialog/password-dialog';
import { NotificationService } from '../../../../../core/services/notification.service';

type EstadoFiltro = 'todos' | 'activos' | 'inactivos';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-usuarios-lista',
  imports: [CommonModule, Toast, ConfirmDialog, PasswordDialog],
  templateUrl: './usuarios-lista.html',
  styleUrl: './usuarios-lista.scss',
})
export class UsuariosLista {
  private readonly usuarioService = inject(AdminUsuarioService);
  private readonly areaService = inject(AreaService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly areas = signal<AreaResponse[]>([]);

  // --- Estado ---
  readonly usuarios = signal<UsuarioResponse[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);

  readonly searchDisplay = signal('');
  readonly searchText = signal('');
  readonly areaFilter = signal<number | null>(null);
  readonly estadoFilter = signal<EstadoFiltro>('todos');

  // --- Diálogos ---
  readonly usuarioParaCambiarEstado = signal<UsuarioResponse | null>(null);
  readonly usuarioParaPassword = signal<UsuarioResponse | null>(null);
  readonly procesandoAccion = signal(false);

  private debounceHandle?: ReturnType<typeof setTimeout>;

  readonly hasFiltros = computed(() =>
    this.searchText() !== '' || this.areaFilter() !== null || this.estadoFilter() !== 'todos',
  );

  readonly totalUsuarios = computed(() => this.usuarios().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalUsuarios() / PAGE_SIZE)),
  );

  readonly paginatedUsuarios = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.usuarios().slice(start, start + PAGE_SIZE);
  });

  readonly rangoMostrado = computed(() => {
    if (this.totalUsuarios() === 0) return { desde: 0, hasta: 0 };
    const desde = (this.currentPage() - 1) * PAGE_SIZE + 1;
    const hasta = Math.min(this.currentPage() * PAGE_SIZE, this.totalUsuarios());
    return { desde, hasta };
  });

  readonly paginasVisibles = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1).slice(0, 3);
  });

  constructor() {
    this.areaService.listar().subscribe({
      next: data => this.areas.set(data),
      error: () => this.notifications.error('No se pudieron cargar las áreas.'),
    });

    effect(() => {
      const texto = this.searchText();
      const areaId = this.areaFilter();
      const estado = this.estadoFilter();
      const activo = estado === 'activos' ? true : estado === 'inactivos' ? false : undefined;
      this.cargarUsuarios(texto, areaId, activo);
    });
  }

  private cargarUsuarios(texto: string, areaId: number | null, activo?: boolean): void {
    this.loading.set(true);
    this.usuarioService
      .listar({ texto: texto || undefined, areaId: areaId ?? undefined, activo })
      .subscribe({
        next: data => {
          this.usuarios.set(data);
          this.currentPage.set(1);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notifications.error('No se pudo cargar la lista de usuarios.');
        },
      });
  }

  onBuscarInput(valor: string): void {
    this.searchDisplay.set(valor);
    clearTimeout(this.debounceHandle);
    this.debounceHandle = setTimeout(() => this.searchText.set(valor), 300);
  }

  onAreaChange(valor: string): void {
    this.areaFilter.set(valor ? Number(valor) : null);
  }

  onEstadoChange(valor: string): void {
    this.estadoFilter.set(valor as EstadoFiltro);
  }

  limpiarFiltros(): void {
    this.searchDisplay.set('');
    clearTimeout(this.debounceHandle);
    this.searchText.set('');
    this.areaFilter.set(null);
    this.estadoFilter.set('todos');
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages()) return;
    this.currentPage.set(pagina);
  }

  nuevoUsuario(): void {
    this.router.navigate(['/usuarios', 'nuevo']);
  }

  editarUsuario(usuario: UsuarioResponse): void {
    this.router.navigate(['/usuarios', usuario.id, 'editar']);
  }

  abrirCambiarPassword(usuario: UsuarioResponse): void {
    this.usuarioParaPassword.set(usuario);
  }

  cerrarPasswordDialog(): void {
    this.usuarioParaPassword.set(null);
  }

  guardarPassword(nuevaPassword: string): void {
    const usuario = this.usuarioParaPassword();
    if (!usuario) return;

    this.procesandoAccion.set(true);
    this.usuarioService.cambiarPassword(usuario.id, nuevaPassword).subscribe({
      next: () => {
        this.procesandoAccion.set(false);
        this.usuarioParaPassword.set(null);
        this.notifications.success('Contraseña actualizada correctamente.');
      },
      error: () => {
        this.procesandoAccion.set(false);
        this.notifications.error('No se pudo actualizar la contraseña.');
      },
    });
  }

  abrirConfirmacionEstado(usuario: UsuarioResponse): void {
    this.usuarioParaCambiarEstado.set(usuario);
  }

  cerrarConfirmacionEstado(): void {
    this.usuarioParaCambiarEstado.set(null);
  }

  confirmarCambioEstado(): void {
    const usuario = this.usuarioParaCambiarEstado();
    if (!usuario) return;

    const accion$ = usuario.activo
      ? this.usuarioService.desactivar(usuario.id)
      : this.usuarioService.activar(usuario.id);

    this.procesandoAccion.set(true);
    accion$.subscribe({
      next: () => {
        this.procesandoAccion.set(false);
        this.usuarioParaCambiarEstado.set(null);
        this.usuarios.update(lista =>
          lista.map(u => (u.id === usuario.id ? { ...u, activo: !usuario.activo } : u)),
        );
        this.notifications.success(
          usuario.activo ? 'Usuario desactivado correctamente.' : 'Usuario activado correctamente.',
        );
      },
      error: () => {
        this.procesandoAccion.set(false);
        this.notifications.error('No se pudo actualizar el estado del usuario.');
      },
    });
  }

  tituloConfirmacion(): string {
    const usuario = this.usuarioParaCambiarEstado();
    if (!usuario) return '';
    return usuario.activo ? '¿Desactivar usuario?' : '¿Activar usuario?';
  }

  mensajeConfirmacion(): string {
    const usuario = this.usuarioParaCambiarEstado();
    if (!usuario) return '';
    return usuario.activo
      ? `${usuario.nombre} no podrá iniciar sesión mientras esté desactivado.`
      : `${usuario.nombre} podrá iniciar sesión nuevamente.`;
  }

  areaBadgeClass(areaNombre: UsuarioResponse['areaNombre']): string {
    return `badge-area badge-area--${areaNombre.toLowerCase()}`;
  }

  areaLabel(areaNombre: UsuarioResponse['areaNombre']): string {
    const area = this.areas().find(a => a.nombre === areaNombre);
    return area?.descripcion ?? areaNombre;
  }

  trackByUsuarioId(_index: number, usuario: UsuarioResponse): number {
    return usuario.id;
  }
}