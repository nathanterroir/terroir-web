import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService, BlogPost } from '@app/services/api.service';
import { SeoService } from '@app/services/seo.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (loading()) {
      <div class="loading-state" aria-live="polite"><p>Loading...</p></div>
    } @else if (post()) {
      <article itemscope itemtype="https://schema.org/Article">
        <header class="post-hero" [style.backgroundImage]="'url(' + post()!.hero_image_url + ')'">
          <div class="hero-overlay"></div>
          <div class="hero-content container-narrow">
            <span class="category" itemprop="articleSection">{{ post()!.category }}</span>
            <h1 itemprop="headline">{{ post()!.title }}</h1>
            <div class="meta">
              <span itemprop="author" itemscope itemtype="https://schema.org/Organization">
                <span itemprop="name">{{ post()!.author_name }}</span>
              </span>
              <span>&bull;</span>
              <time [attr.datetime]="post()!.published_at" itemprop="datePublished">
                {{ post()!.published_at | date:'mediumDate' }}
              </time>
              <span>&bull;</span>
              <span>{{ post()!.read_time_minutes }} min read</span>
            </div>
          </div>
        </header>
        <div class="container-narrow post-body" itemprop="articleBody" [innerHTML]="post()!.content_html"></div>
      </article>
    } @else {
      <div class="loading-state"><p>Post not found.</p></div>
    }
  `,
  styles: [`
    .loading-state { display: flex; justify-content: center; padding: 6rem 2rem; color: var(--stone-400); }
    .post-hero {
      position: relative; min-height: 50vh; display: flex; align-items: flex-end;
      background-size: cover; background-position: center; padding-bottom: 3rem;
    }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(26,69,36,0.3), rgba(26,69,36,0.85)); }
    .hero-content { position: relative; z-index: 2; color: white; }
    .category { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--brand-200); }
    .hero-content h1 { font-size: clamp(1.75rem, 4vw, 2.75rem); margin: 0.5rem 0 1rem; }
    .meta { display: flex; gap: 0.5rem; font-size: 0.85rem; color: rgba(255,255,255,0.7); }
    .post-body { padding-top: 3rem; padding-bottom: 4rem; font-family: var(--font-serif); font-size: 1.1rem; line-height: 1.8; color: var(--stone-700); }
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
