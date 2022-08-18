import React from 'react';
import { persistor, store } from 'stores/index';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { WebRunnerProvider } from 'providers/WebRunnerProvider/WebRunnerProvider';
import App from './App';

export const Root = () => {
  return (
    <WebRunnerProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </WebRunnerProvider>
  );
};

export default Root;
