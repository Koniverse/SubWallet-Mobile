// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicDataTypeMap, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationContent } from 'components/common/Confirmation';
import MetaInfo from 'components/MetaInfo';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

import { BaseTransactionConfirmationProps } from './Base';
import i18n from 'utils/i18n/i18n';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { _isAcrossChainBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/acrossBridge';
import { isSubstrateCrossChain } from '@subwallet/extension-base/services/balance-service/transfer/xcm/utils';
import QuoteRateDisplay from 'components/Swap/QuoteRateDisplay';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { _getAssetDecimals, _getAssetPriceId, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { BN_TEN } from '@subwallet/extension-base/utils';
import { Number as SwNumber } from 'components/design-system-ui';
import BigN from 'bignumber.js';
import { StyleSheet, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';

type Props = BaseTransactionConfirmationProps;

const TransferBlock: React.FC<Props> = ({ transaction }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const data = transaction.data as ExtrinsicDataTypeMap[ExtrinsicType.TRANSFER_BALANCE];
  const xcmData = transaction.data as ExtrinsicDataTypeMap[ExtrinsicType.TRANSFER_XCM];
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);
  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const { currencyData, priceMap } = useSelector((root: RootState) => root.price);
  const tokenInfo =
    assetRegistryMap[transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM ? xcmData.tokenSlug : data.tokenSlug];

  const isAcrossBridge = useMemo(() => {
    return _isAcrossChainBridge(xcmData.originNetworkKey, xcmData.destinationNetworkKey);
  }, [xcmData.originNetworkKey, xcmData.destinationNetworkKey]);

  const destTokenInfo = useMemo(() => {
    if (isAcrossBridge && xcmData.metadata?.destChainSlug) {
      return assetRegistryMap[xcmData.metadata?.destChainSlug];
    }

    return tokenInfo;
  }, [isAcrossBridge, xcmData.metadata?.destChainSlug, tokenInfo, assetRegistryMap]);

  const chainInfo = useMemo(() => chainInfoMap[transaction.chain], [chainInfoMap, transaction.chain]);

  const receiveChain = useMemo(() => {
    if (xcmData) {
      return xcmData.destinationNetworkKey || transaction.chain;
    } else {
      return transaction.chain;
    }
  }, [transaction.chain, xcmData]);

  const { decimals: nativeTokenDecimals, symbol: nativeTokenSymbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const feeInfo = transaction.estimateFee;
  const crossChainFeeInfo = transaction?.xcmDestinationFee;
  const senderPrefix = useGetChainPrefixBySlug(transaction.chain);
  const network = useMemo(() => chainInfoMap[transaction.chain], [chainInfoMap, transaction.chain]);
  const receiverPrefix = useGetChainPrefixBySlug(receiveChain);

  const priceNativeValue = useMemo(() => {
    const nativeTokenSlug = `${transaction.chain}-NATIVE-${nativeTokenSymbol}`;
    const nativeTokenInfo = assetRegistryMap[nativeTokenSlug];

    return priceMap[_getAssetPriceId(nativeTokenInfo)] || 0;
  }, [assetRegistryMap, nativeTokenSymbol, priceMap, transaction.chain]);

  const transferTokenValue = useMemo(() => {
    return priceMap[_getAssetPriceId(tokenInfo)] || 0;
  }, [priceMap, tokenInfo]);

  const destTransferTokenValue = useMemo(() => {
    return priceMap[_getAssetPriceId(destTokenInfo)] || 0;
  }, [destTokenInfo, priceMap]);

  const convertedFeeValueToUSD = useMemo(() => {
    if (!feeInfo?.value) {
      return 0;
    }

    return new BigN(feeInfo.value)
      .multipliedBy(priceNativeValue)
      .dividedBy(BN_TEN.pow(feeInfo.decimals || nativeTokenDecimals || 0))
      .toNumber();
  }, [feeInfo, nativeTokenDecimals, priceNativeValue]);

  const convertedCrossChainFeeValueToUSD = useMemo(() => {
    if (!crossChainFeeInfo?.value) {
      return 0;
    }

    return new BigN(crossChainFeeInfo.value)
      .multipliedBy(transferTokenValue)
      .dividedBy(BN_TEN.pow(_getAssetDecimals(tokenInfo) || 0))
      .toNumber();
  }, [crossChainFeeInfo, tokenInfo, transferTokenValue]);

  const convertedXcmDestTokenValueToUSD = useMemo(() => {
    if (!isAcrossBridge || !xcmData.metadata?.amountOut) {
      return 0;
    }

    return new BigN(xcmData.metadata.amountOut)
      .multipliedBy(destTransferTokenValue)
      .dividedBy(BN_TEN.pow(destTokenInfo.decimals || 0))
      .toNumber();
  }, [destTokenInfo.decimals, destTransferTokenValue, isAcrossBridge, xcmData.metadata?.amountOut]);

  const isSubstrateXcm = useMemo(() => {
    const originChainInfo = chainInfoMap[xcmData.originNetworkKey];
    const destinationChainInfo = chainInfoMap[xcmData.destinationNetworkKey];

    if (!originChainInfo || !destinationChainInfo) {
      return false;
    }

    return isSubstrateCrossChain(originChainInfo, destinationChainInfo);
  }, [chainInfoMap, xcmData.destinationNetworkKey, xcmData.originNetworkKey]);

  const isShowCrossChainFee =
    transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM &&
    !!crossChainFeeInfo?.value &&
    new BigN(crossChainFeeInfo.value).gt(0) &&
    isSubstrateXcm;

  const renderConvertedValue = (value: number) => (
    <SwNumber
      size={12}
      value={value}
      decimal={0}
      prefix={`~ ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
      suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
      unitColor={theme.colorTextTertiary}
      intColor={theme.colorTextTertiary}
      decimalColor={theme.colorTextTertiary}
    />
  );

  return (
    <ConfirmationContent isFullHeight isTransaction transaction={transaction}>
      <MetaInfo hasBackgroundWrapper valueColorScheme={'gray'}>
        <MetaInfo.Account address={data.from} label={i18n.inputLabel.sendFrom} networkPrefix={senderPrefix} />

        {transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM && chainInfo && (
          <MetaInfo.Chain chain={chainInfo.slug} label={i18n.inputLabel.senderNetwork} />
        )}

        <MetaInfo.Account address={data.to} label={i18n.inputLabel.sendTo} networkPrefix={receiverPrefix} />

        {transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM && chainInfo && (
          <MetaInfo.Chain chain={xcmData.destinationNetworkKey} label={i18n.inputLabel.destinationNetwork} />
        )}

        {transaction.extrinsicType !== ExtrinsicType.TRANSFER_XCM && chainInfo && (
          <MetaInfo.Chain chain={chainInfo.slug} label={i18n.inputLabel.network} />
        )}
      </MetaInfo>

      <MetaInfo hasBackgroundWrapper>
        {isAcrossBridge && xcmData.metadata ? (
          <>
            <MetaInfo.Default label={'Quote'}>
              <QuoteRateDisplay
                fromAssetInfo={tokenInfo}
                rateValue={Number(xcmData.metadata.rate)}
                toAssetInfo={destTokenInfo}
                size={14}
              />
            </MetaInfo.Default>
            <MetaInfo.Default label={'Expected amount'} labelAlign={'top'}>
              <View style={stylesheet.valueWrapper}>
                <SwNumber
                  size={14}
                  value={xcmData.metadata.amountOut}
                  decimal={destTokenInfo.decimals || 0}
                  suffix={destTokenInfo.symbol}
                />
                {renderConvertedValue(convertedXcmDestTokenValueToUSD)}
              </View>
            </MetaInfo.Default>
          </>
        ) : (
          <MetaInfo.Number
            decimals={tokenInfo.decimals || 0}
            label={i18n.inputLabel.amount}
            suffix={tokenInfo.symbol}
            value={data.value || 0}
          />
        )}

        <MetaInfo.Default label={i18n.inputLabel.estimatedFee} labelAlign={'top'}>
          <View style={stylesheet.valueWrapper}>
            <SwNumber
              size={14}
              decimal={feeInfo ? feeInfo.decimals : nativeTokenDecimals}
              suffix={feeInfo ? feeInfo.symbol : nativeTokenSymbol}
              value={feeInfo ? feeInfo.value : 0}
              unitColor={theme.colorTextLight3}
            />
            {renderConvertedValue(convertedFeeValueToUSD)}
          </View>
        </MetaInfo.Default>

        {isShowCrossChainFee && (
          <MetaInfo.Default label={i18n.inputLabel.crossChainFee} labelAlign={'top'}>
            <View style={stylesheet.valueWrapper}>
              <SwNumber
                size={14}
                decimal={_getAssetDecimals(tokenInfo)}
                suffix={_getAssetSymbol(tokenInfo)}
                value={crossChainFeeInfo?.value || 0}
                unitColor={theme.colorTextLight3}
              />
              {renderConvertedValue(convertedCrossChainFeeValueToUSD)}
            </View>
          </MetaInfo.Default>
        )}
      </MetaInfo>
      {!!transaction.estimateFee?.tooHigh && (
        <AlertBox
          description={'Gas fees on {{networkName}} are high due to high demands, so gas estimates are less accurate.'.replace(
            '{{networkName}}',
            network.name,
          )}
          title={'Pay attention!'}
          type="warning"
        />
      )}

      {transaction.extrinsicType === ExtrinsicType.TRANSFER_XCM && (
        <AlertBox
          type={'warning'}
          title={i18n.message.xcmTransferWarningTitle}
          description={i18n.message.xcmTransferWarningMessage}
        />
      )}
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

export default TransferBlock;
