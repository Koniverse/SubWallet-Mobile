import { QrScannerContext } from 'providers/contexts';
import { useContext } from 'react';

export function useQrScanner() {
  return useContext(QrScannerContext);
}
