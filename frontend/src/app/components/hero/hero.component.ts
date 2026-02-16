import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PilotSignupComponent } from '@app/components/pilot-signup/pilot-signup.component';
import { AnalyticsService } from '@app/services/analytics.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, PilotSignupComponent],
  template: `
    <section class="hero">
      <div class="hero-bg">
        <img
          src="https://images.unsplash.com/photo-1533038590840-1cde6e668a91?q=80&w=2000&auto=format&fit=crop"
          alt="Sunlit crop rows stretching to the horizon — precision agriculture by Terroir AI"
          loading="eager"
          fetchpriority="high"
          width="2000"
          height="1333"
        />
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-content container">
        <span class="badge">Precision Labor Intelligence</span>
        <h1>Right crew. Right block.<br/>Right time.</h1>
        <p class="subtitle">
          iPhone-based computer vision that turns a single drive through your rows
          into a labor deployment plan — crew sizes, spray priorities, harvest logistics — before you leave the field.
        </p>
        <div class="hero-actions">
          <button class="btn btn-white" (click)="onPilotCta()">Apply for the 2026 Pilot</button>
          <a routerLink="/" fragment="how-it-works" class="btn btn-ghost">See How It Works</a>
        </div>
        <div class="trust-bar">
          <span>On-device AI</span>
          <strong>&bull;</strong>
          <span>No cloud uploads</span>
          <strong>&bull;</strong>
          <span>Works offline</span>
          <strong>&bull;</strong>
          <span>Sub-inch GPS</span>
        </div>

        @if (showForm()) {
          <app-pilot-signup />
        }
      </div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      min-height: 92vh;
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
    }
    .hero-bg img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        160deg,
        rgba(13, 37, 19, 0.85) 0%,
        rgba(26, 69, 36, 0.7) 50%,
        rgba(26, 69, 36, 0.5) 100%
      );
    }
    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 720px;
      padding-top: 4rem;
      padding-bottom: 4rem;
    }
    .badge {
      display: inline-block;
      padding: 0.35rem 1rem;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 9999px;
      color: var(--brand-200);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 1.5rem;
      animation: fade-up 0.6s ease-out;
    }
    h1 {
      font-size: clamp(2.5rem, 6vw, 4.25rem);
      color: white;
      margin-bottom: 1.25rem;
      line-height: 1.08;
      animation: fade-up 0.7s ease-out 0.1s both;
    }
    .subtitle {
      font-family: var(--font-serif);
      font-size: clamp(1rem, 2vw, 1.2rem);
      color: rgba(255,255,255,0.8);
      line-height: 1.7;
      max-width: 560px;
      margin-bottom: 2rem;
      animation: fade-up 0.7s ease-out 0.2s both;
    }
    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 3rem;
      animation: fade-up 0.7s ease-out 0.3s both;
    }
    .trust-bar {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.5);
      animation: fade-up 0.7s ease-out 0.4s both;
    }
    .trust-bar strong {
      color: var(--brand-300);
    }
  `],
})
export class HeroComponent {
  private readonly analytics = inject(AnalyticsService);
  showForm = signal(false);

  onPilotCta(): void {
    this.analytics.trackCtaClick('hero_pilot_cta');
    this.showForm.set(true);
    setTimeout(() => {
      document.getElementById('pilot-signup')?.scrollIntoView({
        behavior: 'smooth', block: 'center'
      });
    }, 50);
  }
}
