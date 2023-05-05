import { ConfirmationContent } from 'components/common/Confirmation';
import React from 'react';
import { View } from 'react-native';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { BaseTransactionConfirmationProps } from 'screens/Confirmations/variants/Transaction/variants/Base';
import { RequestBondingSubmit, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import MetaInfo from 'components/MetaInfo';

type Props = BaseTransactionConfirmationProps;

const BondTransactionConfirmation = ({ transaction }: Props) => {
  const data = transaction.data as RequestBondingSubmit;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const addressList = data.selectedValidators.map(validator => validator.address);

  return (
    <ConfirmationContent isFullHeight>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo style={{ marginTop: 12 }} hasBackgroundWrapper>
        <MetaInfo.AccountGroup
          addresses={addressList}
          content={`${data.selectedValidators.length} selected validators`}
          label={data.type === StakingType.POOLED ? 'Pool' : 'Validators'}
        />

        <MetaInfo.Number decimals={decimals} label={'Amount'} suffix={symbol} value={data.amount} />
        <MetaInfo.Number
          decimals={decimals}
          label={'Estimated fee'}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>
    </ConfirmationContent>
  );
};

export default BondTransactionConfirmation;
