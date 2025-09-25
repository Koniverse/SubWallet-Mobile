import { ConfirmationContent } from 'components/common/Confirmation';
import React from 'react';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { BaseTransactionConfirmationProps } from 'screens/Confirmations/variants/Transaction/variants/Base';
import { RequestUnbondingSubmit } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import AlertBox from 'components/design-system-ui/alert-box/simple';

type Props = BaseTransactionConfirmationProps;

const UnbondTransactionConfirmation = ({ transaction }: Props) => {
  const data = transaction.data as RequestUnbondingSubmit;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const subnetSymbol = data.poolInfo?.metadata.subnetData?.subnetSymbol;
  const stakingFee = data.stakingFee;

  return (
    <ConfirmationContent isFullHeight isTransaction transaction={transaction}>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo style={{ marginTop: 12 }} hasBackgroundWrapper>
        <MetaInfo.Number
          decimals={decimals}
          label={i18n.inputLabel.unstakeAmount}
          suffix={subnetSymbol || symbol}
          value={data.amount}
        />
        <MetaInfo.Number
          decimals={decimals}
          label={i18n.inputLabel.estimatedFee}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>

      {!!stakingFee && (
        <AlertBox
          title={'TAO unstaking fee'}
          description={`An unstaking fee of ${stakingFee} TAO will be deducted from your unstaked amount once the transaction is complete`}
          type={'info'}
        />
      )}
    </ConfirmationContent>
  );
};

export default UnbondTransactionConfirmation;
