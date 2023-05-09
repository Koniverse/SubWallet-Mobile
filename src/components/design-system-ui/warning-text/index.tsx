import React from 'react';
import { StyleProp, View, ViewProps } from 'react-native';
import Text from 'components/Text';
import { ColorMap } from 'styles/color';

interface Props extends ViewProps {
  isDanger?: boolean;
  message: string;
}

const getTextStyle: StyleProp<any> = (color?: string) => {
  return {
    color: color,
    paddingLeft: 10,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
  };
};

const WarningText = ({ message, isDanger, style }: Props) => {
  return (
    <View style={[{ flex: 1, alignItems: 'center' }, style]}>
      <Text style={getTextStyle(isDanger ? ColorMap.danger : ColorMap.warning)}>{message}</Text>
    </View>
  );
};

export default WarningText;
