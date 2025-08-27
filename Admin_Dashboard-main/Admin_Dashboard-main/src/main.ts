import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';  // <-- note the double app/app here
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes),   provideHttpClient()]
}).catch(err => console.error(err));
