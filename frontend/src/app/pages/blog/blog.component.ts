import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, BlogPostSummary } from '@app/services/api.service';
import { SeoService } from '@app/services/seo.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <section class="blog-hero" aria-label="Blog header">
      <div class="container">
        <h1>Blog</h1>
        <p>Insights on precision agriculture, labor optimization, and field intelligence.</p>
      </div>
    </section>

    <section class="section" aria-label="Blog posts">
      <div class="container">
        @if (loading()) {
          <p class="loading" aria-live="polite">Loading posts...</p>
        } @else if (posts().length === 0) {
          <p class="empty">No posts yet. Check back soon!</p>
        } @else {
          <div class="post-grid stagger">
            @for (post of posts(); track post.id) {
              <article class="post-card">
                <a [routerLink]="['/blog', post.slug]" [attr.aria-label]="'Read: ' + post.title">
                  @if (post.hero_image_url) {
                    <div class="post-img">
                      <img [src]="post.hero_image_url" [alt]="post.title" loading="lazy" width="400" height="200" />
                    </div>
                  }
                  <div class="post-body">
                    <span class="category">{{ post.category }}</span>
                    <h2>{{ post.title }}</h2>
                    <p>{{ post.excerpt }}</p>
                    <div class="post-meta">
                      <time [attr.datetime]="post.published_at">{{ post.published_at | date:'mediumDate' }}</time>
                      <span>&bull; {{ post.read_time_minutes }} min read</span>
                    </div>
                  </div>
                </a>
              </article>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .blog-hero {
      background: var(--brand-900);
      color: white;
      padding: 6rem 0 4rem;
      text-align: center;
    }
    .blog-hero h1 { font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 0.5rem; }
    .blog-hero p { color: var(--brand-200); font-family: var(--font-serif); }
    .loading, .empty { text-align: center; color: var(--stone-400); padding: 3rem; }
    .post-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 2rem;
    }
    .post-card {
      background: white;
      border: 1px solid var(--stone-200);
      border-radius: 16px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .post-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
    .post-card a { display: block; }
    .post-img { height: 200px; overflow: hidden; }
    .post-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
    .post-card:hover .post-img img { transform: scale(1.05); }
    .post-body { padding: 1.5rem; }
    .category { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--brand-600); }
    .post-body h2 { font-size: 1.2rem; margin: 0.4rem 0 0.5rem; line-height: 1.3; }
    .post-body p { color: var(--stone-500); font-size: 0.85rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .post-meta { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 1rem; font-size: 0.75rem; color: var(--stone-400); }
  `],
})
export class BlogComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  posts = signal<BlogPostSummary[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.seo.updateSeo({
      title: 'Blog — Precision Agriculture Insights',
      description: 'Expert articles on specialty crop intelligence, labor optimization, disease management, and field technology from the Terroir AI team.',
      url: '/blog',
    });

    this.api.getBlogPosts().subscribe({
      next: (data) => { this.posts.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
