// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestStakeClaimReward } from '@subwallet/extension-base/types';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import { ConfirmationContent } from 'components/common/Confirmation';
import MetaInfo from 'components/MetaInfo';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { useBuildAlertModalInfo } from 'hooks/modal/useAlertModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

import { BaseTransactionConfirmationProps } from './Base';
import i18n from 'utils/i18n/i18n';
import BigN from 'bignumber.js';

type Props = BaseTransactionConfirmationProps;

const ClaimRewardTransactionConfirmation: React.FC<Props> = (props: Props) => {
  // openAlert/closeAlert come down as props, not from useAlertModal: on Android the confirmation
  // content is teleported through a <Portal> (screens/Confirmations/index.tsx) and renders above
  // AppModalContextProvider, where useContext(AppModalContext) only ever returns the default {}.
  const { closeAlert, openAlert, transaction } = props;
  const data = transaction.data as RequestStakeClaimReward;

  const theme = useSubWalletTheme().swThemes;

  const { poolInfoMap } = useSelector((state: RootState) => state.earning);
  const poolInfo = poolInfoMap[data.slug];

  const { decimals, symbol } = useGetNativeTokenBasicInfo(poolInfo?.chain);
  const buildAlertModalInfo = useBuildAlertModalInfo();

  useEffect(() => {
    const isRewardLteFee = new BigN(data.unclaimedReward || 0).lte(transaction.estimateFee?.value || 0);
    const isRewardLtFee = new BigN(data.unclaimedReward || 0).lt(transaction.estimateFee?.value || 0);

    if (isRewardLteFee) {
      // The app's own alert, like the extension: a native Alert.alert renders the OS dialog, which
      // has no warning page icon and does not follow the wallet's styling at all.
      openAlert(
        buildAlertModalInfo(
          {
            title: i18n.warningTitle.payAttention,
            type: NotificationType.WARNING,
            content: `The rewards you are about to claim are ${
              isRewardLtFee ? 'smaller than' : 'equal to'
            } the transaction fee. This means that you won’t receive any rewards after claiming. Do you wish to continue?`,
            okButton: {
              text: i18n.buttonTitles.iUnderStand,
              onPress: closeAlert,
            },
          },
          closeAlert,
        ),
      );
    }
  }, [buildAlertModalInfo, closeAlert, data.unclaimedReward, openAlert, transaction.estimateFee?.value]);

  return (
    <ConfirmationContent isFullHeight isTransaction transaction={transaction}>
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

        {/* Once wrapped, the fee that gets paid belongs to the wrapping extrinsic. */}
        {!transaction.wrappingStatus && (
          <MetaInfo.Number
            decimals={decimals}
            label={i18n.inputLabel.networkFee}
            suffix={symbol}
            value={transaction.estimateFee?.value || 0}
          />
        )}
      </MetaInfo>

      <Text style={{ color: theme.colorTextLight4 }}>
        {data.bondReward ? i18n.message.claimRewardMessage1 : i18n.message.claimRewardMessage2}
      </Text>
    </ConfirmationContent>
  );
};

export default ClaimRewardTransactionConfirmation;
