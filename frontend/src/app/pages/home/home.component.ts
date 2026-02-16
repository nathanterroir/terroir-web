import { Component, inject, OnInit } from '@angular/core';
import { HeroComponent } from '@app/components/hero/hero.component';
import { FeaturesComponent } from '@app/components/features/features.component';
import { TechnologyComponent } from '@app/components/technology/technology.component';
import { LaborSectionComponent } from '@app/components/labor-section/labor-section.component';
import { RegulatoryComponent } from '@app/components/regulatory/regulatory.component';
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
    RegulatoryComponent,
    CtaComponent,
  ],
  template: `
    <app-hero />
    <app-features />
    <app-labor-section />
    <app-technology />
    <app-regulatory />
    <app-cta />
  `,
})
export class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit() {
    this.seo.updateSeo({
      title: 'Terroir AI — Real-Time Field Intelligence for Specialty Crops',
      description:
        'iPhone-based computer vision that maps yield variation, detects disease, and optimizes labor deployment in real time. The Field Fitness Tracker for specialty crop farmers.',
      url: '/',
      image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?q=80&w=1200&auto=format&fit=crop',
    });

    this.seo.setOrganizationSchema();

    // FAQ schema for homepage — targets common search queries
    this.seo.setFaqSchema([
      {
        question: 'How does Terroir AI work?',
        answer:
          'Mount one or more iPhones to your ATV or tractor. As you drive, our app captures 30+ frames per second, applies real-time AI segmentation to identify clusters and disease, and tags each frame with GPS coordinates. No cloud upload required — all processing happens on-device.',
      },
      {
        question: 'What crops does Terroir AI support?',
        answer:
          'Terroir AI works with wine grapes, table grapes, avocados, citrus, cherries, and other specialty crops. Our computer vision models are trained on diverse crop types and can identify yield variation, disease pressure, and canopy health across all of them.',
      },
      {
        question: 'How does Terroir AI help reduce labor costs?',
        answer:
          'By creating heatmaps of stress and disease, Terroir AI enables directed scouting — sending crews only to hotspots instead of walking every row. This can reduce scouting hours by up to 50%. Yield variation maps also help size crews accurately for harvest, preventing over-hiring.',
      },
    ]);
  }
}
