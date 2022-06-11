import BigN from 'bignumber.js';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type BalanceViewProps = {
  value: string | BigN;
  symbol?: string;
  startWithSymbol?: boolean;
  withComma?: boolean;
  withSymbol?: boolean;
};

export const BalanceVal = ({startWithSymbol = false, symbol, value, withComma = true, withSymbol = true}: BalanceViewProps) => {
  const styles = useMemo(() => StyleSheet.create({}), []);

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
    <View>
      <Text>{startWithSymbol && withSymbol && symbolView}</Text>
      <Text>{withComma ? formatPrefix.replace(/[. ]+/g, ',') : prefix}</Text>
      <Text>{isString ? postfixValue.slice(0, -1) : postfixValue}</Text>
      <Text>{isString && lastSymbol}</Text>
      <Text>{!startWithSymbol && withSymbol && symbolView}</Text>
    </View>
  );
};
