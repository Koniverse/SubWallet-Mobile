import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { SVGImages } from 'assets/index';
import {FontBold, FontSize0, sharedStyles} from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

interface Props {
  isDanger: boolean;
  isBelowInput?: boolean;
  warningMessage: string;
  messageTitle: string;
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
  paddingHorizontal: 15,
  paddingVertical: 12,
  flexDirection: 'row',
};

const warningBackgroundColor: StyleProp<any> = {
  backgroundColor: ColorMap.warningOverlay,
};
const dangerBackgroundColor: StyleProp<any> = {
  backgroundColor: ColorMap.dangerOverlay,
};

export const Warning = ({ warningMessage, isDanger, messageTitle, isBelowInput = false }: Props) => {
  return (
    <View style={[warningContainer, isDanger ? dangerBackgroundColor : warningBackgroundColor]}>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={getTitleStyle(isDanger ? ColorMap.danger : ColorMap.warning)}>{messageTitle}</Text>
        <Text style={getTextStyle(isDanger ? ColorMap.danger : ColorMap.warning)}>{warningMessage}</Text>
      </View>
    </View>
  );
};
