import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { RootStackParamList } from 'routes/index';
import React from 'react';

export type QrValue = string | undefined;

export interface QrResult {
  rawData?: QrValue;
  type?: 'text' | 'json'; //Todo: Add more type like Account, Tx....
  data?: string | object;
}

export interface QrCallBackMap {
  onScanned?: (rs: QrResult) => void;
  onClosed?: (rs: QrResult) => void;
}

export interface QrScannerProviderProps {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
  children?: React.ReactNode;
}
