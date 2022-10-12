import { DelegationItem } from '@subwallet/extension-base/background/KoniTypes';
import CollatorItemContent from 'components/Staking/ValidatorSelectItemContent';
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface Props extends TouchableOpacityProps {
  collator: DelegationItem;
  isSelected: boolean;
  onSelect: () => void;
}

const ValidatorSelectItem = ({ collator, isSelected, onSelect }: Props) => {
  return (
    <TouchableOpacity onPress={onSelect}>
      <CollatorItemContent collator={collator} isSelected={isSelected} />
    </TouchableOpacity>
  );
};

export default React.memo(ValidatorSelectItem);
