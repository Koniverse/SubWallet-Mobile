import React from 'react';
import { Typography } from 'components/design-system-ui';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { View } from 'react-native';

interface Props {
  isShowConvertedBalance?: boolean;
}

export const HideBalanceItem = ({ isShowConvertedBalance = true }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  return (
    <>
      <Typography.Text
        style={{
          fontSize: theme.fontSizeLG,
          ...FontSemiBold,
          lineHeight: theme.lineHeightLG * theme.fontSizeLG,
          color: theme.colorTextLight1,
        }}>
        ******
      </Typography.Text>
      {isShowConvertedBalance ? (
        <Typography.Text
          style={{
            ...FontMedium,
            fontSize: theme.fontSizeSM,
            lineHeight: theme.lineHeightSM * theme.fontSizeSM,
            color: theme.colorTextLight4,
          }}>
          ******
        </Typography.Text>
      ) : (
        <View style={{ height: 20 }} />
      )}
    </>
  );
};
