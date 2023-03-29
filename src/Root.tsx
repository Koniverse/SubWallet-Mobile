import React from 'react';
import { WebRunnerProvider } from 'providers/WebRunnerProvider/WebRunnerProvider';
import { DataContextProvider } from 'providers/DataContext';
import AppNew from './AppNew';

export const Root = () => {
  return (
    <WebRunnerProvider>
      <DataContextProvider>
        <AppNew />
      </DataContextProvider>
    </WebRunnerProvider>
  );
};

export default Root;
