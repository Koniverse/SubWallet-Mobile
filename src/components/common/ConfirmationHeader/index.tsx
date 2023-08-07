import React from 'react';
import { SubHeader } from 'components/SubHeader';
import { CaretRight } from 'phosphor-react-native';
import { SafeAreaView } from 'react-native';

interface Props {
  index: number;
  numberOfConfirmations: number;
  onPressPrev: () => void;
  onPressNext: () => void;
  title: string;
  isFullHeight?: boolean;
}

export const ConfirmationHeader = ({
  onPressPrev,
  onPressNext,
  title,
  numberOfConfirmations,
  index,
  isFullHeight,
}: Props) => {
  return (
    <>
      {isFullHeight && <SafeAreaView />}
      <SubHeader
        onPressBack={onPressPrev}
        title={title}
        titleTextAlign="center"
        rightIcon={index === numberOfConfirmations - 1 || numberOfConfirmations <= 1 ? undefined : CaretRight}
        onPressRightIcon={onPressNext}
        showLeftBtn={index > 0}
      />
    </>
  );
};
