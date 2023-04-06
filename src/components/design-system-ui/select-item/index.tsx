import { StyleProp, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { CheckCircle, IconProps } from 'phosphor-react-native';
import Text from 'components/Text';
import React from 'react';
import { BackgroundIcon, Icon } from 'components/design-system-ui';
import { FontSemiBold } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

export interface SelectItemProps {
  icon?: React.ElementType<IconProps>;
  iconColor?: string;
  backgroundColor?: string;
  onPress?: () => void;
  label: string;
  leftItemIcon?: React.ReactNode;
  isSelected?: boolean;
}

const selectItemWrapperStyle: StyleProp<ViewStyle> = {
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  paddingVertical: 14,
  backgroundColor: '#1A1A1A',
  marginBottom: 8,
};

const selectItemTextStyle: StyleProp<TextStyle> = {
  fontSize: 16,
  lineHeight: 24,
  ...FontSemiBold,
  color: ColorMap.light,
  flex: 1,
};

const SelectItem = (props: SelectItemProps) => {
  const { icon, iconColor = '#fff', isSelected, backgroundColor, label, leftItemIcon, onPress } = props;
  const theme = useSubWalletTheme().swThemes;
  return (
    <TouchableOpacity style={selectItemWrapperStyle} onPress={onPress}>
      <View style={{ marginRight: 12 }}>
        {leftItemIcon || (
          <BackgroundIcon
            shape={'circle'}
            backgroundColor={backgroundColor}
            iconColor={iconColor}
            phosphorIcon={icon}
            weight={'fill'}
          />
        )}
      </View>

      <Text numberOfLines={1} style={selectItemTextStyle}>
        {label}
      </Text>
      {isSelected && (
        <View style={{ paddingLeft: 16 }}>
          <Icon phosphorIcon={CheckCircle} size={'sm'} weight={'fill'} iconColor={theme.colorSuccess} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default SelectItem;
