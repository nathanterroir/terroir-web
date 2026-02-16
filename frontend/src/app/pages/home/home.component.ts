import { Component, inject, OnInit } from '@angular/core';
import { HeroComponent } from '@app/components/hero/hero.component';
import { FeaturesComponent } from '@app/components/features/features.component';
import { TechnologyComponent } from '@app/components/technology/technology.component';
import { LaborSectionComponent } from '@app/components/labor-section/labor-section.component';
import { CtaComponent } from '@app/components/cta/cta.component';
import { SeoService } from '@app/services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    FeaturesComponent,
    TechnologyComponent,
    LaborSectionComponent,
    CtaComponent,
  ],
  template: `
    <app-hero />
    <app-features />
    <app-labor-section />
    <app-technology />
    <app-cta />
  `,
})
export class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit() {
    this.seo.updateSeo({
      title: 'Terroir AI — Precision Labor Intelligence for Specialty Crops',
      description:
        'Apply for the 2026 pilot program. iPhone-based computer vision that turns a single drive through your rows into a labor deployment plan — crew sizes, spray priorities, harvest logistics. Limited to 20 farms.',
      url: '/',
      image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?q=80&w=1200&auto=format&fit=crop',
    });

    this.seo.setOrganizationSchema();

    // FAQ schema for homepage — targets common search queries
    this.seo.setFaqSchema([
      {
        question: 'How does Terroir AI reduce labor costs?',
        answer:
          'Terroir AI uses iPhone-based computer vision to create plant-level maps of yield, disease, and crop load. These maps power variable rate labor deployment — sending the right number of workers to each block based on actual data, not gut feel. Growers typically see a 30% reduction in labor costs.',
      },
      {
        question: 'What is Precision Labor Intelligence?',
        answer:
          'Precision Labor Intelligence turns a single drive through your rows into a complete labor deployment plan — directed scouting assignments, variable crew sizing per block, spray priorities, and harvest logistics. All processing happens on-device at 30+ frames per second with no cloud upload required.',
      },
      {
        question: 'How does Terroir AI help with harvest labor planning?',
        answer:
          'By counting and sizing fruit across your operation, Terroir AI generates yield forecasts grounded in actual data. This lets you right-size H-2A crews weeks in advance, prevent over-hiring, and allocate bins and equipment precisely where they are needed.',
      },
    ]);
  }
}
