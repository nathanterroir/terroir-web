import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoData {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article';
  article?: {
    publishedTime?: string;
    author?: string;
    section?: string;
  };
  noindex?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  private readonly siteName = 'Terroir AI';
  private readonly defaultImage = 'https://terroirai.com/assets/og-default.jpg';
  private readonly baseUrl = 'https://terroirai.com';

  /**
   * Set all SEO meta tags for a page. Call this in every page component's ngOnInit.
   */
  updateSeo(data: SeoData): void {
    const fullTitle = data.title === this.siteName
      ? data.title
      : `${data.title} | ${this.siteName}`;

    // Title
    this.title.setTitle(fullTitle);

    // Standard meta
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.updateTag({ name: 'robots', content: data.noindex ? 'noindex, nofollow' : 'index, follow' });

    // Canonical
    const canonicalUrl = data.url ? `${this.baseUrl}${data.url}` : this.baseUrl;
    this.updateCanonical(canonicalUrl);

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: data.image || this.defaultImage });
    this.meta.updateTag({ property: 'og:type', content: data.type || 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });
    this.meta.updateTag({ property: 'og:locale', content: 'en_US' });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });
    this.meta.updateTag({ name: 'twitter:image', content: data.image || this.defaultImage });

    // Article-specific OG
    if (data.type === 'article' && data.article) {
      if (data.article.publishedTime) {
        this.meta.updateTag({ property: 'article:published_time', content: data.article.publishedTime });
      }
      if (data.article.author) {
        this.meta.updateTag({ property: 'article:author', content: data.article.author });
      }
      if (data.article.section) {
        this.meta.updateTag({ property: 'article:section', content: data.article.section });
      }
    }
  }

  /**
   * Inject JSON-LD structured data into the page <head>.
   * Removes any previous JSON-LD block first.
   */
  setJsonLd(data: object): void {
    // Remove existing
    const existing = this.doc.head.querySelector('script[type="application/ld+json"]');
    if (existing) {
      existing.remove();
    }

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }

  /**
   * Set Organization + SoftwareApplication structured data (for homepage).
   */
  setOrganizationSchema(): void {
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${this.baseUrl}/#organization`,
          'name': 'Terroir AI',
          'url': this.baseUrl,
          'logo': {
            '@type': 'ImageObject',
            'url': `${this.baseUrl}/assets/logo.svg`,
          },
          'description': 'Real-time iPhone-based computer vision for specialty crop intelligence. Optimize labor, forecast yield, and manage disease.',
          'sameAs': [],
          'contactPoint': {
            '@type': 'ContactPoint',
            'email': 'hello@terroirai.com',
            'contactType': 'sales',
          },
        },
        {
          '@type': 'SoftwareApplication',
          'name': 'Terroir AI Field Fitness Tracker',
          'operatingSystem': 'iOS',
          'applicationCategory': 'BusinessApplication',
          'description': 'iPhone-based computer vision that maps yield variation, detects disease, and optimizes labor deployment for specialty crop farmers.',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
            'description': 'Free trial available',
          },
          'publisher': { '@id': `${this.baseUrl}/#organization` },
        },
        {
          '@type': 'WebSite',
          '@id': `${this.baseUrl}/#website`,
          'url': this.baseUrl,
          'name': 'Terroir AI',
          'publisher': { '@id': `${this.baseUrl}/#organization` },
        },
      ],
    });
  }

  /**
   * Set Article structured data (for blog posts).
   */
  setArticleSchema(article: {
    title: string;
    description: string;
    url: string;
    image?: string;
    datePublished?: string;
    dateModified?: string;
    author?: string;
  }): void {
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.title,
      'description': article.description,
      'image': article.image || this.defaultImage,
      'url': `${this.baseUrl}${article.url}`,
      'datePublished': article.datePublished,
      'dateModified': article.dateModified || article.datePublished,
      'author': {
        '@type': 'Organization',
        'name': article.author || 'Terroir AI Team',
        'url': this.baseUrl,
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Terroir AI',
        'logo': {
          '@type': 'ImageObject',
          'url': `${this.baseUrl}/assets/logo.svg`,
        },
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${this.baseUrl}${article.url}`,
      },
    });
  }

  /**
   * Set FAQ structured data.
   */
  setFaqSchema(faqs: { question: string; answer: string }[]): void {
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map((faq) => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer,
        },
      })),
    });
  }

  /**
   * Set BreadcrumbList structured data for navigation hierarchy.
   */
  setBreadcrumbSchema(items: { name: string; url: string }[]): void {
    const breadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, i) => ({
        '@type': 'ListItem',
        'position': i + 1,
        'name': item.name,
        'item': `${this.baseUrl}${item.url}`,
      })),
    };
    // Append as second script tag (don't replace Article schema)
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'breadcrumb');
    script.text = JSON.stringify(breadcrumbs);
    // Remove previous breadcrumb if exists
    const existing = this.doc.head.querySelector('script[data-schema="breadcrumb"]');
    if (existing) existing.remove();
    this.doc.head.appendChild(script);
  }

  private updateCanonical(url: string): void {
    let link = this.doc.head.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
