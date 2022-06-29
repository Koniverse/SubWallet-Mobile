import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleProp, ViewProps } from 'react-native';
import { SubHeader, SubHeaderProps } from 'components/SubHeader';
import { ColorMap } from 'styles/color';
import { sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';

export interface ContainerWithSubHeaderProps extends SubHeaderProps {
  children: JSX.Element;
  style?: StyleProp<any>;
}

const getContainerStyle: (backgroundColor?: string) => StyleProp<any> = (backgroundColor?: string) => {
  return {
    ...sharedStyles.container,
    backgroundColor: backgroundColor || ColorMap.dark1,
    paddingBottom: 22,
  };
};

export const ContainerWithSubHeader = ({ children, style, ...subHeaderProps }: ContainerWithSubHeaderProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[getContainerStyle(subHeaderProps.backgroundColor), style]}>
      <SafeAreaView>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      </SafeAreaView>
      <SubHeader {...subHeaderProps} />
      {children}
      <SafeAreaView />
    </KeyboardAvoidingView>
  );
};
