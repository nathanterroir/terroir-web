import { Component } from '@angular/core';

@Component({
  selector: 'app-labor-section',
  standalone: true,
  template: `
    <section class="section labor">
      <div class="container">
        <div class="section-header">
          <span class="eyebrow">Labor Optimization</span>
          <h2>Every Hour Must Be Productive</h2>
          <p>
            When you're paying $18–$20/hr for H-2A labor, you cannot afford to have a crew
            walking rows just to "see what's out there."
          </p>
        </div>

        <div class="labor-grid stagger">
          <div class="labor-card">
            <div class="card-icon scout-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </div>
            <h3>Directed Scouting</h3>
            <p>Our app creates heatmaps of stress and disease. Send scouts directly to hotspots instead of walking every row.</p>
            <div class="metric">
              <span class="metric-value">50%</span>
              <span class="metric-label">fewer scouting hours</span>
            </div>
          </div>
          <div class="labor-card">
            <div class="card-icon logistics-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="6" width="22" height="12" rx="2"/><path d="M1 10h22"/></svg>
            </div>
            <h3>Precision Logistics</h3>
            <p>Map yield variation and estimate cluster size across blocks. Know exactly how many bins and pickers each section needs.</p>
            <div class="metric">
              <span class="metric-value">Zero</span>
              <span class="metric-label">over-hires at harvest</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .labor {
      background: var(--stone-50);
    }
    .section-header {
      text-align: center;
      max-width: 620px;
      margin: 0 auto 3rem;
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
      font-style: italic;
    }
    .labor-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .labor-card {
      background: white;
      border: 1px solid var(--stone-200);
      border-radius: 16px;
      padding: 2rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .labor-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.06);
    }
    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .card-icon svg {
      width: 24px;
      height: 24px;
    }
    .scout-icon {
      background: var(--brand-100);
      color: var(--brand-700);
    }
    .logistics-icon {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .labor-card h3 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }
    .labor-card p {
      color: var(--stone-500);
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 1.25rem;
    }
    .metric {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--stone-100);
    }
    .metric-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--brand-700);
    }
    .metric-label {
      font-size: 0.8rem;
      color: var(--stone-400);
    }
  `],
})
export class LaborSectionComponent {}
