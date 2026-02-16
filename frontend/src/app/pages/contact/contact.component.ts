import { Component, inject, OnInit } from '@angular/core';
import { ContactFormComponent } from '@app/components/contact-form/contact-form.component';
import { SeoService } from '@app/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ContactFormComponent],
  template: `
    <section class="contact-hero" aria-label="Contact header">
      <div class="container">
        <h1>Get In Touch</h1>
        <p>Whether you manage 50 acres or 5,000 — we'd love to show you what precision labor intelligence can do.</p>
      </div>
    </section>
    <section class="section" aria-label="Contact form">
      <div class="container contact-layout">
        <div class="contact-info">
          <h2>Let's talk about your operation</h2>
          <p>Tell us about your crops, acreage, and biggest challenges. We'll show you how precision labor intelligence can help.</p>
          <address class="info-items">
            <div class="info-item">
              <span class="info-label">Email</span>
              <a href="mailto:support&#64;terroirai.com">support&#64;terroirai.com</a>
            </div>
          </address>
        </div>
        <app-contact-form />
      </div>
    </section>
  `,
  styles: [`
    .contact-hero { background: var(--brand-900); color: white; padding: 6rem 0 4rem; text-align: center; }
    .contact-hero h1 { font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 0.5rem; }
    .contact-hero p { color: var(--brand-200); font-family: var(--font-serif); }
    .contact-layout { display: grid; grid-template-columns: 1fr 1.2fr; gap: 3rem; align-items: start; }
    .contact-info h2 { font-size: 1.5rem; margin-bottom: 0.75rem; }
    .contact-info > p { color: var(--stone-500); font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; }
    address { font-style: normal; }
    .info-items { display: flex; flex-direction: column; gap: 1rem; }
    .info-label { display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--stone-400); margin-bottom: 0.15rem; }
    .info-item a { color: var(--brand-600); font-weight: 500; }
    @media (max-width: 768px) { .contact-layout { grid-template-columns: 1fr; } }
  `],
})
export class ContactComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit() {
    this.seo.updateSeo({
      title: 'Contact Us — See a Demo',
      description: 'Get in touch with Terroir AI. Schedule a demo or learn how precision labor intelligence can optimize crew deployment and reduce costs for your specialty crop operation.',
      url: '/contact',
    });
  }
}
