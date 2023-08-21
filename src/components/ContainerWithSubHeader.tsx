import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleProp, View } from 'react-native';
import { SubHeader, SubHeaderProps } from 'components/SubHeader';
import { Header } from 'components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';

export interface ContainerWithSubHeaderProps extends SubHeaderProps {
  children: JSX.Element | JSX.Element[];
  style?: StyleProp<any>;
  isShowMainHeader?: boolean;
  isShowPlaceHolder?: boolean;
  androidKeyboardVerticalOffset?: number;
  disabledMainHeader?: boolean;
}

const getContainerStyle: (insetTop: number, backgroundColor?: string) => StyleProp<any> = (
  insetTop: number,
  backgroundColor?: string,
) => {
  return {
    flex: 1,
    backgroundColor: backgroundColor || '#0C0C0C',
    paddingTop: insetTop + (Platform.OS === 'ios' && DeviceInfo.hasNotch() ? 0 : 8),
  };
};

export const ContainerWithSubHeader = ({
  children,
  style,
  isShowMainHeader = false,
  androidKeyboardVerticalOffset,
  titleTextAlign,
  disabledMainHeader,
  ...subHeaderProps
}: ContainerWithSubHeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: androidKeyboardVerticalOffset })}
      style={[getContainerStyle(insets.top, subHeaderProps.backgroundColor), style]}>
      {isShowMainHeader && (
        <View style={{ marginBottom: 16 }}>
          <Header disabled={disabledMainHeader} />
        </View>
      )}
      <SubHeader {...subHeaderProps} titleTextAlign={titleTextAlign} />
      {children}
      <SafeAreaView />
    </KeyboardAvoidingView>
  );
};
