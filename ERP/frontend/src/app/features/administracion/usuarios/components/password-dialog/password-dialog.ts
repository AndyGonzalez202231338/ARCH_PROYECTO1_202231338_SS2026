import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { UsuarioResponse } from '../../models/usuario.model';

function passwordsCoincidenValidator(control: AbstractControl): ValidationErrors | null {
  const nueva = control.get('nuevaPassword')?.value;
  const confirmacion = control.get('confirmarPassword')?.value;
  return nueva && confirmacion && nueva !== confirmacion ? { noCoincide: true } : null;
}

@Component({
  selector: 'app-password-dialog',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-dialog.html',
  styleUrl: './password-dialog.scss',
})
export class PasswordDialog {
  private readonly fb = inject(FormBuilder);

  @Input() usuario: UsuarioResponse | null = null;
  @Input() guardando = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<string>();

  readonly form = this.fb.group(
    {
      nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required, Validators.minLength(6)]],
    },
    { validators: passwordsCoincidenValidator },
  );

  get invalido(): boolean {
    return this.form.invalid;
  }

  campoInvalido(campo: 'nuevaPassword' | 'confirmarPassword'): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  noCoinciden(): boolean {
    const confirmar = this.form.get('confirmarPassword');
    return this.form.hasError('noCoincide') && !!confirmar && (confirmar.dirty || confirmar.touched);
  }

  onCerrar(): void {
    this.form.reset();
    this.cerrar.emit();
  }

  onGuardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardar.emit(this.form.value.nuevaPassword as string);
  }
}
