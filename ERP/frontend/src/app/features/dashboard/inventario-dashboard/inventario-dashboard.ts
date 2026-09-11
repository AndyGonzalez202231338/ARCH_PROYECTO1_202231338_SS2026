import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DashboardHeader } from '../dashboard-header/dashboard-header';
import { StatsCard } from '../../../shared/stats-card/stats-card';
import { ChartCard, ChartSeries } from '../../../shared/chart-card/chart-card';
import { DataTable, DataTableColumn } from '../../../shared/data-table/data-table';
import { AlertCard, AlertItem } from '../../../shared/alert-card/alert-card';
import { ActivityItem, RecentActivity } from '../../../shared/recent-activity/recent-activity';

@Component({
  selector: 'app-inventario-dashboard',
  imports: [CommonModule, DashboardHeader, StatsCard, ChartCard,
    DataTable, AlertCard, RecentActivity],
  templateUrl: './inventario-dashboard.html',
  styleUrl: './inventario-dashboard.scss',
})
export class InventarioDashboard {
    movimientosSeries: ChartSeries[] = [
    { name: 'Entradas', colorClass: 'bg-erp-secondary',
      points: [
        { label: 'Lun', value: 40 }, { label: 'Mar', value: 55 }, { label: 'Mié', value: 30 },
        { label: 'Jue', value: 65 }, { label: 'Vie', value: 48 },
      ] },
    { name: 'Salidas', colorClass: 'bg-erp-critical',
      points: [
        { label: 'Lun', value: 30 }, { label: 'Mar', value: 42 }, { label: 'Mié', value: 50 },
        { label: 'Jue', value: 38 }, { label: 'Vie', value: 60 },
      ] },
  ];

  columns: DataTableColumn[] = [
    { key: 'producto', label: 'Producto' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'existencia', label: 'Existencia actual', align: 'right' },
    {
      key: 'estado', label: 'Estado',
      badgeMap: {
        Disponible: 'bg-erp-secondary/10 text-erp-secondary',
        'Existencia baja': 'bg-erp-warning/10 text-erp-warning',
        Agotado: 'bg-erp-critical/10 text-erp-critical',
      },
    },
  ];

  rows = [
    { producto: 'Silla Ejecutiva', categoria: 'Sillas', existencia: '3', estado: 'Existencia baja' },
    { producto: 'Escritorio Ejecutivo L', categoria: 'Escritorios', existencia: '0', estado: 'Agotado' },
    { producto: 'Mesa de reuniones 6p', categoria: 'Mesas', existencia: '5', estado: 'Existencia baja' },
    { producto: 'Estantería modular', categoria: 'Estanterías', existencia: '2', estado: 'Existencia baja' },
    { producto: 'Sofá 3 plazas gris', categoria: 'Sofás', existencia: '18', estado: 'Disponible' },
  ];

  alerts: AlertItem[] = [
    { type: 'warning', title: 'Silla Ejecutiva con existencia baja', description: 'Solamente 3 unidades disponibles.', time: 'Hace 2 horas' },
    { type: 'critical', title: 'Escritorio sin existencias', description: 'Escritorio Ejecutivo L agotado.', time: 'Hace 4 horas' },
    { type: 'warning', title: 'Producto próximo a agotarse', description: 'Estantería modular con 2 unidades.', time: 'Hace 6 horas' },
  ];

  actividad: ActivityItem[] = [
    { icon: 'shopping-cart', user: 'Sistema', action: 'registró una entrada por compra', module: 'Inventario', time: 'Hace 30 min' },
    { icon: 'chart-bar', user: 'Ventas', action: 'generó una salida por venta', module: 'Inventario', time: 'Hace 1 hora' },
    { icon: 'cube', user: 'Andy', action: 'actualizó los datos de un producto', module: 'Productos', time: 'Hace 3 horas' },
  ];
}
