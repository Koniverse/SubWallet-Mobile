import React from 'react';
import { StyleProp, View, ViewProps } from 'react-native';
import Text from 'components/Text';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

interface Props extends ViewProps {
  isDanger?: boolean;
  title?: string;
  message: string;
}

const getTextStyle: StyleProp<any> = (color?: string) => {
  return {
    color: color,
    paddingLeft: 10,
    ...sharedStyles.mainText,
    textAlign: 'center',
  };
};

const getTitleStyle: StyleProp<any> = (color?: string) => {
  return {
    color: color,
    paddingLeft: 10,
    ...sharedStyles.mainText,
    ...FontBold,
    textAlign: 'center',
    paddingBottom: 8,
  };
};

const warningContainer: StyleProp<any> = {
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingTop: 17,
  paddingBottom: 14,
  flexDirection: 'row',
};

const warningBackgroundColor: StyleProp<any> = {
  backgroundColor: ColorMap.warningOverlay,
};
const dangerBackgroundColor: StyleProp<any> = {
  backgroundColor: ColorMap.dangerOverlay,
};

export const Warning = ({ message, isDanger, title, style }: Props) => {
  return (
    <View style={[warningContainer, isDanger ? dangerBackgroundColor : warningBackgroundColor, style]}>
      <View style={{ flex: 1, alignItems: 'center' }}>
        {title && <Text style={getTitleStyle(isDanger ? ColorMap.danger : ColorMap.warning)}>{title}</Text>}
        <Text style={getTextStyle(isDanger ? ColorMap.danger : ColorMap.warning)}>{message}</Text>
      </View>
    </View>
  );
};
