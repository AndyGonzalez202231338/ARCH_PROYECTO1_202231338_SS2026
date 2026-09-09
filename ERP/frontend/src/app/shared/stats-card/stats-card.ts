import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

export type TrendDirection = 'up' | 'down' | 'none';

@Component({
  selector: 'app-stats-card',
  imports: [CommonModule, Icon],
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.scss',
})
export class StatsCard {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string;
  @Input() subtitle = '';
  @Input({ required: true }) icon!: IconName;
  @Input() trend: TrendDirection = 'none';
  @Input() trendValue = '';
}
