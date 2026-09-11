import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type IconName =
  | 'home' | 'cube' | 'truck' | 'shopping-cart' | 'archive-box'
  | 'users' | 'chart-bar' | 'document-chart-bar' | 'list-bullet'
  | 'bell' | 'chevron-down' | 'bars-3' | 'x-mark'
  | 'arrow-trending-up' | 'arrow-trending-down'
  | 'exclamation-triangle' | 'check-circle' | 'information-circle'
  | 'cog-6-tooth' | 'arrow-right-on-rectangle' | 'user-circle'
  | 'clipboard-document-list' | 'arrow-path' | 'calendar-days'
  | 'ellipsis-horizontal';

@Component({
  selector: 'app-icon',
  imports: [CommonModule],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
  host: {
    '[class]': 'class',
    'class': 'inline-flex items-center justify-center shrink-0',
  },
})
export class Icon {
  @Input({ required: true }) name!: IconName;
  @Input() class = 'w-5 h-5';
}
