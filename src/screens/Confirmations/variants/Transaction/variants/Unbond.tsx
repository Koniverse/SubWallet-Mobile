import { ConfirmationContent } from 'components/common/Confirmation';
import React from 'react';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { BaseTransactionConfirmationProps } from 'screens/Confirmations/variants/Transaction/variants/Base';
import { RequestBondingSubmit } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';

type Props = BaseTransactionConfirmationProps;

const UnbondTransactionConfirmation = ({ transaction }: Props) => {
  const data = transaction.data as RequestBondingSubmit;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  return (
    <ConfirmationContent isFullHeight>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo style={{ marginTop: 12 }} hasBackgroundWrapper>
        <MetaInfo.Number
          decimals={decimals}
          label={i18n.inputLabel.unstakeAmount}
          suffix={symbol}
          value={data.amount}
        />
        <MetaInfo.Number
          decimals={decimals}
          label={i18n.inputLabel.estimatedFee}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
    </ConfirmationContent>
  );
};

export default UnbondTransactionConfirmation;
