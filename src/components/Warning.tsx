import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { SVGImages } from 'assets/index';
import { sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

interface Props {
  isDanger: boolean;
  isBelowInput?: boolean;
  warningMessage: string;
}

const warningContainer: StyleProp<any> = {
  borderRadius: 8,
  paddingHorizontal: 15,
  paddingVertical: 12,
  flexDirection: 'row',
};
const warningMessageStyle: StyleProp<any> = {
  color: ColorMap.light,
  paddingLeft: 10,
  ...sharedStyles.smallText,
};
const warningImage: StyleProp<any> = {
  paddingTop: 5,
};
const warningBackgroundColor: StyleProp<any> = {
  backgroundColor: ColorMap.warningBackgroundColor,
};
const dangerBackgroundColor: StyleProp<any> = {
  backgroundColor: ColorMap.dangerBackgroundColor,
};

export const Warning = ({ warningMessage, isDanger, isBelowInput = false }: Props) => {
  return (
    <View style={[warningContainer, isDanger ? warningBackgroundColor : dangerBackgroundColor]}>
      <View style={warningImage}>
        {isDanger ? (
          // @ts-ignore
          <SVGImages.DangerIcon width={32} height={32} />
        ) : (
          // @ts-ignore
          <SVGImages.WarningIcon width={32} height={32} />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={warningMessageStyle}>{warningMessage}</Text>
      </View>
    </View>
  );
};
