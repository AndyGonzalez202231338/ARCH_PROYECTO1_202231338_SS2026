import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DashboardHeader } from '../dashboard-header/dashboard-header';
import { DataTable, DataTableColumn } from '../../../shared/data-table/data-table';
import { AlertCard, AlertItem } from '../../../shared/alert-card/alert-card';
import { ChartCard, ChartSeries } from '../../../shared/chart-card/chart-card';
import { StatsCard } from '../../../shared/stats-card/stats-card';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, DashboardHeader, StatsCard,
    ChartCard, AlertCard, DataTable],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
    ventasComprasSeries: ChartSeries[] = [
    {
      name: 'Ventas', colorClass: 'stroke-erp-secondary',
      points: [
        { label: 'Ene', value: 55 }, { label: 'Feb', value: 62 }, { label: 'Mar', value: 58 },
        { label: 'Abr', value: 70 }, { label: 'May', value: 66 }, { label: 'Jun', value: 78 },
      ],
    },
    {
      name: 'Compras', colorClass: 'stroke-erp-primary',
      points: [
        { label: 'Ene', value: 40 }, { label: 'Feb', value: 45 }, { label: 'Mar', value: 50 },
        { label: 'Abr', value: 44 }, { label: 'May', value: 48 }, { label: 'Jun', value: 52 },
      ],
    },
  ];

  ventasColumns: DataTableColumn[] = [
    { key: 'numero', label: 'N.° Venta' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'total', label: 'Total', align: 'right' },
    {
      key: 'estado', label: 'Estado',
      badgeMap: {
        Completada: 'bg-erp-secondary/10 text-erp-secondary',
        Pendiente: 'bg-erp-warning/10 text-erp-warning',
        Cancelada: 'bg-erp-critical/10 text-erp-critical',
      },
    },
  ];

  ventasRows = [
    { numero: 'V-1042', cliente: 'Muebles del Valle', fecha: '05/09/2026', total: 'Q 4,250.00', estado: 'Completada' },
    { numero: 'V-1041', cliente: 'Oficinas Altiplano', fecha: '05/09/2026', total: 'Q 12,800.00', estado: 'Pendiente' },
    { numero: 'V-1040', cliente: 'Hogar Moderno S.A.', fecha: '04/09/2026', total: 'Q 2,100.00', estado: 'Completada' },
    { numero: 'V-1039', cliente: 'Distribuidora Solís', fecha: '04/09/2026', total: 'Q 780.00', estado: 'Cancelada' },
  ];

  alerts: AlertItem[] = [
    { type: 'critical', title: 'Producto agotado', description: 'Escritorio Ejecutivo L no tiene existencias.', time: 'Hace 1 hora' },
    { type: 'warning', title: 'Existencia baja', description: 'Silla Ejecutiva con solamente 3 unidades disponibles.', time: 'Hace 2 horas' },
    { type: 'info', title: 'Compra pendiente', description: 'Orden de compra #C-233 en espera de aprobación.', time: 'Hace 5 horas' },
    { type: 'success', title: 'Meta alcanzada', description: 'Ventas del mes superaron la meta trimestral.', time: 'Ayer' },
  ];
}
