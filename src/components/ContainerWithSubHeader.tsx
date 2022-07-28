import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleProp, View } from 'react-native';
import { SubHeader, SubHeaderProps } from 'components/SubHeader';
import { ColorMap } from 'styles/color';
import {
  getStatusBarPlaceholderStyle,
  sharedStyles,
  STATUS_BAR_HEIGHT,
  STATUS_BAR_LIGHT_CONTENT,
} from 'styles/sharedStyles';

export interface ContainerWithSubHeaderProps extends SubHeaderProps {
  children: JSX.Element;
  style?: StyleProp<any>;
  statusBarColor?: string;
}

const getContainerStyle: (backgroundColor?: string) => StyleProp<any> = (backgroundColor?: string) => {
  return {
    ...sharedStyles.container,
    backgroundColor: backgroundColor || ColorMap.dark1,
    paddingBottom: 22,
    paddingTop: STATUS_BAR_HEIGHT + 13.5,
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
      <View style={getStatusBarPlaceholderStyle(statusBarColor)} />
      <SafeAreaView>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      </SafeAreaView>
      <SubHeader {...subHeaderProps} />
      {children}
      <SafeAreaView />
    </KeyboardAvoidingView>
  );
};
