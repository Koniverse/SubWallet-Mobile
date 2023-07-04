import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleProp, View } from 'react-native';
import { SubHeader, SubHeaderProps } from 'components/SubHeader';
import { getStatusBarPlaceholderStyle, STATUS_BAR_HEIGHT, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { Header } from 'components/Header';

export interface ContainerWithSubHeaderProps extends SubHeaderProps {
  children: JSX.Element | JSX.Element[];
  style?: StyleProp<any>;
  isShowMainHeader?: boolean;
  isShowPlaceHolder?: boolean;
  statusBarColor?: string;
  needGapWithStatusBar?: boolean;
  androidKeyboardVerticalOffset?: number;
}

const getContainerStyle: (
  backgroundColor?: string,
  needGapWithStatusBar?: boolean,
  isShowPlaceHolder?: boolean,
) => StyleProp<any> = (backgroundColor?: string, needGapWithStatusBar?: boolean, isShowPlaceHolder?: boolean) => {
  let marginTop = 0;
  if (isShowPlaceHolder) {
    if (needGapWithStatusBar) {
      marginTop = STATUS_BAR_HEIGHT + 8;
    } else {
      marginTop = STATUS_BAR_HEIGHT;
    }
  } else {
    if (needGapWithStatusBar) {
      marginTop = 8;
    }
  }
  return {
    flex: 1,
    backgroundColor: backgroundColor || '#0C0C0C',
    paddingTop: marginTop,
  };
};

export const ContainerWithSubHeader = ({
  children,
  style,
  isShowPlaceHolder = true,
  isShowMainHeader = false,
  statusBarColor = ColorMap.dark1,
  needGapWithStatusBar = true,
  androidKeyboardVerticalOffset,
  titleTextAlign,
  ...subHeaderProps
}: ContainerWithSubHeaderProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: androidKeyboardVerticalOffset })}
      style={[getContainerStyle(subHeaderProps.backgroundColor, needGapWithStatusBar, isShowPlaceHolder), style]}>
      {isShowPlaceHolder && <View style={getStatusBarPlaceholderStyle(statusBarColor)} />}
      <SafeAreaView>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      </SafeAreaView>
      {isShowMainHeader && (
        <View style={{ marginTop: Platform.OS === 'ios' ? 8 : STATUS_BAR_HEIGHT + 8, marginBottom: 16 }}>
          <Header />
        </View>
      )}
      <SubHeader {...subHeaderProps} titleTextAlign={titleTextAlign} />
      {children}
      <SafeAreaView />
    </KeyboardAvoidingView>
  );
};
