import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { VoidFunction } from 'types/index';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import React from 'react';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import { ConfirmModalInfo } from 'providers/AppModalContext';

export interface BaseProcessConfirmationProps {
  transaction: SWTransactionResult;
  openAlert: React.Dispatch<React.SetStateAction<ConfirmModalInfo>>;
  closeAlert: VoidFunction;
}

const BaseProcessConfirmation = ({ transaction }: BaseProcessConfirmationProps) => {
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  return (
    <ConfirmationContent>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Number
          value={transaction.estimateFee?.value || 0}
          suffix={symbol}
          label={i18n.inputLabel.estimateFee}
          decimals={decimals}
        />
      </MetaInfo>
    </ConfirmationContent>
  );
};

export default BaseProcessConfirmation;
