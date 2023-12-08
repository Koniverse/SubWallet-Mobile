import React from 'react';
import { WebRunnerProvider } from 'providers/WebRunnerProvider/WebRunnerProvider';
import { DataContextProvider } from 'providers/DataContext';
import App from './App';

export const Root = () => {
  return (
    <WebRunnerProvider>
      <DataContextProvider>
        <App />
      </DataContextProvider>
    </WebRunnerProvider>
  );
};

export default Root;
