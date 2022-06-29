import React from 'react';
import { StyleProp, Switch, Text, View, ViewProps } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';

interface Props extends ViewProps {
  label: string;
  isEnabled: boolean;
  onValueChange: () => void;
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

export const ToggleItem = ({ label, isEnabled, onValueChange, style }: Props) => {
  return (
    <View style={[toggleItemWrapperStyle, style]}>
      <Text style={toggleItemTextStyle}>{label}</Text>
      <Switch ios_backgroundColor="rgba(120,120,128,0.32)" value={isEnabled} onValueChange={onValueChange} />
    </View>
  );
};
