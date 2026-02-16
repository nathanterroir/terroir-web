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
            <span class="limited-badge">Limited Availability</span>
            <h2>2026 Pilot Program — 20 Farms Only</h2>
            <p>Early access to Precision Labor Intelligence. Limited spots for the 2026 season.</p>
            <div class="cta-actions">
              <button class="btn btn-white" (click)="onReserveSpot()">Reserve Your Spot</button>
              <a routerLink="/contact" class="btn btn-ghost" (click)="onContact()">Questions? Talk to Us</a>
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
    .limited-badge {
      display: inline-block;
      padding: 0.3rem 1rem;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 9999px;
      color: var(--brand-200);
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 1rem;
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

  onReserveSpot(): void {
    this.analytics.trackCtaClick('cta_reserve_spot');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onContact(): void {
    this.analytics.trackCtaClick('cta_questions');
  }
}
