import { Component } from '@angular/core';

@Component({
  selector: 'app-regulatory',
  standalone: true,
  template: `
    <section class="section regulatory">
      <div class="container">
        <div class="section-header">
          <span class="eyebrow">Compliance & IPM</span>
          <h2>From "Spray and Pray" to Justified Intervention</h2>
        </div>
        <div class="card-grid stagger">
          @for (card of cards; track card.title) {
            <div class="reg-card">
              <div class="card-icon" [style.background]="card.iconBg" [style.color]="card.iconColor">
                <span>{{ card.emoji }}</span>
              </div>
              <h3>{{ card.title }}</h3>
              <p>{{ card.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .regulatory { background: white; }
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
      font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .reg-card {
      background: var(--stone-50);
      border: 1px solid var(--stone-200);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .reg-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.05);
    }
    .card-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-size: 1.5rem;
    }
    .reg-card h3 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
    .reg-card p {
      color: var(--stone-500);
      font-size: 0.85rem;
      line-height: 1.6;
    }
  `],
})
export class RegulatoryComponent {
  cards = [
    {
      emoji: '🦠',
      title: 'Powdery Mildew',
      description: 'Map infection zones to justify spot-spraying, reducing chemical volume and cost.',
      iconBg: '#fef3c7',
      iconColor: '#d97706',
    },
    {
      emoji: '🐛',
      title: 'Pest Damage',
      description: 'Identify mite bronzing or scale early to preserve canopy health and photosynthesis.',
      iconBg: '#fee2e2',
      iconColor: '#dc2626',
    },
    {
      emoji: '💧',
      title: 'Water Stress',
      description: 'Correlate visual stress signs with irrigation zones to prove water stewardship compliance.',
      iconBg: '#dbeafe',
      iconColor: '#2563eb',
    },
  ];
}
