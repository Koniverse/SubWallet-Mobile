import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import { getBalanceWithSi } from 'utils/index';
import { StyleProp, View } from 'react-native';
import Text from '../../components/Text';
import { FontMedium, FontSize2 } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { SiDef } from '@polkadot/util/types';

interface Props extends FieldBaseProps {
  value: string;
  decimal: number;
  token: string;
  si: SiDef;
  color?: string;
}

const textStyle: StyleProp<any> = {
  ...FontSize2,
  ...FontMedium,
  lineHeight: 25,
};

const balanceStyle: StyleProp<any> = {
  ...textStyle,
  paddingLeft: 12,
  paddingRight: 8,
  paddingBottom: 10,
  flex: 1,
};

const blockContentStyle: StyleProp<any> = {
  flexDirection: 'row',
};

const unitStyle: StyleProp<any> = {
  ...textStyle,
  color: ColorMap.disabled,
  paddingBottom: 10,
  paddingRight: 16,
};

export const BalanceField = ({ value, decimal, token, si, color = ColorMap.disabled, ...fieldBase }: Props) => {
  const [balanceValue, balanceToken] = getBalanceWithSi(value, decimal, si, token);

  return (
    <FieldBase {...fieldBase}>
      <View style={blockContentStyle}>
        <Text style={[balanceStyle, { color: color }]}>{balanceValue}</Text>
        <Text style={unitStyle}>{balanceToken}</Text>
      </View>
    </FieldBase>
  );
};
