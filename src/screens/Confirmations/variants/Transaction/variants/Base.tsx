import React from 'react';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { Text } from 'react-native';

export interface BaseTransactionConfirmationProps {
  transaction: SWTransactionResult;
}

export const BaseTransactionConfirmation = ({ transaction }: BaseTransactionConfirmationProps) => {
  return <Text>{transaction.extrinsicType}</Text>;
};
