import { QrScannerContext } from 'providers/contexts';
import { useContext } from 'react';

export const useQrScanner = () => {
  return useContext(QrScannerContext);
};
