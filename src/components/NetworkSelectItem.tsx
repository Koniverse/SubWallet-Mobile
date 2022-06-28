import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { NetworkSelectItemContent } from 'components/NetworkSelectItemContent';

interface Props extends TouchableOpacityProps {
  itemName: string;
  itemKey: string;
  isSelected: boolean;
  onSelectNetwork: () => void;
}

export const NetworkSelectItem = ({ itemName, itemKey, isSelected, onSelectNetwork }: Props) => {
  return (
    <TouchableOpacity onPress={onSelectNetwork}>
      <NetworkSelectItemContent itemName={itemName} itemKey={itemKey} isSelected={isSelected} />
    </TouchableOpacity>
  );
};
