import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { BalanceVal } from 'components/BalanceVal';
import BigN from 'bignumber.js';

const textStyle: StyleProp<any> = {
  color: ColorMap.primary,
  ...sharedStyles.mainText,
  ...FontMedium,
};

interface Props {
  amountToUsd: BigN;
}

export const BalanceToUsd = ({ amountToUsd }: Props) => {
  return (
    <View style={{ flexDirection: 'row', marginTop: 8 }}>
      <Text style={textStyle}>(</Text>
      <BalanceVal
        balanceValTextStyle={[textStyle, { marginTop: 1 }]}
        value={`${amountToUsd}`}
        symbol={'$'}
        startWithSymbol
      />
      <Text style={textStyle}>)</Text>
    </View>
  );
};
