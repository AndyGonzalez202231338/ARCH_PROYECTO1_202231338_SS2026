import { Component, Input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';
import { CommonModule } from '@angular/common';

export interface ActivityItem {
  icon: IconName;
  user: string;
  action: string;
  module: string;
  time: string;
}

@Component({
  selector: 'app-recent-activity',
  imports: [CommonModule, Icon],
  templateUrl: './recent-activity.html',
  styleUrl: './recent-activity.scss',
})
export class RecentActivity {
  @Input({ required: true }) items!: ActivityItem[];
}
