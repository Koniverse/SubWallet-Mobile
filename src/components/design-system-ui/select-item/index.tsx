import { TouchableOpacity, View } from 'react-native';
import { CheckCircle, IconProps, IconWeight } from 'phosphor-react-native';
import Text from 'components/Text';
import React, { useMemo } from 'react';
import { BackgroundIcon, Icon } from 'components/design-system-ui';

import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

import createStyle from './styles';

export interface SelectItemProps {
  icon?: React.ElementType<IconProps>;
  iconColor?: string;
  iconWeight?: IconWeight;
  backgroundColor?: string;
  onPress?: () => void;
  label: string;
  leftItemIcon?: React.ReactNode;
  isSelected?: boolean;
  rightIcon?: React.ReactNode;
  textColor?: string;
  showUnselect?: boolean;
  disabled?: boolean;
  rightItem?: React.ReactNode;
}

const SelectItem = (props: SelectItemProps) => {
  const {
    icon,
    disabled,
    iconColor = '#fff',
    isSelected,
    backgroundColor,
    label,
    leftItemIcon,
    onPress,
    showUnselect,
    rightItem,
    rightIcon,
    textColor,
    iconWeight = 'fill',
  } = props;
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <TouchableOpacity
      style={[styles.wrapper, disabled && styles.wrapperDisable]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? theme.opacityDisable : theme.opacityPress}>
      {!!(icon || leftItemIcon) && (
        <View style={styles.left}>
          {leftItemIcon || (
            <BackgroundIcon
              shape={'circle'}
              backgroundColor={backgroundColor}
              iconColor={iconColor}
              phosphorIcon={icon}
              weight={iconWeight}
            />
          )}
        </View>
      )}
      <Text
        numberOfLines={1}
        style={[styles.text, { color: !disabled ? textColor || '#FFF' : 'rgba(255, 255, 255, 0.3)' }]}>
        {label}
      </Text>
      {(rightIcon || rightItem || showUnselect || isSelected) && (
        <View style={{ paddingLeft: 16, display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {(showUnselect || isSelected) && (
            <Icon
              phosphorIcon={CheckCircle}
              size={'sm'}
              weight={iconWeight}
              iconColor={isSelected ? theme.colorSuccess : theme['gray-5']}
            />
          )}
          {rightItem}
          {rightIcon && <View style={{ paddingLeft: 10 }}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default SelectItem;
