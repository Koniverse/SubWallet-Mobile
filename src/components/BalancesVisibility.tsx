import React from 'react';
import { StyleProp, View } from 'react-native';
import Text from '../components/Text';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { sharedStyles } from 'styles/sharedStyles';
import BigN from 'bignumber.js';
import { ColorMap } from 'styles/color';
import { getInputValFontSize } from 'components/TransferValue';
import { toShort } from 'utils/index';
import { Number } from 'components/design-system-ui';

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
  const valueStr = value.toFixed(4) + toShort(symbol, 6, 0);

  return (
    <View style={wrapperStyle}>
      {isShowBalance ? (
        <Number
          value={value}
          decimal={0}
          prefix={startWithSymbol ? symbol : undefined}
          suffix={!startWithSymbol ? symbol : undefined}
          weight={'600'}
          size={getInputValFontSize(valueStr)}
          subFloatNumber={true}
          decimalOpacity={0.45}
        />
      ) : (
        <Text style={textStyle}>******</Text>
      )}
    </View>
  );
};
