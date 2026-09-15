import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmDialog } from '../../../../shared/confirm-dialog/confirm-dialog';
import { Toast } from '../../../../core/models/toast/toast';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClienteService } from '../../services/cliente.service';
import { ClienteResponse } from '../../models/cliente.model';
import { mensajeDeError } from '../../../ventas/services/api-error.util';


type EstadoFiltro = 'todos' | 'activos' | 'inactivos';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-cliente-lista',
  imports: [CommonModule, Toast, ConfirmDialog],
  templateUrl: './cliente-lista.html',
  styleUrl: './cliente-lista.scss',
})
export class ClienteLista {
  private readonly clienteService = inject(ClienteService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  /**
   * Wrapper sobre getRole(). Se usa una arrow function en lugar de tomar
   * una signal del AuthService para no depender del orden de
   * inicialización de campos del servicio.
   */
  readonly role = () => this.auth.getRole();

  readonly puedeCrear = computed(() => this.role() === 'VENTAS');
  readonly puedeEditar = computed(() => this.role() === 'VENTAS');
  readonly puedeActivar = computed(() => this.role() === 'ADMINISTRACION');

  readonly subtitulo = computed(() =>
    this.puedeCrear() ? 'Administra los clientes del sistema' : 'Consulta los clientes del sistema',
  );

  readonly clientes = signal<ClienteResponse[]>([]);
  readonly loading = signal(true);
  readonly errorCarga = signal<string | null>(null);
  readonly currentPage = signal(1);

  readonly texto = signal('');
  readonly estadoFilter = signal<EstadoFiltro>('todos');

  /** Cliente sobre el que se va a confirmar activar/desactivar. */
  readonly clienteParaEstado = signal<ClienteResponse | null>(null);
  readonly procesandoAccion = signal(false);

  readonly hasFiltros = computed(
    () => this.texto().trim() !== '' || this.estadoFilter() !== 'todos',
  );

  readonly totalClientes = computed(() => this.clientes().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalClientes() / PAGE_SIZE)));

  readonly paginatedClientes = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.clientes().slice(start, start + PAGE_SIZE);
  });

  readonly rangoMostrado = computed(() => {
    if (this.totalClientes() === 0) return { desde: 0, hasta: 0 };
    const desde = (this.currentPage() - 1) * PAGE_SIZE + 1;
    const hasta = Math.min(this.currentPage() * PAGE_SIZE, this.totalClientes());
    return { desde, hasta };
  });

  readonly paginasVisibles = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1).slice(0, 3),
  );

  constructor() {
    const rol = this.role();
    if (rol !== 'VENTAS' && rol !== 'ADMINISTRACION') {
      this.notifications.error('No tienes permisos');
      this.router.navigate(['/dashboard']);
      return;
    }

    effect(() => {
      const texto = this.texto();
      const estado = this.estadoFilter();
      this.cargarClientes(texto, estado);
    });
  }

  private cargarClientes(texto: string, estado: EstadoFiltro): void {
    this.loading.set(true);
    this.errorCarga.set(null);

    const activo = estado === 'todos' ? undefined : estado === 'activos';

    this.clienteService.listar({ texto: texto.trim() || undefined, activo }).subscribe({
      next: data => {
        this.clientes.set(data);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.clientes.set([]);

        if (err.status === 403) {
          this.notifications.error('No tienes permisos');
          this.router.navigate(['/dashboard']);
          return;
        }

        const mensaje = mensajeDeError(err, 'No se pudo cargar la lista de clientes.');
        this.errorCarga.set(mensaje);
        this.notifications.error(mensaje);
      },
    });
  }

  onTextoChange(valor: string): void {
    this.texto.set(valor);
  }

  onEstadoChange(valor: string): void {
    this.estadoFilter.set(valor as EstadoFiltro);
  }

  limpiarFiltros(): void {
    this.texto.set('');
    this.estadoFilter.set('todos');
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages()) return;
    this.currentPage.set(pagina);
  }

  nuevoCliente(): void {
    this.router.navigate(['/clientes', 'nuevo']);
  }

  verDetalle(cliente: ClienteResponse): void {
    this.router.navigate(['/clientes', cliente.id]);
  }

  editarCliente(cliente: ClienteResponse): void {
    this.router.navigate(['/clientes', cliente.id, 'editar']);
  }

  abrirCambioEstado(cliente: ClienteResponse): void {
    this.clienteParaEstado.set(cliente);
  }

  cerrarCambioEstado(): void {
    this.clienteParaEstado.set(null);
  }

  confirmarCambioEstado(): void {
    const cliente = this.clienteParaEstado();
    if (!cliente) return;

    const desactivar = cliente.activo;
    this.procesandoAccion.set(true);

    const peticion = desactivar
      ? this.clienteService.desactivar(cliente.id)
      : this.clienteService.activar(cliente.id);

    peticion.subscribe({
      next: () => {
        this.procesandoAccion.set(false);
        this.clienteParaEstado.set(null);
        this.clientes.update(lista =>
          lista.map(c => (c.id === cliente.id ? { ...c, activo: !desactivar } : c)),
        );
        this.notifications.success(
          desactivar ? 'Cliente desactivado.' : 'Cliente activado.',
        );
      },
      error: (err: HttpErrorResponse) => {
        this.procesandoAccion.set(false);
        if (err.status === 403) {
          this.notifications.error('No tienes permisos');
          return;
        }
        this.notifications.error(
          mensajeDeError(err, 'No se pudo actualizar el estado del cliente.'),
        );
      },
    });
  }

  tituloConfirmacion(): string {
    return this.clienteParaEstado()?.activo ? '¿Desactivar este cliente?' : '¿Activar este cliente?';
  }

  mensajeConfirmacion(): string {
    const cliente = this.clienteParaEstado();
    if (!cliente) return '';
    return cliente.activo
      ? `${cliente.nombre} dejará de aparecer en el registro de nuevas ventas.`
      : `${cliente.nombre} volverá a estar disponible para registrar ventas.`;
  }

  estadoBadgeClass(activo: boolean): string {
    return `badge-estado badge-estado--${activo ? 'activo' : 'inactivo'}`;
  }
}
