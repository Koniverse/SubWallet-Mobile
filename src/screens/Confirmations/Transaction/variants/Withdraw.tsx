import React from 'react';
import { View } from 'react-native';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import MetaInfo from 'components/MetaInfo';
import { RequestStakeWithdrawal } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { BaseTransactionConfirmationProps } from 'screens/Confirmations/Transaction/variants/Base';

type Props = BaseTransactionConfirmationProps;

export const WithdrawTransactionConfirmation = ({ transaction }: Props) => {
  const data = transaction.data as RequestStakeWithdrawal;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo style={{ marginVertical: 12 }} hasBackgroundWrapper>
        <MetaInfo.Number
          decimals={decimals}
          label={'Withdrawal amount'}
          suffix={symbol}
          value={data.unstakingInfo.claimable}
        />

        <MetaInfo.Number
          decimals={decimals}
          label={'Withdrawal fee'}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
    </View>
  );
};
