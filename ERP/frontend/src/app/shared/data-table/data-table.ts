import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface DataTableColumn {
  key: string;
  label: string;
  badgeMap?: Record<string, string>;
  align?: 'left' | 'right' | 'center';
}

@Component({
  selector: 'app-data-table',
  imports: [CommonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) columns!: DataTableColumn[];
  @Input({ required: true }) rows!: Record<string, string>[];
  @Input() showViewAll = true;
}
