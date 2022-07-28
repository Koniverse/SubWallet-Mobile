import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleProp, View } from 'react-native';
import { SubHeader, SubHeaderProps } from 'components/SubHeader';
import { ColorMap } from 'styles/color';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { statusBarHeight } from '../constant';

export interface ContainerWithSubHeaderProps extends SubHeaderProps {
  children: JSX.Element;
  style?: StyleProp<any>;
  statusBarColor?: string;
}

const getContainerStyle: (backgroundColor?: string) => StyleProp<any> = (backgroundColor?: string) => {
  return {
    flex: 1,
    backgroundColor: backgroundColor || ColorMap.dark1,
    paddingBottom: 22,
  };
};

export const ContainerWithSubHeader = ({
  children,
  style,
  statusBarColor = ColorMap.dark1,
  ...subHeaderProps
}: ContainerWithSubHeaderProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[getContainerStyle(subHeaderProps.backgroundColor), style]}>
      <SafeAreaView style={{ backgroundColor: statusBarColor, position: 'relative', zIndex: 10 }}>
        <View style={{ height: Platform.OS === 'android' ? statusBarHeight : 0 }} />
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
        <View style={{ height: 13.5 }} />
      </SafeAreaView>
      <SubHeader {...subHeaderProps} />
      {children}
      <SafeAreaView />
    </KeyboardAvoidingView>
  );
};
