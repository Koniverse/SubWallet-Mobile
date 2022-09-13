import React from 'react';
import { StyleProp, Switch, View, ViewProps } from 'react-native';
import Text from '../components/Text';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';

interface Props extends ViewProps {
  label: string;
  isEnabled: boolean;
  onValueChange: () => void;
  disabled?: boolean;
}

const toggleItemWrapperStyle: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: ColorMap.dark2,
  borderRadius: 5,
  paddingHorizontal: 16,
  marginBottom: 4,
};

const toggleItemTextStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  color: ColorMap.light,
  ...FontSemiBold,
  paddingVertical: 14,
};

export const ToggleItem = ({ label, isEnabled, onValueChange, style, disabled }: Props) => {
  return (
    <View style={[toggleItemWrapperStyle, style]}>
      <Text style={[toggleItemTextStyle, { color: disabled ? ColorMap.disabledTextColor : ColorMap.light }]}>
        {label}
      </Text>
      <Switch
        ios_backgroundColor={ColorMap.switchInactiveButtonColor}
        value={isEnabled}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </View>
  );
};
