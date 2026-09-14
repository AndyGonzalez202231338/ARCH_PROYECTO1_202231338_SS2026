import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ConfirmDialogVariant = 'danger' | 'success' | 'warning';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  @Input() open = false;
  @Input() titulo = '¿Confirmar acción?';
  @Input() mensaje = '';
  @Input() textoCancelar = 'Cancelar';
  @Input() textoConfirmar = 'Confirmar';
  @Input() variante: ConfirmDialogVariant = 'danger';

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  onOverlayClick(): void {
    this.cancelar.emit();
  }
}
