import { QrState } from '@subwallet/extension-base/signers/types';
import React, { useCallback, useReducer } from 'react';

export enum QrStep {
  TRANSACTION_INFO,
  DISPLAY_PAYLOAD,
  SCAN_QR,
  SENDING_TX,
}

export interface QrContextState extends QrState {
  step: QrStep;
}

interface QrContextType {
  qrState: QrContextState;
  updateQrState: (value: Partial<QrContextState>) => void;
  cleanQrState: () => void;
}

const DEFAULT_STATE: QrContextState = {
  isQrHashed: false,
  qrAddress: '',
  qrPayload: '0x',
  isEthereum: false,
  qrId: '',
  step: QrStep.TRANSACTION_INFO,
};

export const QrSignerContext = React.createContext({} as QrContextType);

interface QrContextProviderProps {
  children?: React.ReactElement;
}

enum QrReducerType {
  UPDATE,
  INIT,
}

interface QrReducerPayload {
  type: QrReducerType;
  payload: Partial<QrContextState>;
}

const initState = (state: QrContextState): QrContextState => {
  return {
    ...state,
  };
};

const reducer = (oldState: QrContextState, data: QrReducerPayload): QrContextState => {
  switch (data.type) {
    case QrReducerType.UPDATE:
      return {
        ...oldState,
        ...data.payload,
      };
    case QrReducerType.INIT:
      return initState(data.payload as QrContextState);
    default:
      return oldState;
  }
};

export const QrSignerContextProvider = ({ children }: QrContextProviderProps) => {
  const [qrState, setQrState] = useReducer(reducer, DEFAULT_STATE, initState);

  const updateQrState = useCallback((data: Partial<QrContextState>) => {
    setQrState({ type: QrReducerType.UPDATE, payload: data });
  }, []);

  const cleanQrState = useCallback(() => {
    setQrState({ type: QrReducerType.INIT, payload: DEFAULT_STATE });
  }, []);

  return (
    <QrSignerContext.Provider
      value={{
        qrState: qrState,
        updateQrState: updateQrState,
        cleanQrState: cleanQrState,
      }}>
      {children}
    </QrSignerContext.Provider>
  );
};
