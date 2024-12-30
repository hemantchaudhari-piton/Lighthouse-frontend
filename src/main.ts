import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import * as Sentry from "@sentry/angular";
import { environment } from './environments/environment.delhi';
import { hmrBootstrap } from 'hmr';

if ( environment.production )
{
    enableProdMode();
}

Sentry.init({
    // dsn: environment.sentryDsn,
    ignoreErrors: ["Previous value: ' is required"],
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: [
        "localhost",
        /^https:\/\/delhi\.lighthouse\.net\.in\//,
        /^https:\/\/rajasthan\.lighthouse\.net\.in\//,
        /^https:\/\/gujarat\.lighthouse\.net\.in\//,
        /^https:\/\/up\.lighthouse\.net\.in\//,
        /^https:\/\/ap\.lighthouse\.net\.in\//
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
});
Sentry.setTag("State", window.location.hostname);

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

if ( environment.hmr )
{
    if ( module['hot'] )
    {
        hmrBootstrap(module, bootstrap);
    }
    else
    {
        console.error('HMR is not enabled for webpack-dev-server!');
        console.log('Are you using the --hmr flag for ng serve?');
    }
}
else
{
    bootstrap().catch(err => console.error(err));
}
