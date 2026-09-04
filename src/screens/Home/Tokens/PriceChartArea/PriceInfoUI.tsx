import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { NumberDisplay, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { PriceInfoUIProps } from './types';

const PRICE_FONT_SIZE = 38;

export const PriceInfoUI = ({ change, isPriceDown, percent, value }: PriceInfoUIProps) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles(theme, !!isPriceDown);
  const currencyData = useSelector((state: RootState) => state.price.currencyData);

  return (
    <View style={styles.container}>
      <View style={styles.valueWrapper}>
        <Typography.Text style={styles.symbol}>{currencyData.symbol}</Typography.Text>
        <NumberDisplay
          decimal={0}
          decimalOpacity={0.45}
          intOpacity={1}
          size={PRICE_FONT_SIZE}
          style={styles.valueRow}
          subFloatNumber
          textStyle={styles.value}
          value={value}
        />
      </View>

      <View style={styles.changeContainer}>
        <NumberDisplay
          decimal={0}
          decimalOpacity={1}
          intOpacity={1}
          prefix={`${isPriceDown ? '-' : '+'} ${(currencyData.isPrefix && currencyData.symbol) || ''}`}
          size={theme.fontSize}
          suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
          textStyle={{ color: theme.colorTextLight1 }}
          value={change}
        />

        <View style={styles.percentTag}>
          <NumberDisplay
            decimal={0}
            decimalOpacity={1}
            intOpacity={1}
            prefix={isPriceDown ? '-' : '+'}
            size={theme.fontSizeXS}
            suffix={'%'}
            textStyle={styles.percentText}
            value={percent}
          />
        </View>
      </View>
    </View>
  );
};

function createStyles(theme: ThemeTypes, isPriceDown: boolean) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: theme.padding,
      alignItems: 'center',
    },
    valueWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.marginXXS,
    },
    // NumberDisplay bottom-aligns its integer and decimal texts, which share a line
    // height but not a font size, so the decimals float above the baseline. Aligning
    // the row on the baseline instead puts them back on it, as the extension has them.
    valueRow: {
      alignItems: 'baseline',
    },
    symbol: {
      marginRight: theme.marginXXS,
      marginTop: 4,
      color: theme.colorTextLight1,
      fontSize: theme.fontSizeHeading5,
      lineHeight: theme.fontSizeHeading5 * theme.lineHeightHeading5,
      ...FontSemiBold,
    },
    value: {
      color: theme.colorTextLight1,
      // Required: Typography.Text defaults to the body line height (~22px), which would
      // clip 38px digits. It applies to the smaller decimal text too, which is why the
      // row below has to align on the baseline rather than on the box.
      lineHeight: PRICE_FONT_SIZE,
      ...FontSemiBold,
    },
    changeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
    },
    percentTag: {
      backgroundColor: isPriceDown ? theme.colorError : theme['cyan-6'],
      borderRadius: theme.borderRadiusLG,
      paddingHorizontal: theme.paddingXS,
      paddingVertical: 2,
    },
    percentText: {
      color: isPriceDown ? theme.colorTextLight1 : theme['green-1'],
      ...FontSemiBold,
    },
  });
}
