import React from 'react';
import App from './App';
import { WebRunnerProvider } from './providers/WebRunnerProvider/WebRunnerProvider';
import { DataContextProvider } from 'providers/DataContext';
import { enableScreens } from 'react-native-screens';

enableScreens(false);

export const Root = () => {
  return (
    <WebRunnerProvider>
      <DataContextProvider>
        <App />
      </DataContextProvider>
    </WebRunnerProvider>
  );
};
// const codePushOption = { checkFrequency: codePush.CheckFrequency.MANUAL };
export default Root;
