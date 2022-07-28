import React from 'react';
import {KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleProp, View} from 'react-native';
import { SubHeader, SubHeaderProps } from 'components/SubHeader';
import { ColorMap } from 'styles/color';
import { sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';

export interface ContainerWithSubHeaderProps extends SubHeaderProps {
  children: JSX.Element;
  style?: StyleProp<any>;
}

const getContainerStyle: (backgroundColor?: string) => StyleProp<any> = (backgroundColor?: string) => {
  return {
    flex: 1,
    backgroundColor: backgroundColor || ColorMap.dark1,
    paddingBottom: 22,
  };
};

export const ContainerWithSubHeader = ({ children, style, ...subHeaderProps }: ContainerWithSubHeaderProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[getContainerStyle(subHeaderProps.backgroundColor), style]}>
      <SafeAreaView style={{ backgroundColor: ColorMap.dark2, position: 'relative', zIndex: 10 }}>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
        <View style={{ height: 13.5 }} />
      </SafeAreaView>
      <SubHeader {...subHeaderProps} />
      {children}
      <SafeAreaView />
    </KeyboardAvoidingView>
  );
};
