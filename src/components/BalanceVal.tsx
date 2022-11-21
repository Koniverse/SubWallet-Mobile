import BigN from 'bignumber.js';
import React from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import Text from '../components/Text';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { getRoundedDecimalNumber, toShort } from 'utils/index';
import { getInputValueStyle } from 'components/TransferValue';

export type BalanceValProps = {
  value: string | BigN;
  symbol?: string;
  startWithSymbol?: boolean;
  withComma?: boolean;
  withSymbol?: boolean;
  balanceValTextStyle?: StyleProp<any>;
  symbolTextStyle?: StyleProp<TextStyle>;
  startSymbolTextStyle?: StyleProp<TextStyle>;
  style?: StyleProp<any>;
  isUseResizeStyle?: boolean;
};

const balanceValWrapperStyle: StyleProp<any> = {
  flexDirection: 'row',
};

export const balanceValTextDefaultStyle: StyleProp<any> = {
  ...sharedStyles.largeText,
  ...FontBold,
  color: ColorMap.light,
};

function getDisplayedBalance(value: string | BigN): string {
  const number = typeof value !== 'string' ? value.toFixed() : value;

  if (+number < 1) {
    return getRoundedDecimalNumber(number, 4);
  } else {
    return getRoundedDecimalNumber(number);
  }
}

export const BalanceVal = ({
  balanceValTextStyle,
  symbolTextStyle,
  startSymbolTextStyle,
  startWithSymbol = false,
  symbol,
  value,
  withComma = true,
  withSymbol = true,
  style,
  isUseResizeStyle,
}: BalanceValProps) => {
  let [prefix, postfix] = getDisplayedBalance(value).split('.');

  const lastSymbol = postfix?.slice(-1);
  const isString = /^[KMB]/.test(lastSymbol);
  const postfixValue = postfix || '00';
  const formattedSymbol = toShort(symbol || '', 6, 0);
  const symbolView = prefix && <Text>{`${startWithSymbol ? '' : ' '}${formattedSymbol}`}</Text>;
  const formatPrefix = new Intl.NumberFormat().format(Number(prefix));
  const replacedFormatPrefix = (withComma ? formatPrefix.replace(/[. ]+/g, ',') : prefix) + '.';
  const resizeTextStyle = getInputValueStyle(replacedFormatPrefix + postfixValue + formattedSymbol);

  return (
    <View style={[balanceValWrapperStyle, style]}>
      <Text
        style={[
          balanceValTextDefaultStyle,
          balanceValTextStyle,
          symbolTextStyle,
          startSymbolTextStyle,
          isUseResizeStyle && resizeTextStyle,
        ]}>
        {startWithSymbol && withSymbol && symbolView}
      </Text>
      <Text style={[balanceValTextDefaultStyle, balanceValTextStyle, isUseResizeStyle && resizeTextStyle]}>
        {replacedFormatPrefix}
      </Text>
      <Text style={[balanceValTextDefaultStyle, balanceValTextStyle, isUseResizeStyle && resizeTextStyle]}>
        {isString ? postfixValue.slice(0, -1) : postfixValue}
      </Text>
      <Text style={[balanceValTextDefaultStyle, balanceValTextStyle, isUseResizeStyle && resizeTextStyle]}>
        {isString && lastSymbol}
      </Text>
      <Text
        style={[balanceValTextDefaultStyle, balanceValTextStyle, symbolTextStyle, isUseResizeStyle && resizeTextStyle]}>
        {!startWithSymbol && withSymbol && symbolView}
      </Text>
    </View>
  );
};
