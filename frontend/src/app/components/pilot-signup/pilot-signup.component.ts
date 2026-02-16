import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@app/services/api.service';
import { AnalyticsService } from '@app/services/analytics.service';

@Component({
  selector: 'app-pilot-signup',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="pilot-card" id="pilot-signup">
      @if (submitted()) {
        <div class="success animate-fade-up">
          <div class="success-icon">&#10003;</div>
          <h3>You're on the list!</h3>
          <p>We're selecting 20 farms for the 2026 pilot. We'll reach out within 48 hours.</p>
          <div class="share-prompt">
            <p class="share-text">Know another grower who'd benefit?</p>
            <div class="share-actions">
              <button class="btn-outline" (click)="onShare('email')">Share via Email</button>
              <button class="btn-outline" (click)="onShare('copy')">
                {{ copied() ? 'Copied!' : 'Copy Link' }}
              </button>
            </div>
          </div>
        </div>
      } @else {
        <form (ngSubmit)="onSubmit()" class="form">
          <div class="form-header">
            <span class="pilot-badge">2026 Pilot Program</span>
            <h3>Apply for early access</h3>
            <p>20 farms. Free for pilot participants. No commitment.</p>
          </div>
          <div class="field-row">
            <div class="field">
              <input id="pilot-email" type="email" [(ngModel)]="email"
                     name="email" required placeholder="you&#64;farm.com"
                     aria-label="Email address" />
            </div>
            <div class="field">
              <input id="pilot-name" type="text" [(ngModel)]="name"
                     name="name" required placeholder="Your name"
                     aria-label="Your name" />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <input id="pilot-company" type="text" [(ngModel)]="company"
                     name="company" placeholder="Farm or company name"
                     aria-label="Farm or company name" />
            </div>
            <div class="field">
              <input id="pilot-acreage" type="text" [(ngModel)]="acreage"
                     name="acreage" placeholder="Approx. acreage"
                     aria-label="Approximate acreage" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-full" [disabled]="loading()">
            @if (loading()) { Submitting... } @else { Reserve My Spot }
          </button>
          @if (error()) {
            <p class="error-msg" aria-live="polite">{{ error() }}</p>
          }
          <p class="fine-print">No credit card. No commitment. We'll reach out to schedule onboarding.</p>
        </form>
      }
    </div>
  `,
  styles: [`
    .pilot-card {
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 16px;
      padding: 2rem;
      margin-top: 2rem;
      max-width: 560px;
    }
    .form { display: flex; flex-direction: column; gap: 1rem; }
    .form-header { margin-bottom: 0.5rem; }
    .pilot-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: var(--brand-500);
      color: white;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.5rem;
    }
    .form-header h3 {
      color: white;
      font-size: 1.25rem;
      margin-bottom: 0.25rem;
    }
    .form-header p {
      color: rgba(255,255,255,0.6);
      font-size: 0.85rem;
    }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .field { display: flex; flex-direction: column; }
    input {
      font-family: var(--font-sans);
      padding: 0.65rem 0.85rem;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      font-size: 0.9rem;
      background: rgba(255,255,255,0.1);
      color: white;
      outline: none;
      transition: border-color 0.2s;
    }
    input::placeholder { color: rgba(255,255,255,0.4); }
    input:focus {
      border-color: var(--brand-400);
      box-shadow: 0 0 0 3px rgba(57, 166, 71, 0.2);
    }
    .btn-full { width: 100%; }
    .fine-print {
      color: rgba(255,255,255,0.4);
      font-size: 0.75rem;
      text-align: center;
    }
    .success {
      text-align: center;
      padding: 1rem;
    }
    .success-icon {
      width: 56px;
      height: 56px;
      background: var(--brand-500);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 auto 1rem;
    }
    .success h3 { color: white; font-size: 1.25rem; margin-bottom: 0.25rem; }
    .success p { color: rgba(255,255,255,0.7); font-size: 0.9rem; }
    .share-prompt { margin-top: 1.5rem; }
    .share-text {
      color: rgba(255,255,255,0.5);
      font-size: 0.8rem;
      margin-bottom: 0.75rem;
    }
    .share-actions { display: flex; gap: 0.75rem; justify-content: center; }
    .btn-outline {
      padding: 0.5rem 1rem;
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 8px;
      background: transparent;
      color: white;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-outline:hover { background: rgba(255,255,255,0.1); }
    .error-msg { color: #fca5a5; font-size: 0.85rem; text-align: center; }
    @media (max-width: 640px) {
      .field-row { grid-template-columns: 1fr; }
    }
  `],
})
export class PilotSignupComponent {
  private readonly api = inject(ApiService);
  private readonly analytics = inject(AnalyticsService);

  email = '';
  name = '';
  company = '';
  acreage = '';

  loading = signal(false);
  submitted = signal(false);
  error = signal('');
  copied = signal(false);

  onSubmit() {
    this.loading.set(true);
    this.error.set('');

    this.api.joinWaitlist({
      email: this.email,
      name: this.name || undefined,
      company: this.company || undefined,
      interest: 'pilot_2026',
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
        this.analytics.trackEvent(
          'pilot_signup', 'activation', 'pilot_2026', undefined,
          { acreage: this.acreage || null, company: this.company || null }
        );
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Something went wrong. Please try again.');
      },
    });
  }

  onShare(method: string) {
    this.analytics.trackShare(method);
    if (method === 'copy') {
      navigator.clipboard?.writeText('https://terroirai.com?utm_source=referral&utm_medium=pilot_share&utm_campaign=pilot_2026');
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } else if (method === 'email') {
      const subject = encodeURIComponent('Check out Terroir AI — Precision Labor Intelligence');
      const body = encodeURIComponent(
        'I just signed up for their 2026 pilot program for precision labor intelligence. Thought you might be interested:\nhttps://terroirai.com?utm_source=referral&utm_medium=pilot_share&utm_campaign=pilot_2026'
      );
      window.open(`mailto:?subject=${subject}&body=${body}`);
    }
  }
}
