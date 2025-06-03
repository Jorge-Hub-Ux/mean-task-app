import { ApplicationConfig, LOCALE_ID, provideExperimentalZonelessChangeDetection, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { DatePipe } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors/error/error.interceptor';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { es } from 'date-fns/locale';
import { MAT_DATE_CUSTOM_FORMATS } from './shared/utils/config/date-adapters';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
        onSameUrlNavigation: 'reload',
      }),
    ),
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor])),
    provideExperimentalZonelessChangeDetection(),
    provideEnvironmentNgxMask(),
    provideAnimationsAsync(),
    { provide: DateAdapter, useClass: DateFnsAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_DATE_CUSTOM_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: es },
    { provide: LOCALE_ID, useValue: 'es-CO' },
    DatePipe,

  ],
};
