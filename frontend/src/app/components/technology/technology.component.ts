import { Component } from '@angular/core';

@Component({
  selector: 'app-technology',
  standalone: true,
  template: `
    <section class="section tech">
      <div class="container">
        <div class="tech-grid">
          <div class="tech-text">
            <span class="eyebrow">The Intelligence Engine</span>
            <h2>From Raw Frames to Labor Plans — At 30 FPS</h2>
            <p class="serif">
              Unlike satellite imagery that gives you a delayed, blurry picture, Terroir AI runs
              RGB Instance Segmentation directly on your iPhone. Every frame is processed on-device,
              tagged with high-precision GNSS coordinates, and translated into actionable crew deployment intelligence.
            </p>
            <div class="tech-stats">
              <div class="stat">
                <span class="stat-num">30+</span>
                <span class="stat-label">Frames/sec</span>
              </div>
              <div class="stat">
                <span class="stat-num">±2cm</span>
                <span class="stat-label">GPS accuracy</span>
              </div>
              <div class="stat">
                <span class="stat-num">0</span>
                <span class="stat-label">Cloud uploads</span>
              </div>
            </div>
          </div>
          <div class="tech-visual">
            <img
              src="assets/iphone-mockup.png"
              alt="Terroir AI app detecting red leaf virus in a vineyard — real-time status, GPS coordinates, and disease classification displayed on iPhone"
              width="300"
              height="650"
              loading="lazy"
              class="phone-screenshot"
            />
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .tech {
      background: var(--stone-900);
      color: white;
    }
    .tech-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }
    .eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--brand-400);
      margin-bottom: 0.75rem;
    }
    .tech-text h2 {
      font-size: clamp(1.75rem, 3.5vw, 2.5rem);
      margin-bottom: 1rem;
    }
    .tech-text p {
      font-family: var(--font-serif);
      color: var(--stone-300);
      font-size: 1.05rem;
      line-height: 1.8;
      margin-bottom: 2rem;
    }
    .tech-stats {
      display: flex;
      gap: 2.5rem;
    }
    .stat-num {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: var(--brand-400);
    }
    .stat-label {
      font-size: 0.8rem;
      color: var(--stone-400);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .tech-visual {
      display: flex;
      justify-content: center;
    }

    .phone-screenshot {
      display: block;
      width: 300px;
      height: auto;
    }

    @media (max-width: 768px) {
      .tech-grid {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }
      .tech-visual { order: -1; }
      .phone-screenshot { width: 260px; }
    }
  `],
})
export class TechnologyComponent {}
