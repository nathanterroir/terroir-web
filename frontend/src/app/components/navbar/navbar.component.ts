import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav [class.scrolled]="scrolled()" aria-label="Main navigation">
      <div class="nav-inner container">
        <a routerLink="/" class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 121.13 93.16" class="logo-icon" aria-hidden="true">
            <path d="M3.31,0C4,8.4,5.09,16.9,6.21,20.42s6.57,13.24,18.24,11.43c4-.63,17.3-1.07,21.57-1.25S60.91,30.21,62.27,29s6.67-2.54,8.09-2.57,4.75-1.74,6.43-1.87,2.41-1.93,4.07-2.73,2.91-2.82,3.78-4.6,5.78-7.07,6.8-7.86,2.38-3.47,4.31-3.62,6,.16,6.92.59c1.85,0,3-.19,4.27.8s4.65,2.06,3.85,4.86a21.22,21.22,0,0,0,5,2.21,19.55,19.55,0,0,1,4.69,2.43c1.27.9.23,2.21-.29,2.83s-1.13,1-1.2,2.16-2.13,4.07-4.34,4.72a21.69,21.69,0,0,0-3.36,1.12,21.31,21.31,0,0,1-3.73.83,2.45,2.45,0,0,0-2.18,2.1,7.09,7.09,0,0,1-4.33,5.25,1.3,1.3,0,0,0-.58,2.07c.46.61,3.95,10.11-7.44,17.36a21.18,21.18,0,0,0-2.48,5.36l.27-.58c-.64,2.68-.39,10,.25,13.22s0,8.84,1.73,9.92,3.94.44,5.49,2.46-1.4,4.87-3.12,4.66l-1-.13c-.5,3.53-10.24,2.42-10.54.82-.18-1-1.08-.7-1.4-3.06s-.27-4-.73-4.94a8.53,8.53,0,0,1-1.28-5.17c.11-3-.93-13.17-1.13-14.39s-.3-1.22-.4-1.75C65.94,65.37,52.44,59.59,44.47,58c-2-.42-2,1.64-2,2.09s-.63,3.37-6.33-.42C34.26,63.16,32.4,63.8,30.91,65s-6.45,6.14-7.22,7.67-3.07,6-2.11,8.81c.29.83.22,1.9.67,2,2.18-.65,5.72.37,5.8,2.18.06,1.26-1.32,2.07-2.41,2.38s-6.74.78-8-2.21a2.15,2.15,0,0,1-.26-1.35,14.34,14.34,0,0,0,0-3.26,11.89,11.89,0,0,0-1.29-4.5c-1.56,2-3.27,4.94-3.05,6.76s.34,3.43.36,4.19c1.91.32,4.26.25,4.15,3.24-.1,2.53-3.4,2.21-5.54,2.23a4,4,0,0,1-4.28-4.23c-.21-1.14.32-5.27.36-7.33a29.18,29.18,0,0,0,0-4.88c-.22-1.67-1-2.5,1.6-4.22s5.88-7.65,5.78-16S12.65,46.9,15.3,40.9c.84-1.92,2-3.39-1-4.33S1.4,29.47.57,20.41-.74,2.13,3.31,0Z"/>
          </svg>
          <span class="logo-text">Terroir<span class="accent">AI</span></span>
        </a>

        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/blog" routerLinkActive="active">Blog</a>
          <a routerLink="/contact" routerLinkActive="active">Contact</a>
        </div>

        <a routerLink="/contact" class="btn btn-primary nav-cta">Get Started</a>

        <button class="mobile-toggle" (click)="mobileOpen.set(!mobileOpen())" [attr.aria-expanded]="mobileOpen()" aria-label="Toggle mobile menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      @if (mobileOpen()) {
        <div class="mobile-menu">
          <a routerLink="/" (click)="mobileOpen.set(false)">Home</a>
          <a routerLink="/blog" (click)="mobileOpen.set(false)">Blog</a>
          <a routerLink="/contact" (click)="mobileOpen.set(false)">Contact</a>
          <a routerLink="/contact" class="btn btn-primary" (click)="mobileOpen.set(false)">Get Started</a>
        </div>
      }
    </nav>
  `,
  styles: [`
    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--stone-200);
      transition: box-shadow 0.3s ease;
    }
    nav.scrolled {
      box-shadow: 0 1px 12px rgba(0,0,0,0.06);
    }
    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .logo-icon {
      height: 32px;
      width: auto;
      fill: var(--brand-600);
    }
    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .accent { color: var(--brand-500); }
    .nav-links {
      display: flex;
      gap: 2rem;
    }
    .nav-links a {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--stone-500);
      transition: color 0.2s;
      padding: 0.25rem 0;
      border-bottom: 2px solid transparent;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--stone-900);
      border-bottom-color: var(--brand-500);
    }
    .nav-cta { font-size: 0.85rem; padding: 0.5rem 1.25rem; }
    .mobile-toggle {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }
    .mobile-toggle span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--stone-700);
      border-radius: 1px;
      transition: 0.2s;
    }
    .mobile-menu {
      display: none;
      flex-direction: column;
      padding: 1rem 1.5rem 1.5rem;
      gap: 0.75rem;
      border-top: 1px solid var(--stone-200);
    }
    .mobile-menu a {
      font-size: 1rem;
      font-weight: 500;
      color: var(--stone-700);
      padding: 0.5rem 0;
    }
    @media (max-width: 768px) {
      .nav-links, .nav-cta { display: none; }
      .mobile-toggle { display: flex; }
      .mobile-menu { display: flex; }
    }
  `],
})
export class NavbarComponent {
  scrolled = signal(false);
  mobileOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 10);
  }
}
