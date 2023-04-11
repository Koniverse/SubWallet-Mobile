import React from 'react';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { View } from 'react-native';

export interface BaseTransactionConfirmationProps {
  transaction: SWTransactionResult;
}

export const BaseTransactionConfirmation = ({ transaction }: BaseTransactionConfirmationProps) => {
  return <View>{transaction.extrinsicType}</View>;
};
