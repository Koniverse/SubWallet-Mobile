import React from 'react';
import { persistor, store } from 'stores/index';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { WebViewProvider } from 'providers/WebViewProvider';
import EntryGate from './EntryGate';

export const Root = () => {
  return (
    <WebViewProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <EntryGate />
        </PersistGate>
      </Provider>
    </WebViewProvider>
  );
};

export default Root;
