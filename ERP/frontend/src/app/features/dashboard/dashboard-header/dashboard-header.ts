import { Component, inject, Input } from '@angular/core';
import { Icon } from '../../../shared/icon/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-header',
  imports: [CommonModule, Icon],
  templateUrl: './dashboard-header.html',
  styleUrl: './dashboard-header.scss',
})
export class DashboardHeader {
  @Input() eyebrow = 'Panel principal';
  private readonly auth = inject(AuthService);
  readonly user = this.auth.currentUser;
}
