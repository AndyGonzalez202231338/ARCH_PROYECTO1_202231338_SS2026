import { Component } from '@angular/core';
import { DashboardHeader } from '../dashboard-header/dashboard-header';
import { CommonModule } from '@angular/common';
import { StatsCard } from '../../../shared/stats-card/stats-card';
import { DataTable, DataTableColumn } from '../../../shared/data-table/data-table';
import { ChartCard, ChartSeries } from '../../../shared/chart-card/chart-card';

@Component({
  selector: 'app-ventas-dashboard',
  imports: [CommonModule, DashboardHeader, StatsCard, ChartCard, DataTable],
  templateUrl: './ventas-dashboard.html',
  styleUrl: './ventas-dashboard.scss',
})
export class VentasDashboard {
    ventasSeries: ChartSeries[] = [
    { name: 'Ventas', colorClass: 'stroke-erp-secondary',
      points: [
        { label: 'Ene', value: 50 }, { label: 'Feb', value: 58 }, { label: 'Mar', value: 62 },
        { label: 'Abr', value: 70 }, { label: 'May', value: 65 }, { label: 'Jun', value: 80 },
      ] },
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
  ];

  topProductos = [
    { nombre: 'Escritorio Ejecutivo L', cantidad: '58 u.' },
    { nombre: 'Silla Ejecutiva', cantidad: '47 u.' },
    { nombre: 'Sofá 3 plazas gris', cantidad: '31 u.' },
    { nombre: 'Mesa de reuniones 6p', cantidad: '22 u.' },
  ];

  clientesColumns: DataTableColumn[] = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'compras', label: 'Cantidad de compras', align: 'right' },
    { key: 'monto', label: 'Monto acumulado', align: 'right' },
  ];

  clientesRows = [
    { cliente: 'Oficinas Altiplano', compras: '14', monto: 'Q 48,200.00' },
    { cliente: 'Corporativo Xelajú', compras: '11', monto: 'Q 36,540.00' },
    { cliente: 'Muebles del Valle', compras: '9', monto: 'Q 22,100.00' },
  ];

}
