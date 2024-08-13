import { StyleProp, TextStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import React, { useMemo } from 'react';
import Text from '../components/Text';
import { ColorMap } from 'styles/color';
import { FontMedium } from 'styles/sharedStyles';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface SeedWordProps extends TouchableOpacityProps {
  title: string;
  backgroundColor?: string;
  color?: string;
  wrapperStyle?: StyleProp<any>;
  prefixText?: string;
  isActivated?: boolean;
  isError?: boolean;
  isHidden?: boolean;
}

function getWrapperStyle(seedWordProps: SeedWordProps): StyleProp<any> {
  const { prefixText, backgroundColor, style, isActivated, isError, isHidden } = seedWordProps;
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

  if (isHidden) {
    styleMap.backgroundColor = 'transparent';
    styleMap.borderStyle = 'none';
    styleMap.borderColor = 'transparent';
  }

  if (!prefixText) {
    styleMap.justifyContent = 'center';
  }

  if (style) {
    Object.assign(styleMap, style);
  }

  return styleMap;
}

function getPrefixTextStyle(isActivated?: boolean): StyleProp<any> {
  return {
    color: ColorMap.disabled,
    marginRight: 8,
    opacity: isActivated ? 0 : 1,
  };
}

function getTitleStyle(color: string = ColorMap.light, isActivated?: boolean) {
  return {
    color,
    opacity: isActivated ? 0 : 1,
  };
}

export const SeedWord = (seedWordProps: SeedWordProps) => {
  const { color, prefixText, title, isActivated } = seedWordProps;
  const theme = useSubWalletTheme().swThemes;
  const textStyle = useMemo(
    (): TextStyle => ({
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      ...FontMedium,
    }),
    [theme.fontSizeSM, theme.lineHeightSM],
  );

  return (
    <TouchableOpacity
      disabled={isActivated}
      activeOpacity={BUTTON_ACTIVE_OPACITY}
      {...seedWordProps}
      style={getWrapperStyle(seedWordProps)}>
      {!!prefixText && <Text style={[textStyle, getPrefixTextStyle(isActivated)]}>{prefixText}</Text>}
      <Text style={[textStyle, getTitleStyle(color, isActivated)]}>{title}</Text>
    </TouchableOpacity>
  );
};
