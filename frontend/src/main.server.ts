import { mergeApplicationConfig } from '@angular/core';
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { serverConfig } from './app/app.config.server';
import {
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { routes } from './app/app.routes';

const clientConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withViewTransitions()
    ),
    provideHttpClient(withFetch()),
    provideClientHydration(
      withHttpTransferCacheOptions({ includePostRequests: false })
    ),
    provideAnimationsAsync(),
  ],
};

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(AppComponent, mergeApplicationConfig(clientConfig, serverConfig), context);

export default bootstrap;
