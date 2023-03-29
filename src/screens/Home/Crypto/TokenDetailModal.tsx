import React, { useMemo } from 'react';
import { Number, SwModal, Typography } from 'components/design-system-ui';
import { StyleSheet, View } from 'react-native';
import { TokenBalanceItemType } from 'types/balance';
import BigN from 'bignumber.js';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

type ItemType = {
  symbol: string;
  label: string;
  key: string;
  value: BigN;
};

export interface Props {
  modalVisible: boolean;
  onChangeModalVisible?: () => void;
  tokenBalanceMap: Record<string, TokenBalanceItemType>;
  currentTokenInfo?: {
    symbol: string;
    slug: string;
  };
}

export const TokenDetailModal = ({ modalVisible, onChangeModalVisible, currentTokenInfo, tokenBalanceMap }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = createStyleSheet(theme);
  const items: ItemType[] = useMemo(() => {
    const symbol = currentTokenInfo?.symbol || '';
    const balanceInfo = currentTokenInfo ? tokenBalanceMap[currentTokenInfo.slug] : undefined;

    return [
      {
        key: 'transferable',
        symbol,
        label: 'Transferable',
        value: balanceInfo ? balanceInfo.free.value : new BigN(0),
      },
      {
        key: 'locked',
        symbol,
        label: 'Locked',
        value: balanceInfo ? balanceInfo.locked.value : new BigN(0),
      },
    ];
  }, [currentTokenInfo, tokenBalanceMap]);

  return (
    <SwModal modalVisible={modalVisible} modalTitle={'Token details'} onChangeModalVisible={onChangeModalVisible}>
      <View style={_style.blockContainer}>
        {items.map(item => (
          <View key={item.key} style={_style.row}>
            <Typography.Text style={{ ...FontSemiBold }}>{item.label}</Typography.Text>

            <Number
              style={_style.value}
              textStyle={{ ...FontMedium }}
              decimal={0}
              decimalOpacity={0.45}
              intOpacity={0.85}
              size={14}
              suffix={item.symbol}
              unitOpacity={0.85}
              value={item.value}
            />
          </View>
        ))}
      </View>
    </SwModal>
  );
};

function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    blockContainer: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      alignSelf: 'stretch',
      paddingTop: theme.sizeSM,
      paddingBottom: theme.sizeXS,
      marginBottom: theme.margin,
    },
    row: {
      flexDirection: 'row',
      alignSelf: 'stretch',
      paddingHorizontal: theme.sizeSM,
      paddingBottom: theme.sizeXS,
    },
    value: {
      flex: 1,
      justifyContent: 'flex-end',
    },
  });
}
