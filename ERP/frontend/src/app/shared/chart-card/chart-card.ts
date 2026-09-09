import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

export interface ChartSeriesPoint {
  label: string;
  value: number; // normalizado 0-100
}

export interface ChartSeries {
  name: string;
  colorClass: string; // 'bg-erp-secondary' (barras) o 'stroke-erp-secondary' (líneas)
  points: ChartSeriesPoint[];
}

@Component({
  selector: 'app-chart-card',
  imports: [CommonModule],
  templateUrl: './chart-card.html',
  styleUrl: './chart-card.scss',
})
export class ChartCard implements OnInit {
  @Input({ required: true }) title!: string;
  @Input() description = '';
  @Input() type: 'bar' | 'line' = 'bar';
  @Input({ required: true }) series!: ChartSeries[];
  @Input() periods: string[] = [];
  activePeriod = '';

  ngOnInit(): void {
    this.activePeriod = this.periods[0] ?? '';
  }

  pointFor(series: ChartSeries, label: string): number {
    return series.points.find(p => p.label === label)?.value ?? 0;
  }

  toPolyline(series: ChartSeries): string {
    const step = 300 / Math.max(series.points.length - 1, 1);
    return series.points.map((p, i) => `${i * step},${100 - p.value}`).join(' ');
  }

  legendDot(colorClass: string): string {
    return colorClass.replace('stroke-', 'bg-');
  }
}
