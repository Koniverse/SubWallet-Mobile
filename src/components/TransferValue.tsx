import React from 'react';
import { StyleProp, View } from 'react-native';
import Text from '../components/Text';
import { FontBold, FontSize1, FontSize3, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { getBalanceWithSi } from 'utils/index';
import { SiDef } from '@polkadot/util/types';

interface Props {
  token: string;
  value: string;
  decimals: number;
  si: SiDef;
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
  justifyContent: 'center',
  padding: 12,
};

export const TransferValue = ({ value, decimals, si, token }: Props) => {
  const [balanceValue, balanceToken] = getBalanceWithSi(value, decimals, si, token);
  return (
    <View style={transferValueWrapperStyle}>
      <Text style={[getInputValueStyle(balanceValue), { color: ColorMap.light, paddingRight: 8 }]}>{balanceValue}</Text>
      <Text style={[getInputValueStyle(balanceValue), { color: ColorMap.disabled }]}>{balanceToken}</Text>
    </View>
  );
};
