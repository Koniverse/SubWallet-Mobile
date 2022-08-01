import React from 'react';
import { StyleProp, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import Text from '../components/Text';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { CircleWavyCheck } from 'phosphor-react-native';

interface Props extends TouchableOpacityProps {
  label: string;
  isSelected: boolean;
}

const modalItemStyle: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  paddingVertical: 14,
};

export const ModalSelectItem = ({ label, isSelected, onPress, style }: Props) => {
  return (
    <TouchableOpacity style={[modalItemStyle, style]} onPress={onPress}>
      <Text style={{ ...sharedStyles.mediumText, ...FontSemiBold, color: ColorMap.light }}>{label}</Text>
      {isSelected && <CircleWavyCheck color={ColorMap.primary} size={20} weight={'bold'} />}
    </TouchableOpacity>
  );
};
