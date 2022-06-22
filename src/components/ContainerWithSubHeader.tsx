import React from 'react';
import { SafeAreaView, StatusBar, StyleProp } from 'react-native';
import { SubHeader, SubHeaderProps } from 'components/SubHeader';
import { ColorMap } from 'styles/color';
import { sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';

export interface ContainerWithSubHeaderProps extends SubHeaderProps {
  children: JSX.Element;
}

const getContainerStyle: (backgroundColor?: string) => StyleProp<any> = (backgroundColor?: string) => {
  return {
    ...sharedStyles.container,
    backgroundColor: backgroundColor || ColorMap.dark1,
  };
};

export const ContainerWithSubHeader = ({ children, ...subHeaderProps }: ContainerWithSubHeaderProps) => {
  return (
    <SafeAreaView style={getContainerStyle(subHeaderProps.backgroundColor)}>
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      <SubHeader {...subHeaderProps} />
      {children}
    </SafeAreaView>
  );
};
