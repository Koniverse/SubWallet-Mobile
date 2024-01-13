// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestStakeClaimReward } from '@subwallet/extension-base/types';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { ConfirmationContent } from 'components/common/Confirmation';
import MetaInfo from 'components/MetaInfo';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useEffect } from 'react';
import { Alert, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

import { BaseTransactionConfirmationProps } from './Base';
import i18n from 'utils/i18n/i18n';
import BigN from 'bignumber.js';

type Props = BaseTransactionConfirmationProps;

const ClaimRewardTransactionConfirmation: React.FC<Props> = (props: Props) => {
  const { transaction } = props;
  const data = transaction.data as RequestStakeClaimReward;

  const theme = useSubWalletTheme().swThemes;

  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const poolInfo = poolInfoMap[data.slug];

  const { decimals, symbol } = useGetNativeTokenBasicInfo(poolInfo.chain);

  useEffect(() => {
    const isRewardLteFee = new BigN(data.unclaimedReward || 0).lte(transaction.estimateFee?.value || 0);
    const isRewardLtFee = new BigN(data.unclaimedReward || 0).lt(transaction.estimateFee?.value || 0);
    if (isRewardLteFee) {
      Alert.alert(
        'Pay attention!',
        `The rewards you are about to claim are ${
          isRewardLtFee ? 'smaller than' : 'equal'
        } to the transaction fee. This means that you won’t receive any rewards after claiming. Do you wish to continue?`,
        [
          {
            text: 'I understand',
          },
        ],
      );
    }
  }, [data.unclaimedReward, transaction.estimateFee?.value]);

  return (
    <ConfirmationContent isFullHeight>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />
      <MetaInfo hasBackgroundWrapper>
        {data.unclaimedReward && (
          <MetaInfo.Number
            decimals={decimals}
            label={i18n.inputLabel.availableRewards}
            suffix={symbol}
            value={data.unclaimedReward}
          />
        )}

        <MetaInfo.Number
          decimals={decimals}
          label={i18n.inputLabel.estimatedFee}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />
      </MetaInfo>

      <Text style={{ color: theme.colorTextLight4 }}>
        {data.bondReward ? i18n.message.claimRewardMessage1 : i18n.message.claimRewardMessage2}
      </Text>
    </ConfirmationContent>
  );
};

export default ClaimRewardTransactionConfirmation;
