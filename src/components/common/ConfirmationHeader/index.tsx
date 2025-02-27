import React from 'react';
import { SubHeader } from 'components/SubHeader';
import { CaretRight } from 'phosphor-react-native';
import { View } from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  return (
    <>
      {isFullHeight && <View style={{ paddingTop: insets.top }} />}
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
