import { ConfirmationContent } from 'components/common/Confirmation';
import React from 'react';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { BaseTransactionConfirmationProps } from 'screens/Confirmations/variants/Transaction/variants/Base';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { RequestYieldStepSubmit, SubmitJoinNominationPool } from '@subwallet/extension-base/types';

type Props = BaseTransactionConfirmationProps;

// todo: i18n AlertBox
const StakeTransactionConfirmation = ({ transaction }: Props) => {
  const requestData = transaction.data as RequestYieldStepSubmit;
  const data = requestData.data as SubmitJoinNominationPool;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  return (
    <ConfirmationContent isFullHeight isTransaction transaction={transaction}>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account address={data.selectedPool.address} label={i18n.inputLabel.pool} networkPrefix={42} />
        <MetaInfo.Number decimals={decimals} label={i18n.inputLabel.amount} suffix={symbol} value={data.amount} />
        <MetaInfo.Number
          decimals={decimals}
          label={i18n.inputLabel.estimatedFee}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>

      <AlertBox
        title={'Your staked funds will be locked'}
        description={
          'Once staked, your funds will be locked and become non-transferable. To unlock your funds, you need to unstake manually, wait for the unstaking period to end and then withdraw manually.'
        }
        type={'warning'}
      />
    </ConfirmationContent>
  );
};

export default StakeTransactionConfirmation;
