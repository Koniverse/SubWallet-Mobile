import { DelegationItem } from '@subwallet/extension-base/background/KoniTypes';
import DelegationSelectItemContent from 'components/Staking/DelegationSelectItemContent';
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface Props extends TouchableOpacityProps {
  collator: DelegationItem;
  isSelected: boolean;
  onSelect: () => void;
}

const DelegationSelectItem = ({ collator, isSelected, onSelect }: Props) => {
  return (
    <TouchableOpacity onPress={onSelect}>
      <DelegationSelectItemContent collator={collator} isSelected={isSelected} />
    </TouchableOpacity>
  );
};

export default React.memo(DelegationSelectItem);
