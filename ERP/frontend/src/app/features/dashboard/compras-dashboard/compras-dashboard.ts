import { Component } from '@angular/core';
import { DataTable, DataTableColumn } from '../../../shared/data-table/data-table';
import { ChartCard, ChartSeries } from '../../../shared/chart-card/chart-card';
import { StatsCard } from '../../../shared/stats-card/stats-card';
import { CommonModule } from '@angular/common';
import { DashboardHeader } from '../dashboard-header/dashboard-header';

@Component({
  selector: 'app-compras-dashboard',
  imports: [CommonModule, DashboardHeader, StatsCard, ChartCard, DataTable],
  templateUrl: './compras-dashboard.html',
  styleUrl: './compras-dashboard.scss',
})
export class ComprasDashboard {
    comprasSeries: ChartSeries[] = [
    { name: 'Compras', colorClass: 'bg-erp-secondary',
      points: [{ label: 'S1', value: 45 }, { label: 'S2', value: 60 }, { label: 'S3', value: 38 }, { label: 'S4', value: 72 }] },
  ];

  proveedoresSeries: ChartSeries[] = [
    { name: 'Monto', colorClass: 'bg-erp-primary',
      points: [
        { label: 'MaderArte', value: 80 }, { label: 'Textiles GT', value: 55 },
        { label: 'Metalco', value: 65 }, { label: 'Ind. Solís', value: 40 },
      ] },
  ];

  comprasColumns: DataTableColumn[] = [
    { key: 'numero', label: 'N.° Compra' },
    { key: 'proveedor', label: 'Proveedor' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'productos', label: 'Productos' },
    { key: 'total', label: 'Total', align: 'right' },
    {
      key: 'estado', label: 'Estado',
      badgeMap: {
        Recibida: 'bg-erp-secondary/10 text-erp-secondary',
        'En tránsito': 'bg-erp-warning/10 text-erp-warning',
        Cancelada: 'bg-erp-critical/10 text-erp-critical',
      },
    },
  ];

  comprasRows = [
    { numero: 'C-233', proveedor: 'MaderArte', fecha: '05/09/2026', productos: '12', total: 'Q 8,400.00', estado: 'En tránsito' },
    { numero: 'C-232', proveedor: 'Metalco', fecha: '04/09/2026', productos: '6', total: 'Q 3,120.00', estado: 'Recibida' },
    { numero: 'C-231', proveedor: 'Textiles GT', fecha: '02/09/2026', productos: '20', total: 'Q 5,900.00', estado: 'Recibida' },
    { numero: 'C-230', proveedor: 'Ind. Solís', fecha: '30/08/2026', productos: '4', total: 'Q 1,050.00', estado: 'Cancelada' },
  ];

  productosFrecuentes = [
    { nombre: 'Tablero MDF 18mm', cantidad: '320 u.' },
    { nombre: 'Tela tapicería gris', cantidad: '210 u.' },
    { nombre: 'Herraje riel silla', cantidad: '180 u.' },
    { nombre: 'Espuma alta densidad', cantidad: '150 u.' },
  ];
}
