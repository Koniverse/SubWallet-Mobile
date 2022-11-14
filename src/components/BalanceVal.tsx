import BigN from 'bignumber.js';
import React from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import Text from '../components/Text';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { getRoundedDecimalNumber, toShort } from 'utils/index';

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
}: BalanceValProps) => {
  let [prefix, postfix] = getDisplayedBalance(value).split('.');

  const lastSymbol = postfix?.slice(-1);
  const isString = /^[KMB]/.test(lastSymbol);
  const postfixValue = postfix || '00';
  const symbolView = prefix && <Text>{`${startWithSymbol ? '' : ' '}${toShort(symbol || '', 6, 0)}`}</Text>;
  const formatPrefix = new Intl.NumberFormat().format(Number(prefix));

  return (
    <View style={[balanceValWrapperStyle, style]}>
      <Text style={[balanceValTextDefaultStyle, balanceValTextStyle, symbolTextStyle, startSymbolTextStyle]}>
        {startWithSymbol && withSymbol && symbolView}
      </Text>
      <Text style={[balanceValTextDefaultStyle, balanceValTextStyle]}>
        {withComma ? formatPrefix.replace(/[. ]+/g, ',') : prefix}.
      </Text>
      <Text style={[balanceValTextDefaultStyle, balanceValTextStyle]}>
        {isString ? postfixValue.slice(0, -1) : postfixValue}
      </Text>
      <Text style={[balanceValTextDefaultStyle, balanceValTextStyle]}>{isString && lastSymbol}</Text>
      <Text style={[balanceValTextDefaultStyle, balanceValTextStyle, symbolTextStyle]}>
        {!startWithSymbol && withSymbol && symbolView}
      </Text>
    </View>
  );
};
