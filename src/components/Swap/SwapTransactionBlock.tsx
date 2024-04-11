import { SwapTxData } from '@subwallet/extension-base/types/swap';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BN_TEN } from 'utils/chainBalances';
import {
  _getAssetDecimals,
  _getAssetOriginChain,
  _getAssetSymbol,
} from '@subwallet/extension-base/services/chain-service/utils';
import BigN from 'bignumber.js';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Icon, Logo, Number, Typography } from 'components/design-system-ui';
import { ArrowRight } from 'phosphor-react-native';
import { swapCustomFormatter } from '@subwallet/extension-base/utils';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfo from 'components/MetaInfo';

interface Props {
  data: SwapTxData;
}

const numberMetadata = { maxNumberFormat: 8 };

export const SwapTransactionBlock = ({ data }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const swapInfo = data;

  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[swapInfo.quote.pair.to] || undefined;
  }, [assetRegistryMap, swapInfo.quote.pair.to]);

  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[swapInfo.quote.pair.from] || undefined;
  }, [assetRegistryMap, swapInfo.quote.pair.from]);

  const destinationValue = new BigN(swapInfo.quote.fromAmount)
    .div(BN_TEN.pow(_getAssetDecimals(fromAssetInfo)))
    .multipliedBy(swapInfo.quote.rate)
    .multipliedBy(1 - swapInfo.slippage);

  return (
    <MetaInfo hasBackgroundWrapper>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.paddingXXS }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Logo
            size={24}
            token={swapInfo.quote.pair.from.toLowerCase()}
            subNetwork={_getAssetOriginChain(fromAssetInfo)}
            shape={'circle'}
            isShowSubLogo
          />

          <Number
            style={{ marginTop: theme.marginSM - 2, marginBottom: theme.marginXXS }}
            value={swapInfo.quote.fromAmount}
            decimal={_getAssetDecimals(fromAssetInfo)}
            metadata={numberMetadata}
            formatType={'custom'}
            customFormatter={swapCustomFormatter}
          />

          <Typography.Text style={{ color: theme.colorTextLight4 }}>{_getAssetSymbol(fromAssetInfo)}</Typography.Text>
        </View>
        <Icon phosphorIcon={ArrowRight} size={'md'} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Logo
            size={24}
            token={swapInfo.quote.pair.to.toLowerCase()}
            subNetwork={_getAssetOriginChain(toAssetInfo)}
            shape={'circle'}
            isShowSubLogo
          />

          <Number
            style={{ marginTop: theme.marginSM - 2, marginBottom: theme.marginXXS }}
            value={destinationValue}
            decimal={0}
            metadata={numberMetadata}
            formatType={'custom'}
            customFormatter={swapCustomFormatter}
          />

          <Typography.Text style={{ color: theme.colorTextLight4 }}>{_getAssetSymbol(fromAssetInfo)}</Typography.Text>
        </View>
      </View>
    </MetaInfo>
  );
};
