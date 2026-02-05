import React from 'react';
import { SubHeader } from 'components/SubHeader';
import { CaretRightIcon } from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

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
  const { top } = useSafeAreaInsets();

  return (
    <>
      {isFullHeight && <View style={{ paddingTop: top }} />}
      <SubHeader
        onPressBack={onPressPrev}
        title={title}
        titleTextAlign="center"
        rightIcon={index === numberOfConfirmations - 1 || numberOfConfirmations <= 1 ? undefined : CaretRightIcon}
        onPressRightIcon={onPressNext}
        showLeftBtn={index > 0}
      />
    </>
  );
};
