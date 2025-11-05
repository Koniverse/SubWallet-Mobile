import React, { useEffect } from 'react';
import { WebRunnerProvider } from 'providers/WebRunnerProvider/WebRunnerProvider';
import { DataContextProvider } from 'providers/DataContext';
import App from './App';
import codePush from 'react-native-code-push';
import { Platform } from 'react-native';
import env from 'react-native-config';
import { setupApiSDK } from '@subwallet/extension-base/utils';

export const ANDROID_CODEPUSH_KEY = env.ANDROID_CODEPUSH_KEY;
export const IOS_CODEPUSH_KEY = env.IOS_CODEPUSH_KEY;

export const Root = () => {
  // Setup API SDK before app init
  setupApiSDK();
  useEffect(() => {
    codePush.sync({
      installMode: codePush.InstallMode.ON_NEXT_RESUME,
      minimumBackgroundDuration: 600,
      deploymentKey: Platform.OS === 'ios' ? IOS_CODEPUSH_KEY : ANDROID_CODEPUSH_KEY,
    });
  }, []);
  return (
    <WebRunnerProvider>
      <DataContextProvider>
        <App />
      </DataContextProvider>
    </WebRunnerProvider>
  );
};
const codePushOption = { checkFrequency: codePush.CheckFrequency.MANUAL };
export default codePush(codePushOption)(Root);
