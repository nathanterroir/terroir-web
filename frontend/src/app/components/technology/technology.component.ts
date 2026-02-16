import { Component } from '@angular/core';

@Component({
  selector: 'app-technology',
  standalone: true,
  template: `
    <section class="section tech">
      <div class="container">
        <div class="tech-grid">
          <div class="tech-text">
            <span class="eyebrow">Edge AI Technology</span>
            <h2>Mapping at 30 FPS — No Cloud Required</h2>
            <p class="serif">
              Unlike satellite imagery that gives you a delayed, blurry picture, Terroir AI runs
              RGB Instance Segmentation directly on your iPhone. Every frame is processed on-device
              and tagged with high-precision GNSS coordinates.
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
            <div class="phone-frame">
              <img
                src="https://images.unsplash.com/photo-1596238680068-07d0669745e6?q=80&w=800&auto=format&fit=crop"
                alt="Close-up of grape clusters on vine — AI instance segmentation target for yield estimation"
                loading="lazy"
                width="800"
                height="1067"
              />
              <div class="ai-badge">
                <span class="pulse"></span>
                AI Processing
              </div>
              <div class="overlay-tag top">Est. Cluster Size: Large</div>
              <div class="overlay-tag bottom">Disease Risk: Low</div>
            </div>
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
    .phone-frame {
      position: relative;
      width: 320px;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,0.4);
      border: 2px solid rgba(255,255,255,0.1);
    }
    .phone-frame img {
      width: 100%;
      display: block;
    }
    .ai-badge {
      position: absolute;
      top: 16px;
      left: 16px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(8px);
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--brand-300);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .pulse {
      width: 8px;
      height: 8px;
      background: var(--brand-400);
      border-radius: 50%;
      animation: pulse-dot 2s infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .overlay-tag {
      position: absolute;
      right: 12px;
      padding: 4px 10px;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(6px);
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 500;
      font-family: monospace;
      color: white;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .overlay-tag.top { top: 16px; }
    .overlay-tag.bottom { bottom: 16px; }
    @media (max-width: 768px) {
      .tech-grid {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }
      .tech-visual { order: -1; }
      .phone-frame { width: 260px; }
    }
  `],
})
export class TechnologyComponent {}
