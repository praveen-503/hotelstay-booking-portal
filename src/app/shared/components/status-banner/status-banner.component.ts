import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-banner',
  template: `
    @if (message()) {
      <div class="status-banner" [class.status-banner--error]="type() === 'error'">
        {{ message() }}
      </div>
    }
  `,
  styleUrl: './status-banner.component.scss'
})
export class StatusBannerComponent {
  readonly message = input<string | null>(null);
  readonly type = input<'info' | 'error'>('info');
}
