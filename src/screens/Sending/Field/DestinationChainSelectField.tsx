import React from 'react';
import { StyleProp, TouchableOpacity } from 'react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { NetworkSelectField } from 'components/Field/NetworkSelect';

interface Props {
  networkKey: string;
  label: string;
  onPressField: () => void;
  outerStyle?: StyleProp<any>;
  disabled?: boolean;
}

export const DestinationChainSelectField = ({ networkKey, label, onPressField, outerStyle, disabled }: Props) => {
  return (
    <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} onPress={onPressField} disabled={disabled}>
      <NetworkSelectField showIcon={!disabled} networkKey={networkKey} label={label} outerStyle={outerStyle} />
    </TouchableOpacity>
  );
};
