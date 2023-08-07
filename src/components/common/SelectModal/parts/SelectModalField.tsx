import { StyleProp, TouchableOpacity } from 'react-native';
import { DisabledStyle } from 'styles/sharedStyles';
import React from 'react';
import { FieldBaseProps } from 'components/Field/Base';

interface Props extends FieldBaseProps {
  outerStyle?: StyleProp<any>;
  onPressField?: () => void;
  renderSelected?: () => JSX.Element;
  disabled?: boolean;
}

export const SelectModalField = ({ onPressField, renderSelected, disabled }: Props) => {
  return (
    <TouchableOpacity disabled={disabled} style={disabled && DisabledStyle} onPress={onPressField}>
      {renderSelected && renderSelected()}
    </TouchableOpacity>
  );
};
