import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '@env/environment';

/**
 * Lightweight first-party analytics for Lean Startup AARRR tracking.
 *
 * Acquisition:  Auto-tracks page views with UTM params
 * Activation:   Track with `trackEvent('cta_click', 'activation', ...)`
 * Retention:    Persistent visitor ID enables returning-visitor analysis
 * Referral:     Track with `trackEvent('share_click', 'referral', ...)`
 * Revenue:      Track with `trackEvent('trial_start', 'revenue', ...)`
 *
 * All data stays in your own Postgres DB — no third-party analytics.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = environment.apiUrl;

  private visitorId = '';
  private sessionId = '';

  constructor() {
    // Only run in browser (not during SSR)
    if (typeof window === 'undefined') return;

    this.visitorId = this.getOrCreateId('terroir_vid', 365);
    this.sessionId = this.getOrCreateId('terroir_sid', 0); // session-scoped

    // Auto-track page views on navigation
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        const nav = e as NavigationEnd;
        this.trackPageView(nav.urlAfterRedirects);
      });
  }

  /** Track a page view — called automatically on route changes */
  trackPageView(path: string): void {
    const params = new URLSearchParams(window.location.search);
    const payload = {
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      path,
      referrer: document.referrer || null,
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_term: params.get('utm_term'),
      utm_content: params.get('utm_content'),
      screen_width: window.innerWidth,
    };

    // Fire and forget — don't block UI
    this.http.post(`${this.baseUrl}/analytics/pageview`, payload).subscribe({
      error: () => {}, // silently fail
    });
  }

  /**
   * Track a custom event.
   *
   * Categories map to AARRR stages:
   *   - 'acquisition'  — traffic source events
   *   - 'activation'   — aha moment, first value received
   *   - 'retention'    — return visits, feature re-use
   *   - 'referral'     — share, invite
   *   - 'revenue'      — trial start, purchase, upgrade
   *   - 'interaction'  — general UI events (default)
   */
  trackEvent(
    name: string,
    category: string = 'interaction',
    label?: string,
    value?: number,
    properties?: Record<string, unknown>,
  ): void {
    if (typeof window === 'undefined') return;

    const payload = {
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      event_name: name,
      event_category: category,
      event_label: label,
      event_value: value,
      properties: properties || {},
      path: window.location.pathname,
    };

    this.http.post(`${this.baseUrl}/analytics/event`, payload).subscribe({
      error: () => {},
    });
  }

  // ── Convenience methods for common AARRR events ──

  trackCtaClick(label: string): void {
    this.trackEvent('cta_click', 'activation', label);
  }

  trackContactSubmit(): void {
    this.trackEvent('contact_submit', 'activation', 'contact_form');
  }

  trackWaitlistJoin(): void {
    this.trackEvent('waitlist_join', 'activation', 'lidar_beta');
  }

  trackDownloadClick(): void {
    this.trackEvent('download_click', 'revenue', 'ios_app');
  }

  trackBlogRead(slug: string): void {
    this.trackEvent('blog_read', 'retention', slug);
  }

  trackShare(platform: string): void {
    this.trackEvent('share_click', 'referral', platform);
  }

  // ── ID management ──

  private getOrCreateId(key: string, expiryDays: number): string {
    let id = this.getCookie(key);
    if (!id) {
      id = this.generateId();
      if (expiryDays > 0) {
        this.setCookie(key, id, expiryDays);
      } else {
        // Session cookie (no expiry)
        document.cookie = `${key}=${id};path=/;SameSite=Lax`;
      }
    }
    return id;
  }

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? match[1] : null;
  }

  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax`;
  }
}
