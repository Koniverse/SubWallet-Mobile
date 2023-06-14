import React from 'react';
import { ContainerWithSubHeader, ContainerWithSubHeaderProps } from 'components/ContainerWithSubHeader';

interface Props extends Omit<ContainerWithSubHeaderProps, 'onPressBack'> {
  navigation: any;
  onPressLeftBtn?: () => void;
}

export const SubScreenContainer = ({ navigation, onPressLeftBtn, ...containerWithSubHeaderProp }: Props) => {
  const onPressBack = () => {
    navigation.goBack();
  };

  return (
    <ContainerWithSubHeader {...containerWithSubHeaderProp} onPressBack={onPressLeftBtn || onPressBack}>
      {containerWithSubHeaderProp.children}
    </ContainerWithSubHeader>
  );
};
