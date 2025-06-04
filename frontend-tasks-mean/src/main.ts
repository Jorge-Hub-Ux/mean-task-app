import { bootstrapApplication } from '@angular/platform-browser';
import { setDefaultOptions } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
setDefaultOptions({ locale: es });
bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
