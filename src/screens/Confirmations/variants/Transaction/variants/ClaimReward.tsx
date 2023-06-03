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
import i18n from 'utils/i18n/i18n';

type Props = BaseTransactionConfirmationProps;

const ClaimRewardTransactionConfirmation: React.FC<Props> = (props: Props) => {
  const { transaction } = props;
  const data = transaction.data as RequestStakeClaimReward;

  const theme = useSubWalletTheme().swThemes;

  const { decimals, symbol } = useGetNativeTokenBasicInfo(data.chain);

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
