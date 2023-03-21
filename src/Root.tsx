import React, { useEffect } from 'react';
import { WebRunnerProvider } from 'providers/WebRunnerProvider/WebRunnerProvider';
import { DataContextProvider } from 'providers/DataContext';
import AppNew from './AppNew';
import { Text } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

export const Root = () => {
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 2000);
  }, []);

  return (
    <WebRunnerProvider>
      <DataContextProvider>
        <AppNew />
      </DataContextProvider>
    </WebRunnerProvider>
  );
};

export default Root;
