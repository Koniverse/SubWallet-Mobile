import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { NetworkSelectItemContent } from 'components/NetworkSelectItemContent';

interface Props extends TouchableOpacityProps {
  itemName: string;
  itemKey: string;
  isSelected?: boolean;
  onSelectNetwork: () => void;
  defaultItemKey?: string;
  showSeparator?: boolean;
  iconSize?: number;
}

export const NetworkSelectItem = ({
  itemName,
  itemKey,
  isSelected,
  onSelectNetwork,
  defaultItemKey,
  showSeparator,
  iconSize,
}: Props) => {
  return (
    <TouchableOpacity style={{ marginBottom: 8 }} onPress={onSelectNetwork}>
      <NetworkSelectItemContent
        itemName={itemName}
        itemKey={itemKey}
        isSelected={isSelected}
        defaultItemKey={defaultItemKey}
        showSeparator={showSeparator}
        iconSize={iconSize}
      />
    </TouchableOpacity>
  );
};
