import React from 'react';
import { View } from 'react-native';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import MetaInfo from 'components/MetaInfo';
import { RequestStakeClaimReward } from '@subwallet/extension-base/background/KoniTypes';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { BaseTransactionConfirmationProps } from 'screens/Confirmations/Transaction/variants/Base';
import { Typography } from 'components/design-system-ui';
import { FontMedium } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

type Props = BaseTransactionConfirmationProps;

export const ClaimRewardTransactionConfirmation = ({ transaction }: Props) => {
  const data = transaction.data as RequestStakeClaimReward;
  const theme = useSubWalletTheme().swThemes;
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo style={{ marginVertical: 12 }} hasBackgroundWrapper>
        {data.unclaimedReward && (
          <MetaInfo.Number
            decimals={decimals}
            label={'Unclaimed reward'}
            suffix={symbol}
            value={data.unclaimedReward}
          />
        )}
        <MetaInfo.Number
          decimals={decimals}
          label={'Estimated fee'}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>

      <Typography.Text style={{ color: theme.colorTextTertiary, textAlign: 'center', ...FontMedium }}>
        {'Your rewards will be bonded back into the pool'}
      </Typography.Text>
    </View>
  );
};
