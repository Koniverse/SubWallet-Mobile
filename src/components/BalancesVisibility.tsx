import React, { useState } from 'react';
import { StyleProp, TouchableOpacity } from 'react-native';
import Text from '../components/Text';
import { BalanceVal } from 'components/BalanceVal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { toggleBalancesVisibility } from '../messaging';
import { sharedStyles } from 'styles/sharedStyles';
import BigN from 'bignumber.js';
import { ColorMap } from 'styles/color';
import { getInputValueStyle } from 'components/TransferValue';
import { toShort } from 'utils/index';

type Props = {
  value: BigN;
  symbol: string;
  startWithSymbol?: boolean;
};

const wrapperStyle: StyleProp<any> = {
  height: 51,
};

const textStyle: StyleProp<any> = {
  ...sharedStyles.largeText,
  color: ColorMap.light,
};

export const BalancesVisibility = ({ value, symbol, startWithSymbol = true }: Props) => {
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const [isDisabled, setDisabled] = useState<boolean>(false);
  const valueStr = value.toString() + Math.floor(value.toString().length / 3) + toShort(symbol, 6, 0) + 3;
  const _toggleBalances = async () => {
    setDisabled(true);
    await toggleBalancesVisibility(v => {
      console.log('Balances visible:', v.isShowBalance);
    });
    setDisabled(false);
  };

  return (
    <TouchableOpacity onPress={() => _toggleBalances()} style={wrapperStyle} disabled={isDisabled}>
      {isShowBalance ? (
        <BalanceVal
          value={value}
          startWithSymbol={startWithSymbol}
          symbol={symbol}
          balanceValTextStyle={getInputValueStyle(valueStr)}
        />
      ) : (
        <Text style={textStyle}>******</Text>
      )}
    </TouchableOpacity>
  );
};
