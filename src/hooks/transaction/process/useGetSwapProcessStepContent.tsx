import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import React, { useCallback } from 'react';
import { CommonStepDetail, CommonStepFeeInfo, CommonStepType } from '@subwallet/extension-base/types/service-base';
import { BN_TEN, BN_ZERO, swapNumberMetadata } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { BaseSwapStepMetadata, SwapQuote } from '@subwallet/extension-base/types/swap';
import { BaseStepType, BriefSwapStep, SwapStepType } from '@subwallet/extension-base/types';
import {
  _getAssetDecimals,
  _getAssetSymbol,
  _getChainName,
} from '@subwallet/extension-base/services/chain-service/utils';
import { Logo, NumberDisplay, Typography } from 'components/design-system-ui';
import { StyleSheet, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';

type StepContentProps = {
  children?: React.ReactNode;
};

const StepContent = ({ children }: StepContentProps) => <View>{children}</View>;

type TokenDisplayProps = {
  slug: string;
  symbol: string;
  decimals?: number;
  value?: string;
};

const TokenDisplay = (props: TokenDisplayProps) => {
  const theme = useSubWalletTheme().swThemes;
  const { decimals = 0, slug, symbol, value } = props;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
      <Logo size={16} token={slug.toLowerCase()} />

      {typeof value !== 'undefined' ? (
        <NumberDisplay size={14} decimal={decimals} suffix={symbol} value={value} textStyle={{ ...FontSemiBold }} />
      ) : (
        <Typography.Text style={{ color: theme.colorTextLight1, ...FontSemiBold }}>{symbol}</Typography.Text>
      )}
    </View>
  );
};

