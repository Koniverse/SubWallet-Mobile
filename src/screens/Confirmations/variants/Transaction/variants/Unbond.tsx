import { ConfirmationContent } from 'components/common/Confirmation';
import React, { useMemo } from 'react';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { BaseTransactionConfirmationProps } from 'screens/Confirmations/variants/Transaction/variants/Base';
import { RequestBondingSubmit } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import AlertBox from 'components/design-system-ui/alert-box/simple';

type Props = BaseTransactionConfirmationProps;

const UnbondTransactionConfirmation = ({ transaction }: Props) => {
  const data = transaction.data as RequestBondingSubmit;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  const isBittensorChain = useMemo(() => {
    return data.poolInfo?.chain === 'bittensor' || data.poolInfo?.chain === 'bittensor_testnet';
  }, [data.poolInfo?.chain]);

  return (
    <ConfirmationContent isFullHeight isTransaction transaction={transaction}>
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

      {isBittensorChain && (
        <AlertBox
          title={'TAO unstaking fee'}
          description={
            'An unstaking fee of 0.00005 TAO will be deducted from your unstaked amount once the transaction is complete'
          }
          type={'info'}
        />
      )}
    </ConfirmationContent>
  );
};

export default UnbondTransactionConfirmation;
