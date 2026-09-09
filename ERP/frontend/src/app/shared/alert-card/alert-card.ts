import { Component, Input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';
import { CommonModule } from '@angular/common';

export type AlertType = 'info' | 'warning' | 'critical' | 'success';

export interface AlertItem {
  type: AlertType;
  title: string;
  description: string;
  time: string;
}

const TYPE_CONFIG: Record<AlertType, { icon: IconName; classes: string }> = {
  info: { icon: 'information-circle', classes: 'bg-erp-secondary/10 text-erp-secondary' },
  warning: { icon: 'exclamation-triangle', classes: 'bg-erp-warning/10 text-erp-warning' },
  critical: { icon: 'exclamation-triangle', classes: 'bg-erp-critical/10 text-erp-critical' },
  success: { icon: 'check-circle', classes: 'bg-erp-secondary/10 text-erp-secondary' },
};

@Component({
  selector: 'app-alert-card',
  imports: [CommonModule, Icon],
  templateUrl: './alert-card.html',
  styleUrl: './alert-card.scss',
})
export class AlertCard {
  @Input() title = 'Alertas importantes';
  @Input({ required: true }) alerts!: AlertItem[];

  config(type: AlertType) {
    return TYPE_CONFIG[type];
  }

}
