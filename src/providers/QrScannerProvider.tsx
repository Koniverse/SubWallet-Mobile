import React, { useCallback, useState } from 'react';
import { QrScannerContext } from './contexts';
import { QrCallBackMap, QrResult, QrScannerProviderProps, QrValue } from 'types/QRScanner';

const QR_RESULT_DEFAULT: QrResult = {
  rawData: undefined,
  type: 'text',
  data: undefined,
};

const callbackMap: QrCallBackMap = {};

export const QrScannerProvider = ({
  children,
  navigationRef,
}: QrScannerProviderProps): React.ReactElement<QrScannerProviderProps> => {
  const [value, setValue] = useState<QrValue>(undefined);
  const [result, setResult] = useState<QrResult>({ ...QR_RESULT_DEFAULT });
  const [status, setStatus] = useState<'off' | 'scanning' | 'scanned'>('off');

  const open = ({ onScanned, onClosed }: QrCallBackMap) => {
    callbackMap.onScanned = onScanned;
    callbackMap.onClosed = onClosed;
    setStatus('scanning');
    navigationRef.navigate('QrScanner');
  };

  const _generateQrResult = useCallback(
    (val: QrValue) => {
      setValue(val);
      if (val === undefined) {
        setResult({ ...QR_RESULT_DEFAULT });
        return;
      }

      try {
        // @ts-ignore
        const data = JSON.parse(val);
        setResult({ ...result, rawData: val, type: 'json', data });
      } catch (e) {
        setResult({ ...result, rawData: val, type: 'text', data: val });
      }
    },
    [result],
  );

  const _onScanned = useCallback(
    (val: QrValue) => {
      setStatus('scanned');
      _generateQrResult(val);
      callbackMap.onScanned && callbackMap.onScanned(result);
    },
    [result, _generateQrResult],
  );

  const _onClosed = useCallback(() => {
    callbackMap.onClosed && callbackMap.onClosed(result);
    setValue(undefined);
    setStatus('off');
    callbackMap.onScanned = () => {};
    callbackMap.onClosed = () => {};
    navigationRef.goBack();
  }, [navigationRef, result]);

  return (
    <QrScannerContext.Provider
      value={{
        value,
        status,
        open,
        onScanned: _onScanned,
        onClosed: _onClosed,
      }}>
      {children}
    </QrScannerContext.Provider>
  );
};
