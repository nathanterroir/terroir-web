import { Component } from '@angular/core';

@Component({
  selector: 'app-features',
  standalone: true,
  template: `
    <section id="how-it-works" class="section features">
      <div class="container">
        <div class="section-header">
          <span class="eyebrow">How It Works</span>
          <h2>Mount. Drive. Deploy.</h2>
          <p>Three steps from raw field to labor deployment plan — no drones, no satellites, no waiting.</p>
        </div>

        <div class="feature-grid stagger">
          <div class="feature-card">
            <div class="feature-num">01</div>
            <h3>Mount Your iPhone</h3>
            <p>Attach one or more iPhones to your ATV, tractor, or truck. Our app activates automatically.</p>
          </div>
          <div class="feature-card">
            <div class="feature-num">02</div>
            <h3>Drive Your Rows</h3>
            <p>The app captures 30+ frames per second, applying real-time segmentation masks to every fruit it sees. GPS tags each frame automatically.</p>
          </div>
          <div class="feature-card">
            <div class="feature-num">03</div>
            <h3>Deploy With Precision</h3>
            <p>Get labor plans, crew routing, and cost projections for every block — all before you leave the field.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .features {
      background: white;
    }
    .section-header {
      text-align: center;
      max-width: 600px;
      margin: 0 auto 3.5rem;
    }
    .eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--brand-600);
      margin-bottom: 0.75rem;
    }
    .section-header h2 {
      font-size: clamp(2rem, 4vw, 2.75rem);
      margin-bottom: 0.75rem;
    }
    .section-header p {
      font-family: var(--font-serif);
      color: var(--stone-500);
      font-size: 1.05rem;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }
    .feature-card {
      background: var(--stone-50);
      border: 1px solid var(--stone-200);
      border-radius: 16px;
      padding: 2rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.06);
    }
    .feature-num {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--brand-500);
      margin-bottom: 1rem;
      letter-spacing: 0.05em;
    }
    .feature-card h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }
    .feature-card p {
      color: var(--stone-500);
      font-size: 0.9rem;
      line-height: 1.6;
    }
  `],
})
export class FeaturesComponent {}
