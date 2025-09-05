import { ConfirmationDefinitions, ConfirmationDefinitionsTon } from '@subwallet/extension-base/background/KoniTypes';

export type EvmSignatureSupportType = keyof Pick<
  ConfirmationDefinitions,
  'evmSignatureRequest' | 'evmSendTransactionRequest' | 'evmWatchTransactionRequest'
>;

export type EvmErrorSupportType = keyof Pick<ConfirmationDefinitions, 'errorConnectNetwork'>;
export type SubmitApiType = keyof Pick<ConfirmationDefinitions, 'submitApiRequest'>;
export type TonSignatureSupportType = keyof Pick<
  ConfirmationDefinitionsTon,
  'tonSignatureRequest' | 'tonWatchTransactionRequest' | 'tonSendTransactionRequest'
>;
