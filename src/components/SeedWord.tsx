import { StyleProp, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import React from 'react';
import Text from '../components/Text';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';

interface SeedWordProps extends TouchableOpacityProps {
  title: string;
  backgroundColor?: string;
  color?: string;
  wrapperStyle?: StyleProp<any>;
  prefixText?: string;
  isActivated?: boolean;
  isError?: boolean;
}

function getWrapperStyle(seedWordProps: SeedWordProps): StyleProp<any> {
  const { prefixText, backgroundColor, style, isActivated, isError } = seedWordProps;
  const styleMap: StyleProp<any> = {
    position: 'relative',
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: backgroundColor || ColorMap.dark2,
    borderColor: backgroundColor || ColorMap.dark2,
    paddingLeft: prefixText ? 12 : 12,
    paddingRight: 12,
    // minWidth: 106,
  };

  if (isActivated) {
    styleMap.backgroundColor = 'transparent';
    styleMap.borderStyle = 'dashed';
  }

  if (isError) {
    styleMap.borderColor = ColorMap.danger;
  }

  if (!prefixText) {
    styleMap.justifyContent = 'center';
  }

  if (style) {
    Object.assign(styleMap, style);
  }

  return styleMap;
}

const textStyle = {
  ...sharedStyles.mainText,
  ...FontMedium,
};

function getPrefixTextStyle(isActivated?: boolean): StyleProp<any> {
  return {
    ...textStyle,
    color: ColorMap.disabled,
    marginRight: 8,
    opacity: isActivated ? 0 : 1,
  };
}

function getTitleStyle(color: string = ColorMap.light, isActivated?: boolean) {
  return {
    ...textStyle,
    color,
    opacity: isActivated ? 0 : 1,
  };
}

export const SeedWord = (seedWordProps: SeedWordProps) => {
  const { color, prefixText, title, isActivated } = seedWordProps;

  return (
    <TouchableOpacity
      disabled={isActivated}
      activeOpacity={BUTTON_ACTIVE_OPACITY}
      {...seedWordProps}
      style={getWrapperStyle(seedWordProps)}>
      {!!prefixText && <Text style={getPrefixTextStyle(isActivated)}>{prefixText}</Text>}
      <Text style={getTitleStyle(color, isActivated)}>{title}</Text>
    </TouchableOpacity>
  );
};
