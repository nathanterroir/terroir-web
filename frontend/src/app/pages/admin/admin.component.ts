import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, SlicePipe } from '@angular/common';
import { SeoService } from '../../services/seo.service';
import {
  ApiService,
  AdminStats,
  ContactSubmission,
  WaitlistEntry,
} from '../../services/api.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, DatePipe, SlicePipe],
  template: `
    @if (!authenticated()) {
      <section class="admin-login">
        <div class="login-card">
          <h1>Admin</h1>
          <p>Enter your admin token to continue.</p>
          <form (ngSubmit)="authenticate()">
            <input
              type="password"
              [(ngModel)]="tokenInput"
              name="token"
              placeholder="Admin token"
              autocomplete="off"
            />
            <button type="submit" class="btn btn-primary">Sign In</button>
            @if (authError()) {
              <p class="error-msg">Invalid token.</p>
            }
          </form>
        </div>
      </section>
    } @else {
      <section class="admin-hero">
        <div class="container">
          <h1>Admin Dashboard</h1>
          <p>Terroir AI submissions overview</p>
        </div>
      </section>

      <section class="section">
        <div class="container">
          @if (stats()) {
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-value">{{ stats()!.total_contacts }}</span>
                <span class="stat-label">Total Contacts</span>
              </div>
              <div class="stat-card">
                <span class="stat-value">{{ stats()!.total_waitlist }}</span>
                <span class="stat-label">Total Waitlist</span>
              </div>
              <div class="stat-card accent">
                <span class="stat-value">{{ stats()!.contacts_today }}</span>
                <span class="stat-label">Contacts Today</span>
              </div>
              <div class="stat-card accent">
                <span class="stat-value">{{ stats()!.waitlist_today }}</span>
                <span class="stat-label">Waitlist Today</span>
              </div>
            </div>
          }

          <h2>Contact Submissions</h2>
          @if (contacts().length === 0) {
            <p class="empty">No contact submissions yet.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Crop Type</th>
                    <th>Message</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of contacts(); track c.id) {
                    <tr>
                      <td class="nowrap">{{ c.created_at | date:'short' }}</td>
                      <td>{{ c.name }}</td>
                      <td><a [href]="'mailto:' + c.email">{{ c.email }}</a></td>
                      <td>{{ c.company || '—' }}</td>
                      <td>{{ c.crop_type || '—' }}</td>
                      <td class="msg-cell" [title]="c.message">{{ c.message | slice:0:80 }}{{ c.message.length > 80 ? '...' : '' }}</td>
                      <td>{{ c.source }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <h2>Waitlist / Pilot Signups</h2>
          @if (waitlist().length === 0) {
            <p class="empty">No waitlist entries yet.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Interest</th>
                  </tr>
                </thead>
                <tbody>
                  @for (w of waitlist(); track w.id) {
                    <tr>
                      <td class="nowrap">{{ w.created_at | date:'short' }}</td>
                      <td><a [href]="'mailto:' + w.email">{{ w.email }}</a></td>
                      <td>{{ w.name || '—' }}</td>
                      <td>{{ w.company || '—' }}</td>
                      <td>{{ w.interest }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: [`
    .admin-login {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: var(--stone-100);
    }
    .login-card {
      background: white; padding: 2.5rem; border-radius: 16px;
      border: 1px solid var(--stone-200); width: 100%; max-width: 380px;
      text-align: center;
    }
    .login-card h1 { font-family: var(--font-sans); font-size: 1.5rem; margin-bottom: 0.25rem; }
    .login-card p { color: var(--stone-500); font-size: 0.9rem; margin-bottom: 1.5rem; }
    .login-card form { display: flex; flex-direction: column; gap: 1rem; }
    .login-card input {
      padding: 0.65rem 0.85rem; border: 1px solid var(--stone-300);
      border-radius: 8px; font-size: 0.9rem; font-family: var(--font-sans);
      text-align: center; outline: none;
    }
    .login-card input:focus { border-color: var(--brand-500); box-shadow: 0 0 0 3px var(--brand-100); }
    .error-msg { color: #dc2626; font-size: 0.85rem; margin: 0; }

    .admin-hero { background: var(--stone-800); color: white; padding: 4rem 0 2.5rem; }
    .admin-hero h1 { font-family: var(--font-sans); font-size: clamp(1.5rem, 4vw, 2.25rem); margin-bottom: 0.25rem; }
    .admin-hero p { color: var(--stone-400); }

    .stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .stat-card {
      background: white; border: 1px solid var(--stone-200);
      border-radius: 12px; padding: 1.25rem; text-align: center;
    }
    .stat-card.accent { border-left: 4px solid var(--brand-500); }
    .stat-value { display: block; font-family: var(--font-sans); font-size: 2rem; font-weight: 700; color: var(--stone-900); }
    .stat-label { display: block; font-family: var(--font-sans); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--stone-400); margin-top: 0.25rem; }

    h2 { font-family: var(--font-sans); font-size: 1.25rem; margin: 2rem 0 1rem; }
    .table-wrap { overflow-x: auto; margin-bottom: 2rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; font-family: var(--font-sans); }
    th { text-align: left; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--stone-400); padding: 0.75rem 0.5rem; border-bottom: 2px solid var(--stone-200); }
    td { padding: 0.65rem 0.5rem; border-bottom: 1px solid var(--stone-100); color: var(--stone-700); }
    td a { color: var(--brand-600); text-decoration: none; }
    td a:hover { text-decoration: underline; }
    .nowrap { white-space: nowrap; }
    .msg-cell { max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .empty { color: var(--stone-400); padding: 1.5rem 0; }

    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class AdminComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);

  tokenInput = '';
  authenticated = signal(false);
  authError = signal(false);
  stats = signal<AdminStats | null>(null);
  contacts = signal<ContactSubmission[]>([]);
  waitlist = signal<WaitlistEntry[]>([]);

  private token = '';

  ngOnInit() {
    this.seo.updateSeo({
      title: 'Admin Dashboard',
      description: 'Internal admin dashboard',
      url: '/admin',
      noindex: true,
    });

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('terroir_admin_token');
      if (stored) {
        this.token = stored;
        this.loadData();
      }
    }
  }

  authenticate() {
    this.authError.set(false);
    this.token = this.tokenInput;

    this.api.getAdminStats(this.token).subscribe({
      next: (data) => {
        this.authenticated.set(true);
        this.stats.set(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('terroir_admin_token', this.token);
        }
        this.loadContacts();
        this.loadWaitlist();
      },
      error: () => {
        this.authError.set(true);
      },
    });
  }

  private loadData() {
    this.api.getAdminStats(this.token).subscribe({
      next: (data) => {
        this.authenticated.set(true);
        this.stats.set(data);
        this.loadContacts();
        this.loadWaitlist();
      },
      error: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('terroir_admin_token');
        }
      },
    });
  }

  private loadContacts() {
    this.api.getAdminContacts(this.token).subscribe({
      next: (data) => this.contacts.set(data),
    });
  }

  private loadWaitlist() {
    this.api.getAdminWaitlist(this.token).subscribe({
      next: (data) => this.waitlist.set(data),
    });
  }
}
