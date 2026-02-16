import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@app/services/api.service';
import { AnalyticsService } from '@app/services/analytics.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="form-card">
      @if (submitted()) {
        <div class="success animate-fade-up">
          <div class="success-icon">✓</div>
          <h3>Thank you!</h3>
          <p>We'll be in touch shortly.</p>
        </div>
      } @else {
        <form (ngSubmit)="onSubmit()" class="form">
          <div class="field-row">
            <div class="field">
              <label for="name">Name *</label>
              <input id="name" type="text" [(ngModel)]="name" name="name" required placeholder="Your name">
            </div>
            <div class="field">
              <label for="email">Email *</label>
              <input id="email" type="email" [(ngModel)]="email" name="email" required placeholder="you&#64;farm.com">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="company">Company</label>
              <input id="company" type="text" [(ngModel)]="company" name="company" placeholder="Farm or company name">
            </div>
            <div class="field">
              <label for="crop">Crop Type</label>
              <input id="crop" type="text" [(ngModel)]="cropType" name="crop" placeholder="e.g., Citrus, Avocados, Grapes">
            </div>
          </div>
          <div class="field">
            <label for="message">Message *</label>
            <textarea id="message" [(ngModel)]="message" name="message" required rows="4" placeholder="Tell us about your operation..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="loading()">
            @if (loading()) { Sending... } @else { Send Message }
          </button>
          @if (error()) {
            <p class="error-msg">{{ error() }}</p>
          }
        </form>
      }
    </div>
  `,
  styles: [`
    .form-card {
      background: white;
      border: 1px solid var(--stone-200);
      border-radius: 16px;
      padding: 2rem;
    }
    .form { display: flex; flex-direction: column; gap: 1.25rem; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.35rem; }
    label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--stone-600);
    }
    input, textarea {
      font-family: var(--font-sans);
      padding: 0.65rem 0.85rem;
      border: 1px solid var(--stone-300);
      border-radius: 8px;
      font-size: 0.9rem;
      transition: border-color 0.2s;
      outline: none;
    }
    input:focus, textarea:focus {
      border-color: var(--brand-500);
      box-shadow: 0 0 0 3px var(--brand-100);
    }
    textarea { resize: vertical; }
    button[type="submit"] { align-self: flex-start; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .success {
      text-align: center;
      padding: 2rem;
    }
    .success-icon {
      width: 56px;
      height: 56px;
      background: var(--brand-100);
      color: var(--brand-700);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 auto 1rem;
    }
    .success h3 { font-size: 1.25rem; margin-bottom: 0.25rem; }
    .success p { color: var(--stone-500); }
    .error-msg { color: #dc2626; font-size: 0.85rem; }
    @media (max-width: 640px) {
      .field-row { grid-template-columns: 1fr; }
    }
  `],
})
export class ContactFormComponent {
  private readonly api = inject(ApiService);
  private readonly analytics = inject(AnalyticsService);

  name = '';
  email = '';
  company = '';
  cropType = '';
  message = '';

  loading = signal(false);
  submitted = signal(false);
  error = signal('');

  onSubmit() {
    this.loading.set(true);
    this.error.set('');

    this.api.submitContact({
      name: this.name,
      email: this.email,
      company: this.company || undefined,
      crop_type: this.cropType || undefined,
      message: this.message,
      source: 'website_contact',
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
        this.analytics.trackContactSubmit();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Something went wrong. Please try again.');
      },
    });
  }
}
