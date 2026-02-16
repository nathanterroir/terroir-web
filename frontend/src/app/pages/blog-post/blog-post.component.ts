import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, BlogPost } from '@app/services/api.service';
import { SeoService } from '@app/services/seo.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    @if (loading()) {
      <div class="loading-state" aria-live="polite"><p>Loading...</p></div>
    } @else if (post()) {
      <article itemscope itemtype="https://schema.org/Article">
        <header class="post-hero" [style.backgroundImage]="'url(' + post()!.hero_image_url + ')'">
          <div class="hero-overlay"></div>
          <div class="hero-content container-narrow">
            <a routerLink="/blog" class="back-link">&larr; Back to Blog</a>
            <span class="category" itemprop="articleSection">{{ post()!.category }}</span>
            <h1 itemprop="headline">{{ post()!.title }}</h1>
            <div class="meta">
              <span class="author" itemprop="author" itemscope itemtype="https://schema.org/Organization">
                <span itemprop="name">{{ post()!.author_name }}</span>
              </span>
              <span class="meta-sep">&bull;</span>
              <time [attr.datetime]="post()!.published_at" itemprop="datePublished">
                {{ post()!.published_at | date:'longDate' }}
              </time>
              <span class="meta-sep">&bull;</span>
              <span>{{ post()!.read_time_minutes }} min read</span>
            </div>
          </div>
        </header>

        <div class="container-narrow post-body" itemprop="articleBody" [innerHTML]="post()!.content_html"></div>

        <footer class="post-footer container-narrow">
          <div class="footer-divider"></div>
          <div class="footer-content">
            <div class="footer-brand">
              <span class="footer-author">{{ post()!.author_name }}</span>
              <span class="footer-tagline">Precision Labor Intelligence for specialty crops</span>
            </div>
            <a routerLink="/blog" class="footer-back">&larr; All Articles</a>
          </div>
        </footer>
      </article>
    } @else {
      <div class="loading-state"><p>Post not found.</p></div>
    }
  `,
  styles: [`
    .loading-state {
      display: flex;
      justify-content: center;
      padding: 6rem 2rem;
      color: var(--stone-400);
    }

    /* ── Hero ── */
    .post-hero {
      position: relative;
      min-height: 52vh;
      display: flex;
      align-items: flex-end;
      background-size: cover;
      background-position: center;
      padding-bottom: 3.5rem;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(15, 40, 20, 0.15) 0%,
        rgba(15, 40, 20, 0.55) 50%,
        rgba(15, 40, 20, 0.88) 100%
      );
    }
    .hero-content {
      position: relative;
      z-index: 2;
      color: white;
    }
    .back-link {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 500;
      color: rgba(255,255,255,0.6);
      margin-bottom: 1.5rem;
      transition: color 0.2s;
      letter-spacing: 0.02em;
    }
    .back-link:hover {
      color: white;
    }
    .category {
      display: block;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--brand-300);
      margin-bottom: 0.75rem;
    }
    .hero-content h1 {
      font-size: clamp(1.75rem, 4vw, 2.75rem);
      line-height: 1.2;
      margin: 0 0 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.6);
      flex-wrap: wrap;
    }
    .author {
      font-weight: 600;
      color: rgba(255,255,255,0.85);
    }
    .meta-sep {
      color: rgba(255,255,255,0.3);
    }

    /* ── Post body — styles for innerHTML content ── */
    .post-body {
      padding-top: 3.5rem;
      padding-bottom: 2rem;
      font-family: var(--font-serif);
      font-size: 1.125rem;
      line-height: 1.85;
      color: var(--stone-700);
    }

    /* Paragraphs */
    :host ::ng-deep .post-body p {
      margin-bottom: 1.5rem;
    }
    :host ::ng-deep .post-body > p:first-child {
      font-size: 1.2rem;
      line-height: 1.8;
      color: var(--stone-600);
    }
    :host ::ng-deep .post-body > p:first-child::first-letter {
      float: left;
      font-size: 3.4rem;
      font-weight: 800;
      line-height: 0.85;
      padding-right: 0.12em;
      padding-top: 0.05em;
      color: var(--brand-700);
      font-family: var(--font-sans, 'DM Sans', system-ui, sans-serif);
    }

    /* Headings */
    :host ::ng-deep .post-body h2 {
      font-family: var(--font-sans, 'DM Sans', system-ui, sans-serif);
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--stone-900);
      margin: 3rem 0 1rem;
      letter-spacing: -0.02em;
      line-height: 1.3;
      border: none;
    }
    :host ::ng-deep .post-body h3 {
      font-family: var(--font-sans, 'DM Sans', system-ui, sans-serif);
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--stone-800);
      margin: 2.5rem 0 0.75rem;
      letter-spacing: -0.01em;
    }

    /* Horizontal rule */
    :host ::ng-deep .post-body hr {
      border: none;
      height: 1px;
      background: var(--stone-200);
      margin: 2.5rem auto;
      max-width: 120px;
    }

    /* Blockquote */
    :host ::ng-deep .post-body blockquote {
      position: relative;
      margin: 2.5rem 0;
      padding: 1.5rem 1.75rem;
      border-left: 4px solid var(--brand-500);
      background: var(--stone-50, #fafaf9);
      border-radius: 0 12px 12px 0;
    }
    :host ::ng-deep .post-body blockquote p {
      font-style: italic;
      font-size: 1.1rem;
      line-height: 1.75;
      color: var(--stone-600);
      margin-bottom: 0;
    }

    /* Lists */
    :host ::ng-deep .post-body ul,
    :host ::ng-deep .post-body ol {
      margin: 1.5rem 0;
      padding-left: 0;
      list-style: none;
    }
    :host ::ng-deep .post-body ul li,
    :host ::ng-deep .post-body ol li {
      position: relative;
      padding-left: 1.5rem;
      margin-bottom: 1rem;
      line-height: 1.75;
    }
    :host ::ng-deep .post-body ul li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.7em;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--brand-500);
    }
    :host ::ng-deep .post-body ol {
      counter-reset: list-counter;
    }
    :host ::ng-deep .post-body ol li {
      counter-increment: list-counter;
    }
    :host ::ng-deep .post-body ol li::before {
      content: counter(list-counter);
      position: absolute;
      left: 0;
      top: 0;
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--brand-600);
      font-family: var(--font-sans, 'DM Sans', system-ui, sans-serif);
    }

    /* Bold text */
    :host ::ng-deep .post-body strong {
      font-weight: 700;
      color: var(--stone-800);
    }

    /* Links */
    :host ::ng-deep .post-body a {
      color: var(--brand-600);
      text-decoration: underline;
      text-decoration-color: var(--brand-300);
      text-underline-offset: 3px;
      transition: text-decoration-color 0.2s;
    }
    :host ::ng-deep .post-body a:hover {
      text-decoration-color: var(--brand-600);
    }

    /* ── Post footer ── */
    .post-footer {
      padding-bottom: 4rem;
    }
    .footer-divider {
      height: 1px;
      background: var(--stone-200);
      margin-bottom: 2rem;
    }
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .footer-author {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--stone-800);
    }
    .footer-tagline {
      font-size: 0.8rem;
      color: var(--stone-400);
      font-family: var(--font-serif);
    }
    .footer-back {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--brand-600);
      transition: color 0.2s;
    }
    .footer-back:hover {
      color: var(--brand-800);
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .post-hero { min-height: 40vh; }
      .hero-content h1 { font-size: 1.5rem; }
      .post-body { font-size: 1.05rem; padding-top: 2.5rem; }
      :host ::ng-deep .post-body h2 { font-size: 1.3rem; margin-top: 2.5rem; }
      :host ::ng-deep .post-body blockquote { margin: 2rem -0.5rem; padding: 1.25rem 1.25rem; }
      .footer-content { flex-direction: column; align-items: flex-start; gap: 1rem; }
    }
  `],
})
export class BlogPostComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);

  post = signal<BlogPost | null>(null);
  loading = signal(true);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.api.getBlogPost(slug).subscribe({
      next: (data) => {
        this.post.set(data);
        this.loading.set(false);

        // Dynamic SEO meta tags
        this.seo.updateSeo({
          title: data.title,
          description: data.excerpt || data.title,
          url: `/blog/${data.slug}`,
          image: data.hero_image_url || undefined,
          type: 'article',
          article: {
            publishedTime: data.published_at || undefined,
            author: data.author_name,
            section: data.category,
          },
        });

        // JSON-LD Article schema
        this.seo.setArticleSchema({
          title: data.title,
          description: data.excerpt,
          url: `/blog/${data.slug}`,
          image: data.hero_image_url || undefined,
          datePublished: data.published_at || undefined,
          dateModified: data.updated_at || data.published_at || undefined,
          author: data.author_name,
        });

        // Breadcrumb schema for search results
        this.seo.setBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: data.title, url: `/blog/${data.slug}` },
        ]);
      },
      error: () => this.loading.set(false),
    });
  }
}
