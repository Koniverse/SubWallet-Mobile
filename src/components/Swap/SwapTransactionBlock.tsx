import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import {
  _getAssetDecimals,
  _getAssetOriginChain,
  _getAssetSymbol,
} from '@subwallet/extension-base/services/chain-service/utils';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Logo, Number, Typography } from 'components/design-system-ui';
import { ArrowRight } from 'phosphor-react-native';
import { swapCustomFormatter } from '@subwallet/extension-base/utils';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import MetaInfo from 'components/MetaInfo';
import { ThemeTypes } from 'styles/themes';

interface Props {
  fromAssetSlug: string | undefined;
  fromAmount: string | undefined;
  toAssetSlug: string | undefined;
  toAmount: string | undefined;
  logoSize?: number;
}

const numberMetadata = { maxNumberFormat: 8 };

export const SwapTransactionBlock = ({ fromAmount, toAmount, fromAssetSlug, toAssetSlug, logoSize = 24 }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const styles = createStyles(theme);

  const fromAssetInfo = useMemo(() => {
    return fromAssetSlug ? assetRegistryMap[fromAssetSlug] : undefined;
  }, [assetRegistryMap, fromAssetSlug]);

  const toAssetInfo = useMemo(() => {
    return toAssetSlug ? assetRegistryMap[toAssetSlug] : undefined;
  }, [assetRegistryMap, toAssetSlug]);

  return (
    <MetaInfo hasBackgroundWrapper>
      <View style={styles.container}>
        <View style={styles.tokenWrapper}>
          <Logo
            size={logoSize}
            token={fromAssetSlug?.toLowerCase()}
            subNetwork={_getAssetOriginChain(fromAssetInfo)}
            shape={'circle'}
            isShowSubLogo
          />

          <Number
            style={styles.number}
            value={fromAmount || 0}
            decimal={_getAssetDecimals(fromAssetInfo)}
            metadata={numberMetadata}
            formatType={'custom'}
            customFormatter={swapCustomFormatter}
          />

          <Typography.Text style={{ color: theme.colorTextLight4 }}>{_getAssetSymbol(fromAssetInfo)}</Typography.Text>
        </View>
        <Icon phosphorIcon={ArrowRight} size={'md'} />
        <View style={styles.tokenWrapper}>
          <Logo
            size={logoSize}
            token={toAssetSlug?.toLowerCase()}
            subNetwork={_getAssetOriginChain(toAssetInfo)}
            shape={'circle'}
            isShowSubLogo
          />

          <Number
            style={styles.number}
            value={toAmount || 0}
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

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.paddingXXS, width: '100%' },
    tokenWrapper: { flex: 1, alignItems: 'center' },
    number: { marginTop: theme.marginSM - 2, marginBottom: theme.marginXXS },
  });
}
