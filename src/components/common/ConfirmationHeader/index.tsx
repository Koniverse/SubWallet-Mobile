import React from 'react';
import { SubHeader } from 'components/SubHeader';
import { CaretRight } from 'phosphor-react-native';

interface Props {
  index: number;
  numberOfConfirmations: number;
  onPressPrev: () => void;
  onPressNext: () => void;
  title: string;
}

export const ConfirmationHeader = ({ onPressPrev, onPressNext, title, numberOfConfirmations, index }: Props) => {
  return (
    <SubHeader
      onPressBack={onPressPrev}
      title={title}
      rightIcon={index === numberOfConfirmations - 1 || numberOfConfirmations <= 1 ? undefined : CaretRight}
      onPressRightIcon={onPressNext}
      showLeftBtn={index > 0}
    />
  );
};
