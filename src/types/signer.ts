export enum SIGN_MODE {
  PASSWORD = 'password',
  QR = 'qr',
  LEDGER = 'ledger',
  READ_ONLY = 'readonly',
  ALL_ACCOUNT = 'ALL_ACCOUNT',
  UNKNOWN = 'unknown',
}

export interface BaseSignProps {
  baseProps: {
    buttonText?: string;
    cancelText?: string;
    onCancel?: () => Promise<void> | void;
    submitText?: string;
  };
}

export interface SigData {
  signature: `0x${string}`;
}