const useGetSwapProcessStepContent = () => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const { currencyData, priceMap } = useSelector((state: RootState) => state.price);

  const getFeeValue = useCallback(
    (feeInfo: CommonStepFeeInfo | undefined) => {
      if (!feeInfo) {
        return BN_ZERO;
      }

      let result = BN_ZERO;

      feeInfo.feeComponent.forEach(feeItem => {
        const asset = assetRegistry[feeItem.tokenSlug];

        if (asset) {
          const { decimals, priceId } = asset;
          const price = priceMap[priceId || ''] || 0;

          result = result.plus(new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price));
        }
      });

      return result;
    },
    [assetRegistry, priceMap],
  );

  return useCallback(
    (processStep: CommonStepDetail, feeInfo: CommonStepFeeInfo | undefined, quote: SwapQuote, showFee = true) => {
      if (([CommonStepType.XCM] as BaseStepType[]).includes(processStep.type)) {
        const analysisMetadata = () => {
          try {
            const { destinationTokenInfo, originTokenInfo, sendingValue } =
              processStep.metadata as unknown as BaseSwapStepMetadata;

            return {
              tokenDecimals: _getAssetDecimals(originTokenInfo),
              tokenValue: sendingValue,
              tokenSlug: originTokenInfo.slug,
              tokenSymbol: _getAssetSymbol(originTokenInfo),
              chainName: _getChainName(chainInfoMap[originTokenInfo.originChain]),
              destChainName: _getChainName(chainInfoMap[destinationTokenInfo.originChain]),
            };
          } catch (e) {
            console.log('analysisMetadata error', processStep, e);

            return null;
          }
        };

        const analysisResult = analysisMetadata();

        if (analysisResult) {
          return (
            <StepContent>
              <View style={styles.row}>
                <Typography.Text style={styles.text}>{'Transfer '}</Typography.Text>
                <TokenDisplay
                  decimals={analysisResult.tokenDecimals}
                  slug={analysisResult.tokenSlug}
                  symbol={analysisResult.tokenSymbol}
                  value={analysisResult.tokenValue}
                />
                <Typography.Text
                  style={
                    styles.text
                  }>{` from ${analysisResult.chainName} to ${analysisResult.destChainName}`}</Typography.Text>
              </View>

              {showFee && (
                <View style={styles.subRow}>
                  <Typography.Text style={styles.subText}>{'Fee: '}</Typography.Text>

                  <NumberDisplay
                    size={12}
                    decimal={0}
                    metadata={swapNumberMetadata}
                    prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
                    suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                    value={getFeeValue(feeInfo)}
                    intColor={theme['gray-5']}
                    decimalColor={theme['gray-5']}
                    unitColor={theme['gray-5']}
                  />
                </View>
              )}
            </StepContent>
          );
        }
      }

      if (processStep.type === SwapStepType.SWAP) {
        const analysisMetadata = () => {
          try {
            const { destinationTokenInfo, expectedReceive, originTokenInfo, sendingValue, version } =
              processStep.metadata as unknown as BaseSwapStepMetadata;

            if (!version || !(version >= 2)) {
              return null;
            }

            return {
              fromTokenSlug: originTokenInfo.slug,
              fromTokenValue: sendingValue,
              fromTokenSymbol: _getAssetSymbol(originTokenInfo),
              fromTokenDecimals: _getAssetDecimals(originTokenInfo),
              fromChainName: _getChainName(chainInfoMap[originTokenInfo.originChain]),
              toTokenSlug: destinationTokenInfo.slug,
              toTokenValue: expectedReceive,
              toTokenSymbol: _getAssetSymbol(destinationTokenInfo),
              toTokenDecimals: _getAssetDecimals(destinationTokenInfo),
              toChainName: _getChainName(chainInfoMap[destinationTokenInfo.originChain]),
              providerName: quote.provider.name,
            };
          } catch (e) {
            console.log('analysisMetadata error', processStep, e);

            return null;
          }
        };

        const analysisMetadataForOldData = () => {
          try {
            const { fromAmount, pair, toAmount } = processStep.metadata as unknown as BriefSwapStep;
            const fromAsset = assetRegistry[pair.from];
            const toAsset = assetRegistry[pair.to];

            return {
              fromTokenSlug: pair.from,
              fromTokenValue: fromAmount,
              fromTokenSymbol: _getAssetSymbol(fromAsset),
              fromTokenDecimals: _getAssetDecimals(fromAsset),
              fromChainName: _getChainName(chainInfoMap[fromAsset.originChain]),
              toTokenSlug: pair.to,
              toTokenValue: toAmount,
              toTokenSymbol: _getAssetSymbol(toAsset),
              toTokenDecimals: _getAssetDecimals(toAsset),
              toChainName: _getChainName(chainInfoMap[toAsset.originChain]),
              providerName: quote.provider.name,
            };
          } catch (e) {
            console.log('analysisMetadata error', processStep, e);

            return null;
          }
        };

        const analysisResult = analysisMetadata() || analysisMetadataForOldData();

        if (analysisResult) {
          return (
            <StepContent>
              <View style={styles.row}>
                <Typography.Text style={styles.text}>{'Swap '}</Typography.Text>
                <TokenDisplay
                  decimals={analysisResult.fromTokenDecimals}
                  slug={analysisResult.fromTokenSlug}
                  symbol={analysisResult.fromTokenSymbol}
                  value={analysisResult.fromTokenValue}
                />
                <Typography.Text style={styles.text}>{` on ${analysisResult.fromChainName} for `}</Typography.Text>
                <TokenDisplay
                  decimals={analysisResult.toTokenDecimals}
                  slug={analysisResult.toTokenSlug}
                  symbol={analysisResult.toTokenSymbol}
                  value={analysisResult.toTokenValue}
                />
                <Typography.Text
                  style={
                    styles.text
                  }>{` on ${analysisResult.toChainName} via ${analysisResult.providerName}`}</Typography.Text>
              </View>

              {showFee && (
                <View style={styles.subRow}>
                  <Typography.Text style={styles.subText}>{'Fee: '}</Typography.Text>

                  <NumberDisplay
                    decimal={0}
                    size={12}
                    textStyle={{ ...FontSemiBold }}
                    intColor={theme['gray-5']}
                    decimalColor={theme['gray-5']}
                    unitColor={theme['gray-5']}
                    metadata={swapNumberMetadata}
                    prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
                    suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
                    value={getFeeValue(feeInfo)}
                  />
                </View>
              )}
            </StepContent>
          );
        }
      }

      if (([CommonStepType.TOKEN_APPROVAL] as BaseStepType[]).includes(processStep.type)) {
        const analysisMetadata = () => {
          try {
            const { tokenApprove } = processStep.metadata as unknown as {
              tokenApprove: string;
            };

            const asset = assetRegistry[tokenApprove];

            return {
              tokenSlug: tokenApprove,
              tokenSymbol: _getAssetSymbol(asset),
              chainName: _getChainName(chainInfoMap[asset.originChain]),
            };
          } catch (e) {
            console.log('analysisMetadata error', e);

            return null;
          }
        };

        const analysisResult = analysisMetadata();

        if (analysisResult) {
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Typography.Text style={styles.text}>{'Approve '}</Typography.Text>
              <TokenDisplay slug={analysisResult.tokenSlug} symbol={analysisResult.tokenSymbol} />
              <Typography.Text style={styles.text}>{` on ${analysisResult.chainName} for swap`}</Typography.Text>
            </View>
          );
        }
      }

      if (processStep.type === SwapStepType.PERMIT) {
        return <Typography.Text style={styles.text}>{'Sign message to authorize provider'}</Typography.Text>;
      }

      return '';
    },
    [
      assetRegistry,
      chainInfoMap,
      currencyData.isPrefix,
      currencyData.symbol,
      getFeeValue,
      styles.row,
      styles.subRow,
      styles.subText,
      styles.text,
      theme,
    ],
  );
};

function createStyle(_theme: ThemeTypes) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    subRow: { flexDirection: 'row', alignItems: 'center' },
    text: { color: _theme['gray-5'], ...FontSemiBold },
    subText: {
      fontSize: _theme.fontSizeSM,
      lineHeight: _theme.lineHeightSM * _theme.fontSizeSM,
      color: _theme['gray-5'],
      ...FontSemiBold,
    },
  });
}

export default useGetSwapProcessStepContent;
