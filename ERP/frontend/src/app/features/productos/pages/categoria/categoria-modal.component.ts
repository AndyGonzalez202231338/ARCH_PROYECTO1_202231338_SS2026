import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CategoriaService } from "../../services/categoria.service";
import { NotificationService } from "../../../../core/services/notification.service";
import { CategoriaRequest, CategoriaResponse } from "../../models/categoria.model";

@Component({
  selector: 'app-categoria-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categoria-modal.html',
  styleUrl: './categoria-modal.scss',
})
export class CategoriaModal {
  private readonly fb = inject(FormBuilder);
  private readonly categoriaService = inject(CategoriaService);
  private readonly notifications = inject(NotificationService);

  @Output() cerrado = new EventEmitter<void>();
  @Output() cambio = new EventEmitter<void>();

  readonly categorias = signal<CategoriaResponse[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly editandoId = signal<number | null>(null);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    descripcion: ['', [Validators.maxLength(255)]],
  });

  constructor() { this.cargar(); }

  private cargar(): void {
    this.cargando.set(true);
    this.categoriaService.listar().subscribe({
      next: data => { this.categorias.set(data); this.cargando.set(false); },
      error: () => { this.cargando.set(false); this.notifications.error('No se pudieron cargar las categorías.'); }
    });
  }

  nueva(): void {
    this.editandoId.set(null);
    this.form.reset({ nombre: '', descripcion: '' });
  }

  editar(c: CategoriaResponse): void {
    this.editandoId.set(c.id);
    this.form.patchValue({ nombre: c.nombre, descripcion: c.descripcion });
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const req = this.form.getRawValue() as CategoriaRequest;
    this.guardando.set(true);

    const id = this.editandoId();
    const op = id ? this.categoriaService.actualizar(id, req)
                  : this.categoriaService.crear(req);

    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.notifications.success(id ? 'Categoría actualizada' : 'Categoría creada');
        this.form.reset({ nombre: '', descripcion: '' });
        this.editandoId.set(null);
        this.cargar();
        this.cambio.emit();
      },
      error: err => {
        this.guardando.set(false);
        if (err.status === 409) this.notifications.error('Ya existe una categoría con ese nombre.');
        else this.notifications.error('No se pudo guardar la categoría.');
      }
    });
  }

  cerrar(): void { this.cerrado.emit(); }
}