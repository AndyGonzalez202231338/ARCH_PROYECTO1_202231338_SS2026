import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  submit(): void {
    this.errorMessage = '';
    this.loading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        void this.router.navigateByUrl('/dashboard');
      },
      error: (error: { status?: number }) => {
        this.loading = false;
        this.errorMessage = error.status === 401
          ? 'El correo o la contraseña no son correctos.'
          : 'No fue posible conectar con el servidor.';
      }
    });
  }
}