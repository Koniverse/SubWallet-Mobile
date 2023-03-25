import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { SizeType } from '@subwallet/react-ui/es/config-provider/SizeContext';
import { IconProps } from 'phosphor-react-native';
import { IconWeight } from 'phosphor-react-native/lib/typescript';
import React from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

export interface SWIconProps {
  customSize?: number;
  fontawesomeIcon?: IconProp;
  iconColor?: string;
  phosphorIcon?: React.ElementType<IconProps>;
  size?: 'xxs' | SizeType;
  type?: 'fontAwesome' | 'phosphor';
  weight?: IconWeight;
}

const Icon: React.FC<SWIconProps> = ({
  customSize,
  fontawesomeIcon,
  iconColor,
  phosphorIcon: PhosphorIcon,
  size,
  type = 'phosphor',
  weight,
}) => {
  const theme = useSubWalletTheme().swThemes;

  function getIconSize() {
    if (!size) {
      return undefined;
    }

    if (size === 'xxs') {
      return 12;
    }

    if (size === 'xs') {
      return 16;
    }
    if (size === 'sm') {
      return 20;
    }
    if (size === 'md') {
      return 24;
    }
    if (size === 'lg') {
      return 28;
    }

    return 32;
  }

  if (type === 'fontAwesome' && fontawesomeIcon) {
    return (
      <FontAwesomeIcon
        icon={fontawesomeIcon}
        size={customSize || getIconSize()}
        color={iconColor || theme.colorWhite}
      />
    );
  }

  if (type === 'phosphor' && PhosphorIcon) {
    return <PhosphorIcon size={customSize || getIconSize()} color={iconColor || theme.colorWhite} weight={weight} />;
  }

  return <></>;
};

export default Icon;
