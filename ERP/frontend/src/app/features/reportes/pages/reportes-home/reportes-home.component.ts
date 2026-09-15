import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import {
  CATEGORIAS,
  CategoriaConfig,
  CategoriaReporte,
  REPORTES_DISPONIBLES,
  ReporteConfig,
} from '../../models/reporte.model';

interface SeccionReportes {
  categoria: CategoriaConfig;
  reportes: ReporteConfig[];
}

@Component({
  selector: 'app-reportes-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes-home.component.html',
  styleUrls: ['./reportes-home.component.scss'],
})
export class ReportesHomeComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly reportesVisibles = computed(() => {
    const rol = this.auth.getRole();
    return REPORTES_DISPONIBLES.filter(r => r.roles.includes(rol as any));
  });

  readonly secciones = computed<SeccionReportes[]>(() => {
    const visibles = this.reportesVisibles();
    return CATEGORIAS
      .map(cat => ({
        categoria: cat,
        reportes: visibles.filter(r => r.categoria === cat.id),
      }))
      .filter(s => s.reportes.length > 0);
  });

  readonly sinReportes = computed(() => this.reportesVisibles().length === 0);

  abrirReporte(tipo: string): void {
    this.router.navigate(['/reportes', tipo]);
  }
}