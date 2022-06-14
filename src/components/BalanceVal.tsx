import BigN from 'bignumber.js';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {sharedStyles} from "styles/sharedStyles";
import {useSubWalletTheme} from "hooks/useSubWalletTheme";

type BalanceViewProps = {
  value: string | BigN;
  symbol?: string;
  startWithSymbol?: boolean;
  withComma?: boolean;
  withSymbol?: boolean;
};

export const BalanceVal = ({
  startWithSymbol = false,
  symbol,
  value,
  withComma = true,
  withSymbol = true,
}: BalanceViewProps) => {
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        balanceValWrapper: {
          flexDirection: 'row',
        },
        balanceValText: {
          ...sharedStyles.largeText,
          fontWeight: 'bold',
          color: theme.textColor,
        },
      }),
    [theme],
  );

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
    <View style={styles.balanceValWrapper}>
      <Text style={styles.balanceValText}>{startWithSymbol && withSymbol && symbolView}</Text>
      <Text style={styles.balanceValText}>{withComma ? formatPrefix.replace(/[. ]+/g, ',') : prefix}</Text>
      <Text style={styles.balanceValText}>{isString ? postfixValue.slice(0, -1) : postfixValue}</Text>
      <Text style={styles.balanceValText}>{isString && lastSymbol}</Text>
      <Text style={styles.balanceValText}>{!startWithSymbol && withSymbol && symbolView}</Text>
    </View>
  );
};
