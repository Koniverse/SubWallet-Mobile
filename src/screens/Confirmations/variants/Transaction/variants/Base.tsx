import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import React from 'react';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';

export interface BaseTransactionConfirmationProps {
  transaction: SWTransactionResult;
}

export const BaseTransactionConfirmation: React.FC<BaseTransactionConfirmationProps> = ({
  transaction,
}: BaseTransactionConfirmationProps) => {
  return (
    <ConfirmationContent>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />
    </ConfirmationContent>
  );
};
