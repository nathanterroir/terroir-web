import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    // Angular 21: Zoneless change detection (default for new apps)
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withViewTransitions()
    ),
    // Use fetch API for SSR compatibility + enable transfer cache
    provideHttpClient(withFetch()),
    provideClientHydration(
      withHttpTransferCacheOptions({ includePostRequests: false })
    ),
    provideAnimationsAsync(),
  ],
}).catch((err) => console.error(err));
