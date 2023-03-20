import React from 'react';
import { StyleProp, View } from 'react-native';
import Text from '../components/Text';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { getBalanceWithSi, toShort } from 'utils/index';
import { SiDef } from '@polkadot/util/types';

interface Props {
  token: string;
  value: string;
  decimals: number;
  si: SiDef;
}

export const getInputValFontSize = (inputValue: string) => {
  const initVal = 38;

  if (inputValue.length > 23) {
    return 20;
  } else if (inputValue.length > 17) {
    return 24;
  } else if (inputValue.length > 14) {
    return 28;
  } else if (inputValue.length > 11) {
    return 34;
  }

  return initVal;
};

export const getInputValueStyle = (inputValue: string) => {
  const initStyle = {
    ...sharedStyles.largeText,
    ...FontBold,
  };

  if (inputValue.length > 23) {
    return {
      ...initStyle,
      fontSize: 20,
      lineHeight: 28,
    };
  } else if (inputValue.length > 17) {
    return {
      ...initStyle,
      fontSize: 24,
      lineHeight: 32,
    };
  } else if (inputValue.length > 14) {
    return {
      ...initStyle,
      fontSize: 28,
      lineHeight: 38,
    };
  } else if (inputValue.length > 11) {
    return {
      ...initStyle,
      fontSize: 34,
      lineHeight: 46,
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
      <Text style={[getInputValueStyle(balanceValue + balanceToken), { color: ColorMap.light, paddingRight: 8 }]}>
        {balanceValue}
      </Text>
      <Text style={[getInputValueStyle(balanceValue + balanceToken), { color: ColorMap.light }]}>
        {toShort(balanceToken, 6, 0)}
      </Text>
    </View>
  );
};
