export enum AccountSignMode {
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
    extraLoading?: boolean;
  };
}

export interface HashPayloadProps {
  address: string;
  genesisHash: string;
  hashPayload: Uint8Array;
  isMessage: boolean;
  isEthereum: boolean;
  isHash: boolean;
}

export interface SigData {
  signature: `0x${string}`;
}
