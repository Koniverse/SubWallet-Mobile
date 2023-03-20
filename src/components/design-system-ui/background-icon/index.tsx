import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { IconProps } from 'phosphor-react-native';
import { IconWeight } from 'phosphor-react-native/lib/typescript';
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
// @ts-ignore
import SuperEllipseMask from 'react-native-super-ellipse-mask';
import { Icon } from '..';
import BackgroundIconStyles from './style';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ImageShape } from '@subwallet/react-ui/es/image';

interface BackgroundIconProps {
  shape?: ImageShape;
  type?: 'fontAwesome' | 'phosphor';
  size?: 'xs' | 'sm' | 'md';
  phosphorIcon?: React.ElementType<IconProps>;
  fontawesomeIcon?: IconProp;
  weight?: IconWeight;
  iconColor?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

const BackgroundIcon: React.FC<BackgroundIconProps> = ({
  shape = 'default',
  type,
  size = 'sm',
  style,
  phosphorIcon,
  fontawesomeIcon,
  weight,
  iconColor,
  backgroundColor,
}) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = BackgroundIconStyles(theme);
  function getBackgroundIconSize() {
    if (size === 'xs') {
      return 12;
    }
    if (size === 'sm') {
      return 16;
    }

    return 24;
  }

  if (shape === 'squircle') {
    return (
      <View style={style}>
        <SuperEllipseMask radius={(getBackgroundIconSize() + 4) / 2.5}>
          <View style={[{ backgroundColor }, _style[`${shape}Icon`]]}>
            <Icon
              type={type}
              phosphorIcon={phosphorIcon}
              fontawesomeIcon={fontawesomeIcon}
              iconColor={iconColor}
              customSize={getBackgroundIconSize()}
              weight={weight}
            />
          </View>
        </SuperEllipseMask>
      </View>
    );
  }

  return (
    <View style={[{ backgroundColor }, _style[`${shape}Icon`], style]}>
      <Icon
        type={type}
        phosphorIcon={phosphorIcon}
        fontawesomeIcon={fontawesomeIcon}
        iconColor={iconColor}
        customSize={getBackgroundIconSize()}
        weight={weight}
      />
    </View>
  );
};

export default BackgroundIcon;
