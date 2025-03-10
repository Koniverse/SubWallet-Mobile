import React, { useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Logo, Number, Typography } from 'components/design-system-ui';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { swapCustomFormatter } from '@subwallet/extension-base/utils';
import { CheckCircle } from 'phosphor-react-native';
import BigN from 'bignumber.js';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';

interface Props {
  slug: string;
  amountToPay: string | number | BigN;
  selected?: boolean;
  onSelect?: (slug: string) => void;
  balance: string;
  isDisable?: boolean;
}

const numberMetadata = { maxNumberFormat: 6 };

export const ChooseFeeItem = ({ amountToPay, slug, selected, onSelect, balance, isDisable }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);

  const _onSelect = useCallback(() => {
    onSelect?.(slug);
  }, [onSelect, slug]);

  const feeAssetInfo = useMemo(() => {
    return slug ? assetRegistryMap[slug] : undefined;
  }, [assetRegistryMap, slug]);

  const decimal = _getAssetDecimals(feeAssetInfo);

  return (
    <TouchableOpacity
      style={[styles.container, isDisable && styles.containerDisabled]}
      onPress={_onSelect}
      disabled={isDisable}>
      <View style={styles.contentWrapper}>
        <Logo size={40} token={slug.toLowerCase()} shape={'squircle'} isShowSubLogo={false} />
        <View>
          <View>
            {amountToPay ? (
              <Number
                customFormatter={swapCustomFormatter}
                decimal={decimal}
                formatType={'custom'}
                metadata={numberMetadata}
                suffix={_getAssetSymbol(feeAssetInfo)}
                value={amountToPay}
              />
            ) : (
              <Typography.Text>{_getAssetSymbol(feeAssetInfo)}</Typography.Text>
            )}
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Typography.Text size={'sm'} style={{ color: theme.colorTextTertiary }}>
              {'Available balance: '}
            </Typography.Text>
            <Number
              size={12}
              customFormatter={swapCustomFormatter}
              decimal={decimal}
              formatType={'custom'}
              metadata={numberMetadata}
              suffix={_getAssetSymbol(feeAssetInfo)}
              value={balance}
              intColor={theme.colorTextTertiary}
              decimalColor={theme.colorTextTertiary}
              unitColor={theme.colorTextTertiary}
            />
          </View>
        </View>
      </View>
      {selected && <Icon phosphorIcon={CheckCircle} size={'md'} weight={'fill'} iconColor={theme.colorSuccess} />}
    </TouchableOpacity>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colorBgSecondary,
      marginBottom: theme.marginXS,
      padding: theme.padding,
      borderRadius: theme.borderRadiusLG,
      alignItems: 'center',
    },
    containerDisabled: {
      opacity: 0.4,
    },
    contentWrapper: { flexDirection: 'row', flex: 1, gap: theme.sizeXS },
  });
}
