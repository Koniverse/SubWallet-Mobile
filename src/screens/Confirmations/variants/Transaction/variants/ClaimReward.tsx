// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestStakeClaimReward } from '@subwallet/extension-base/background/KoniTypes';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { ConfirmationContent } from 'components/common/Confirmation';
import MetaInfo from 'components/MetaInfo';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React from 'react';
import { Text } from 'react-native';

import { BaseTransactionConfirmationProps } from './Base';

type Props = BaseTransactionConfirmationProps;

const ClaimRewardTransactionConfirmation: React.FC<Props> = (props: Props) => {
  const { transaction } = props;
  const data = transaction.data as RequestStakeClaimReward;

  const theme = useSubWalletTheme().swThemes;

  const { decimals, symbol } = useGetNativeTokenBasicInfo(data.chain);

  return (
    <ConfirmationContent>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />
      <MetaInfo hasBackgroundWrapper>
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
          label={'Transaction fee'}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>

      <Text style={{ color: theme.colorTextLight4 }}>
        {data.bondReward
          ? 'Your rewards will be bonded back into the pool'
          : 'Claimed rewards would be immediately added to your account as transferable balance'}
      </Text>
    </ConfirmationContent>
  );
};

export default ClaimRewardTransactionConfirmation;
