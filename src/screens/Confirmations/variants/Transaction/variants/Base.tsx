import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import React from 'react';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { VoidFunction } from 'types/index';
import { ConfirmModalInfo } from 'providers/AppModalContext';

export interface BaseTransactionConfirmationProps {
  transaction: SWTransactionResult;
  openAlert: React.Dispatch<React.SetStateAction<ConfirmModalInfo>>;
  closeAlert: VoidFunction;
}

export const BaseTransactionConfirmation: React.FC<BaseTransactionConfirmationProps> = ({
  transaction,
}: BaseTransactionConfirmationProps) => {
  return (
    <ConfirmationContent isTransaction transaction={transaction}>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />
    </ConfirmationContent>
  );
};
