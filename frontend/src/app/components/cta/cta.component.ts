import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '@app/services/analytics.service';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section cta">
      <div class="container">
        <div class="cta-card">
          <div class="cta-content">
            <h2>Ready to see your orchard in high definition?</h2>
            <p>Start your free trial of the Field Fitness Tracker today.</p>
            <div class="cta-actions">
              <a href="#" class="btn btn-white" (click)="onDownload($event)">Download for iOS</a>
              <a routerLink="/contact" class="btn btn-ghost" (click)="onContact()">Contact Sales</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .cta { background: var(--stone-50); }
    .cta-card {
      background: var(--brand-900);
      border-radius: 24px;
      padding: 4rem 2rem;
      text-align: center;
    }
    .cta-content h2 {
      color: white;
      font-size: clamp(1.5rem, 3vw, 2rem);
      margin-bottom: 0.5rem;
    }
    .cta-content p {
      color: var(--brand-200);
      margin-bottom: 2rem;
      font-size: 1rem;
    }
    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
  `],
})
export class CtaComponent {
  private readonly analytics = inject(AnalyticsService);

  onDownload(e: Event): void {
    e.preventDefault();
    this.analytics.trackDownloadClick();
  }

  onContact(): void {
    this.analytics.trackCtaClick('cta_contact_sales');
  }
}
