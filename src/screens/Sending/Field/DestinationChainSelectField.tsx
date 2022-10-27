import React from 'react';
import { StyleProp, TouchableOpacity } from 'react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { NetworkSelectField } from 'components/Field/NetworkSelect';

interface Props {
  networkKey: string;
  label: string;
  onPressField: () => void;
  outerStyle?: StyleProp<any>;
}

export const DestinationChainSelectField = ({ networkKey, label, onPressField, outerStyle }: Props) => {
  return (
    <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} onPress={onPressField}>
      <NetworkSelectField showIcon networkKey={networkKey} label={label} outerStyle={outerStyle} />
    </TouchableOpacity>
  );
};
