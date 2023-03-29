import React from 'react';
import { StyleProp, View } from 'react-native';
import Text from '../components/Text';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { Number } from 'components/design-system-ui';
import { SwNumberProps } from 'components/design-system-ui/number';
// import { useSelector } from 'react-redux';
// import { RootState } from 'stores/index';

type Props = {
  value: SwNumberProps['value'];
  symbol?: string;
  startWithSymbol?: boolean;
  subFloatNumber?: boolean;
};

const wrapperStyle: StyleProp<any> = {
  height: 51,
};

const textStyle: StyleProp<any> = {
  ...sharedStyles.largeText,
  color: ColorMap.light,
};

export const BalancesVisibility = ({ value, symbol, startWithSymbol = true, subFloatNumber = false }: Props) => {
  // const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const isShowBalance = true;

  return (
    <View style={wrapperStyle}>
      {isShowBalance ? (
        <Number
          value={value}
          decimal={0}
          prefix={startWithSymbol ? (symbol ? symbol : '$') : undefined}
          suffix={!startWithSymbol ? (symbol ? symbol : '$') : undefined}
          size={38}
          textStyle={{ ...FontSemiBold, lineHeight: 46 }}
          subFloatNumber={subFloatNumber}
          decimalOpacity={0.45}
        />
      ) : (
        <Text style={textStyle}>******</Text>
      )}
    </View>
  );
};
