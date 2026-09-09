import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly user = this.auth.currentUser;
  message = '';
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.http.get<string>('http://localhost:8080/api/usuarios/me').subscribe({
      next: (response) => { this.message = response; this.loading = false; },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No fue posible cargar el usuario autenticado.';
      }
    });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}