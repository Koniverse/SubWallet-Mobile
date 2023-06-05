import React from 'react';
import { StyleProp, Switch, View, ViewProps } from 'react-native';
import Text from '../components/Text';
import { ColorMap } from 'styles/color';
import { DisabledStyle, FontSemiBold } from 'styles/sharedStyles';
import { BackgroundIcon } from './design-system-ui';
import { IconProps } from 'phosphor-react-native';

interface Props extends ViewProps {
  label: string;
  isEnabled: boolean;
  onValueChange: () => void;
  disabled?: boolean;
  backgroundIcon?: React.ElementType<IconProps>;
  backgroundIconColor?: string;
}

const toggleItemWrapperStyle: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#1A1A1A',
  borderRadius: 8,
  paddingHorizontal: 12,
  marginBottom: 8,
};

const toggleItemTextStyle: StyleProp<any> = {
  fontSize: 16,
  lineHeight: 24,
  color: ColorMap.light,
  ...FontSemiBold,
  paddingVertical: 14,
  maxWidth: 240,
};

export const ToggleItem = ({
  label,
  isEnabled,
  onValueChange,
  style,
  disabled,
  backgroundIconColor,
  backgroundIcon,
}: Props) => {
  return (
    <View style={[toggleItemWrapperStyle, disabled && DisabledStyle, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {backgroundIcon && (
          <BackgroundIcon
            phosphorIcon={backgroundIcon}
            size={'sm'}
            backgroundColor={backgroundIconColor}
            weight={'fill'}
            shape={'circle'}
          />
        )}
        <Text numberOfLines={1} style={[toggleItemTextStyle, { color: ColorMap.light }]}>
          {label}
        </Text>
      </View>

      <Switch
        ios_backgroundColor={ColorMap.switchInactiveButtonColor}
        value={isEnabled}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </View>
  );
};
