import * as Sentry from "@sentry/react-native";
import React from 'react';
import { persistor, store } from 'stores/index';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import App from './App';
import { WebViewProvider } from 'providers/WebViewProvider';

Sentry.init({
  dsn: 'https://o1330554.ingest.sentry.io/6593484',
  environment: 'production',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
});

export const Root = () => {
  return (
    <WebViewProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </WebViewProvider>
  );
};

export default Sentry.wrap(Root);
