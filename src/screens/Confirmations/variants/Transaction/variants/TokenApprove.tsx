// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TokenSpendingApprovalParams } from '@subwallet/extension-base/types';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import MetaInfo from 'components/MetaInfo';
import React, { useMemo } from 'react';

import { BaseTransactionConfirmationProps } from './Base';
import i18n from 'utils/i18n/i18n';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _getAssetPriceId } from '@subwallet/extension-base/services/chain-service/utils';
import { BN_TEN } from '@subwallet/extension-base/utils';
import { Number as SwNumber } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import BigN from 'bignumber.js';
import { StyleSheet, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';

type Props = BaseTransactionConfirmationProps;

const TokenApproveConfirmation: React.FC<Props> = (props: Props) => {
  const { transaction } = props;
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);

  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const { currencyData, priceMap } = useSelector((root: RootState) => root.price);
  const txParams = useMemo(
    (): TokenSpendingApprovalParams => transaction.data as TokenSpendingApprovalParams,
    [transaction.data],
  );

  const convertedFeeValueToUSD = useMemo(() => {
    if (!transaction.estimateFee?.value) {
      return 0;
    }

    const nativeTokenInfo = assetRegistryMap[`${transaction.chain}-NATIVE-${symbol}`];
    const tokenPrice = priceMap[_getAssetPriceId(nativeTokenInfo)] || 0;

    return new BigN(transaction.estimateFee.value)
      .multipliedBy(tokenPrice)
      .dividedBy(BN_TEN.pow(decimals || 0))
      .toNumber();
  }, [assetRegistryMap, decimals, priceMap, symbol, transaction.chain, transaction.estimateFee?.value]);

  return (
    <ConfirmationContent isFullHeight isTransaction transaction={transaction}>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />
      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account address={txParams.contractAddress} label={'Contract'} />

        <MetaInfo.Account address={txParams.spenderAddress} label={'Spender contract'} />

        <MetaInfo.Default label={i18n.inputLabel.estimatedFee} labelAlign={'top'}>
          <View style={stylesheet.valueWrapper}>
            <SwNumber
              size={14}
              decimal={decimals}
              suffix={symbol}
              value={transaction.estimateFee?.value || 0}
              unitColor={theme.colorTextLight3}
            />
            <SwNumber
              size={12}
              decimal={0}
              value={convertedFeeValueToUSD}
              prefix={`~ ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
              suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
              unitColor={theme.colorTextTertiary}
              intColor={theme.colorTextTertiary}
              decimalColor={theme.colorTextTertiary}
            />
          </View>
        </MetaInfo.Default>
      </MetaInfo>
    </ConfirmationContent>
  );
};

function createStylesheet(theme: ThemeTypes) {
  return StyleSheet.create({
    valueWrapper: {
      alignItems: 'flex-end',
      gap: theme.sizeXXS,
    },
  });
}

export default TokenApproveConfirmation;
