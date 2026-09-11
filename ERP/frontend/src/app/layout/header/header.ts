import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { AuthService } from '../../core/services/auth.service';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Icon],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Input() email = '';
  @Input() role = '';
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  userMenuOpen = false;

  get initials(): string {
    return this.email ? this.email.slice(0, 2).toUpperCase() : '??';
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
