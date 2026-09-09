import { Component, inject } from '@angular/core';
import { Icon } from '../icon/icon';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  imports: [Icon],
  templateUrl: './placeholder-page.html',
  styleUrl: './placeholder-page.scss',
})
export class PlaceholderPage {
  private readonly route = inject(ActivatedRoute);
  title = this.route.snapshot.data['title'] ?? 'Sección';
}
