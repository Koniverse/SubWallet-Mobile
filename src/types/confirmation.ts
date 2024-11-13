import { ConfirmationDefinitions, ConfirmationDefinitionsTon } from '@subwallet/extension-base/background/KoniTypes';

export type EvmSignatureSupportType = keyof Pick<
  ConfirmationDefinitions,
  'evmSignatureRequest' | 'evmSendTransactionRequest' | 'evmWatchTransactionRequest'
>;

export type EvmErrorSupportType = keyof Pick<ConfirmationDefinitions, 'errorConnectNetwork'>;
export type TonSignatureSupportType = keyof Pick<
  ConfirmationDefinitionsTon,
  'tonSignatureRequest' | 'tonWatchTransactionRequest' | 'tonSendTransactionRequest'
>;
