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
  children: JSX.Element | JSX.Element[];
  style?: StyleProp<any>;
  isShowPlaceHolder?: boolean;
  statusBarColor?: string;
  needGapWithStatusBar?: boolean;
}

const getContainerStyle: (backgroundColor?: string, needGapWithStatusBar?: boolean) => StyleProp<any> = (
  backgroundColor?: string,
  needGapWithStatusBar?: boolean,
) => {
  return {
    ...sharedStyles.container,
    backgroundColor: backgroundColor || '#0C0C0C',
    paddingTop: needGapWithStatusBar ? STATUS_BAR_HEIGHT + 13 : 16,
  };
};

export const ContainerWithSubHeader = ({
  children,
  style,
  isShowPlaceHolder = true,
  statusBarColor = ColorMap.dark1,
  needGapWithStatusBar = true,
  ...subHeaderProps
}: ContainerWithSubHeaderProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[getContainerStyle(subHeaderProps.backgroundColor, needGapWithStatusBar), style]}>
      {isShowPlaceHolder && <View style={getStatusBarPlaceholderStyle(statusBarColor)} />}
      <SafeAreaView>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      </SafeAreaView>
      <SubHeader {...subHeaderProps} />
      {children}
      <SafeAreaView />
    </KeyboardAvoidingView>
  );
};
