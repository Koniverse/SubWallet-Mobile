import BigN from 'bignumber.js';
import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

type BalanceViewProps = {
  value: string | BigN;
  symbol?: string;
  startWithSymbol?: boolean;
  withComma?: boolean;
  withSymbol?: boolean;
};

const balanceValWrapper: StyleProp<any> = {
  flexDirection: 'row',
};

const balanceValText: StyleProp<any> = {
  ...sharedStyles.largeText,
  ...FontBold,
  color: ColorMap.light,
};

export const BalanceVal = ({
  startWithSymbol = false,
  symbol,
  value,
  withComma = true,
  withSymbol = true,
}: BalanceViewProps) => {
  let [prefix, postfix] = value.toString().split('.');

  if (startWithSymbol) {
    postfix = postfix?.substring(0, 3);
  } else {
    postfix = postfix?.substring(0, 4);
  }

  const lastSymbol = postfix?.slice(-1);
  const isString = /^[KMB]/.test(lastSymbol);
  const postfixValue = postfix || '00';
  const symbolView = prefix && <Text>{symbol}</Text>;
  const formatPrefix = new Intl.NumberFormat().format(Number(prefix));

  return (
    <View style={balanceValWrapper}>
      <Text style={balanceValText}>{startWithSymbol && withSymbol && symbolView}</Text>
      <Text style={balanceValText}>{withComma ? formatPrefix.replace(/[. ]+/g, ',') : prefix}</Text>
      <Text style={balanceValText}>{isString ? postfixValue.slice(0, -1) : postfixValue}</Text>
      <Text style={balanceValText}>{isString && lastSymbol}</Text>
      <Text style={balanceValText}>{!startWithSymbol && withSymbol && symbolView}</Text>
    </View>
  );
};
