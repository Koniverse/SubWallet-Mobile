import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Number, Typography } from 'components/design-system-ui';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _getAssetDecimals, _getAssetPriceId } from '@subwallet/extension-base/services/chain-service/utils';
import { getBalanceValue, getConvertedBalanceValue } from 'hooks/screen/useAccountBalance';
import { BN_ZERO } from 'utils/chainBalances';

interface Props {
  value: string;
  style?: StyleProp<ViewStyle>;
  tokenSlug: string;
}

export const AmountValueConverter = ({ value, tokenSlug, style }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const priceMap = useSelector((state: RootState) => state.price.priceMap);
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);

  const convertedValueBigN = (() => {
    try {
      const chainAsset = assetRegistryMap[tokenSlug];
      const priceId = _getAssetPriceId(chainAsset);
      const priceValue = priceMap[priceId] || 0;
      const decimals = _getAssetDecimals(chainAsset);
      const valueBigN = getBalanceValue(value, decimals);
      return getConvertedBalanceValue(valueBigN, priceValue);
    } catch (e) {
      return BN_ZERO;
    }
  })();

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <Typography.Text size={'md'} style={{ color: theme.colorSuccess }}>
        (
      </Typography.Text>
      <Number
        value={convertedValueBigN}
        decimal={0}
        intOpacity={1}
        unitOpacity={1}
        decimalOpacity={1}
        prefix={'$'}
        size={theme.fontSizeLG}
        textStyle={{ lineHeight: theme.fontSizeLG * theme.lineHeightLG, color: theme.colorSuccess }}
      />
      <Typography.Text size={'md'} style={{ color: theme.colorSuccess }}>
        )
      </Typography.Text>
    </View>
  );
};
