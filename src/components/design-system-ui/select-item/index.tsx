import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { CheckCircle, IconProps } from 'phosphor-react-native';
import Text from 'components/Text';
import React from 'react';
import { BackgroundIcon, Icon } from 'components/design-system-ui';
import { FontSemiBold } from 'styles/sharedStyles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

export interface SelectItemProps {
  icon?: React.ElementType<IconProps>;
  iconColor?: string;
  backgroundColor?: string;
  onPress?: () => void;
  label: string;
  leftItemIcon?: React.ReactNode;
  isSelected?: boolean;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  textColor?: string;
}

const selectItemWrapperStyle: StyleProp<ViewStyle> = {
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  paddingVertical: 14,
  backgroundColor: '#1A1A1A',
  marginBottom: 8,
  height: 52,
};

const getSelectItemTextStyle = (disabled: boolean, textColor?: string) => {
  return {
    fontSize: 16,
    lineHeight: 24,
    ...FontSemiBold,
    color: !disabled ? textColor || '#FFF' : 'rgba(255, 255, 255, 0.3)',
    flex: 1,
  };
};

const SelectItem = (props: SelectItemProps) => {
  const {
    icon,
    iconColor = '#fff',
    isSelected,
    backgroundColor,
    label,
    leftItemIcon,
    onPress,
    rightIcon,
    disabled,
    textColor,
  } = props;
  const theme = useSubWalletTheme().swThemes;
  return (
    <TouchableOpacity style={selectItemWrapperStyle} onPress={onPress} disabled={disabled}>
      {leftItemIcon ||
        (icon && (
          <View style={{ marginRight: 12 }}>
            <BackgroundIcon
              shape={'circle'}
              backgroundColor={backgroundColor}
              iconColor={iconColor}
              phosphorIcon={icon}
              weight={'fill'}
              size={'sm'}
            />
          </View>
        ))}

      <Text numberOfLines={1} style={getSelectItemTextStyle(!!disabled, textColor)}>
        {label}
      </Text>
      {isSelected && (
        <View style={{ paddingLeft: 16 }}>
          <Icon phosphorIcon={CheckCircle} size={'sm'} weight={'fill'} iconColor={theme.colorSuccess} />
        </View>
      )}
      {rightIcon && <View style={{ paddingLeft: 10 }}>{rightIcon}</View>}
    </TouchableOpacity>
  );
};

export default SelectItem;
