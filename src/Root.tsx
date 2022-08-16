import React from 'react';
import { persistor, store } from 'stores/index';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { WebViewProvider } from 'providers/WebViewProvider';
import App from './App';

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

export default Root;
