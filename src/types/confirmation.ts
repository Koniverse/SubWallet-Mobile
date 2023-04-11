import { ConfirmationDefinitions } from '@subwallet/extension-base/background/KoniTypes';

export type EvmSignatureSupportType = keyof Pick<
  ConfirmationDefinitions,
  'evmSignatureRequest' | 'evmSendTransactionRequest'
>;
