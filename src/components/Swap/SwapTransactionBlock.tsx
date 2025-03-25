import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import {
  _getAssetDecimals,
  _getAssetOriginChain,
  _getAssetSymbol,
} from '@subwallet/extension-base/services/chain-service/utils';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Icon, Logo, Number, Typography } from 'components/design-system-ui';
import { ArrowRight } from 'phosphor-react-native';
import { swapCustomFormatter } from '@subwallet/extension-base/utils';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfo from 'components/MetaInfo';
import { SwapQuote } from '@subwallet/extension-base/types';

interface Props {
  quote: SwapQuote;
  logoSize?: number;
}

const numberMetadata = { maxNumberFormat: 8 };

export const SwapTransactionBlock = ({ quote, logoSize = 24 }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);

  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[quote.pair.to] || undefined;
  }, [assetRegistryMap, quote.pair.to]);

  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[quote.pair.from] || undefined;
  }, [assetRegistryMap, quote.pair.from]);

  return (
    <MetaInfo hasBackgroundWrapper>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.paddingXXS }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Logo
            size={logoSize}
            token={quote.pair.from.toLowerCase()}
            subNetwork={_getAssetOriginChain(fromAssetInfo)}
            shape={'circle'}
            isShowSubLogo
          />

          <Number
            style={{ marginTop: theme.marginSM - 2, marginBottom: theme.marginXXS }}
            value={quote.fromAmount}
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
            size={logoSize}
            token={quote.pair.to.toLowerCase()}
            subNetwork={_getAssetOriginChain(toAssetInfo)}
            shape={'circle'}
            isShowSubLogo
          />

          <Number
            style={{ marginTop: theme.marginSM - 2, marginBottom: theme.marginXXS }}
            value={quote.toAmount || 0}
            decimal={_getAssetDecimals(toAssetInfo)}
            metadata={numberMetadata}
            formatType={'custom'}
            customFormatter={swapCustomFormatter}
          />

          <Typography.Text style={{ color: theme.colorTextLight4 }}>{_getAssetSymbol(toAssetInfo)}</Typography.Text>
        </View>
      </View>
    </MetaInfo>
  );
};
