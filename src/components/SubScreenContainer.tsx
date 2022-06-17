import React from 'react';
import { ContainerWithSubHeader, ContainerWithSubHeaderProps } from 'components/ContainerWithSubHeader';

interface Props extends Omit<ContainerWithSubHeaderProps, 'onPressBack'> {
  navigation: any;
}

export const SubScreenContainer = ({ navigation, ...containerWithSubHeaderProp }: Props) => {
  const onPressBack = () => {
    navigation.goBack();
  };

  return (
    <ContainerWithSubHeader {...containerWithSubHeaderProp} onPressBack={onPressBack}>
      {containerWithSubHeaderProp.children}
    </ContainerWithSubHeader>
  );
};
