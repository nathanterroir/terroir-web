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
            <p>AI heatmaps pinpoint disease hotspots and pest pressure so scouts and spray crews hit only the blocks that need them — cutting scouting hours and chemical spend in half.</p>
            <div class="metric">
              <span class="metric-value">50%</span>
              <span class="metric-label">fewer scouting hours</span>
            </div>
          </div>
          <div class="labor-card">
            <div class="card-icon variable-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3>Variable Rate Labor</h3>
            <p>Deploy different crew sizes per block based on actual plant-level data — not gut feel. Send 8 workers where the crop load is heavy, 3 where it's light.</p>
            <div class="metric">
              <span class="metric-value">30%</span>
              <span class="metric-label">labor cost reduction</span>
            </div>
          </div>
          <div class="labor-card">
            <div class="card-icon logistics-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="6" width="22" height="12" rx="2"/><path d="M1 10h22"/></svg>
            </div>
            <h3>Precision Logistics</h3>
            <p>Map yield variation and estimate fruit size across every block. Know exactly how many bins, tractors, and pickers each section needs — down to the row.</p>
            <div class="metric">
              <span class="metric-value">Zero</span>
              <span class="metric-label">over-hires at harvest</span>
            </div>
          </div>
          <div class="labor-card">
            <div class="card-icon harvest-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <h3>Harvest Labor Planning</h3>
            <p>Right-size your H-2A crews weeks in advance with yield forecasts grounded in actual fruit counts — not last year's averages.</p>
            <div class="metric">
              <span class="metric-value">Weeks</span>
              <span class="metric-label">of advance crew planning</span>
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
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      max-width: 1000px;
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
    .variable-icon {
      background: #fef3c7;
      color: #b45309;
    }
    .logistics-icon {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .harvest-icon {
      background: #ede9fe;
      color: #6d28d9;
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
