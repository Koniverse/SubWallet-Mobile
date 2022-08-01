import React from 'react';
import { StyleProp, View } from 'react-native';
import Text from '../components/Text';
import { BalanceVal } from 'components/BalanceVal';
import { FontBold, FontSize1, FontSize3, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { reformatBalance } from 'utils/index';

interface Props {
  token: string;
  value: string;
  decimals: number;
}

const getInputValueStyle = (inputValue: string) => {
  const initStyle = {
    ...sharedStyles.largeText,
    ...FontBold,
  };

  if (inputValue.length > 17) {
    return {
      ...initStyle,
      ...FontSize1,
      lineHeight: 18,
    };
  } else if (inputValue.length > 12) {
    return {
      ...initStyle,
      ...FontSize3,
      lineHeight: 23,
    };
  } else if (inputValue.length > 9) {
    return {
      ...initStyle,
      fontSize: 24,
      lineHeight: 30,
    };
  } else if (inputValue.length > 6) {
    return {
      ...initStyle,
      fontSize: 30,
      lineHeight: 38,
    };
  }

  return {
    ...initStyle,
  };
};

const transferValueWrapperStyle: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
  justifyContent: 'center',
  flexWrap: 'wrap',
  padding: 16,
};

export const TransferValue = ({ value, decimals, token }: Props) => {
  const [balanceValue, balanceToken] = reformatBalance(value, decimals, token);
  return (
    <View style={transferValueWrapperStyle}>
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Text style={[getInputValueStyle(balanceValue), { color: ColorMap.light, paddingRight: 8 }]}>-</Text>
        <BalanceVal balanceValTextStyle={getInputValueStyle(balanceValue)} value={balanceValue} symbol={''} />
      </View>
      <Text style={[getInputValueStyle(balanceValue), { color: ColorMap.disabled }]}>{balanceToken}</Text>
    </View>
  );
};
