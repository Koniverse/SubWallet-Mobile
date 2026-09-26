import { WebRunnerHandler } from 'providers/WebRunnerProvider/WebRunnerHandler';

/**
 * The one web-runner handler for the app.
 *
 * It lives here rather than in WebRunner.tsx so that code outside the provider (the startup
 * recovery panel) can drive a repair without pulling the WebView module in with it. Importing
 * this module constructs the handler, which registers an AppState listener - so import it lazily
 * from anything App.tsx pulls in at module scope, or that listener jumps ahead of App's own.
 */
export const webRunnerHandler = new WebRunnerHandler();
