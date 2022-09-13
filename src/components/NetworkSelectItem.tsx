import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { NetworkSelectItemContent } from 'components/NetworkSelectItemContent';
import { ContainerHorizontalPadding } from 'styles/sharedStyles';

interface Props extends TouchableOpacityProps {
  itemName: string;
  itemKey: string;
  isSelected: boolean;
  onSelectNetwork: () => void;
  defaultItemKey?: string;
}

export const NetworkSelectItem = ({ itemName, itemKey, isSelected, onSelectNetwork, defaultItemKey }: Props) => {
  return (
    <TouchableOpacity onPress={onSelectNetwork} style={{ ...ContainerHorizontalPadding }}>
      <NetworkSelectItemContent
        itemName={itemName}
        itemKey={itemKey}
        isSelected={isSelected}
        defaultItemKey={defaultItemKey}
      />
    </TouchableOpacity>
  );
};
