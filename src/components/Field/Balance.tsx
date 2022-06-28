import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import { reformatBalance } from 'utils/index';
import { StyleProp, Text, View } from 'react-native';
import { FontMedium, FontSize2 } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { BN } from '@polkadot/util';

interface Props extends FieldBaseProps {
  value: string | BN;
  decimal: number;
  token: string;
}

const textStyle: StyleProp<any> = {
  ...FontSize2,
  ...FontMedium,
  lineHeight: 25,
};

const balanceStyle: StyleProp<any> = {
  ...textStyle,
  paddingLeft: 16,
  paddingRight: 8,
  paddingBottom: 10,
  color: ColorMap.disabled,
  flex: 1,
};

const blockContentStyle: StyleProp<any> = {
  flexDirection: 'row',
};

const unitStyle: StyleProp<any> = {
  ...textStyle,
  color: ColorMap.light,
  paddingBottom: 10,
  paddingRight: 16,
};

export const BalanceField = ({ value, decimal, token, ...fieldBase }: Props) => {
  const [balanceValue, balanceToken] = reformatBalance(value, decimal, token);

  return (
    <FieldBase {...fieldBase}>
      <View style={blockContentStyle}>
        <Text style={balanceStyle}>{balanceValue}</Text>
        <Text style={unitStyle}>{balanceToken}</Text>
      </View>
    </FieldBase>
  );
};
