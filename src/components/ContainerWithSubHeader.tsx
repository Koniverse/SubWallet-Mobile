import React, { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, StyleProp, View } from 'react-native';
import { SubHeader, SubHeaderProps } from 'components/SubHeader';
import { Header } from 'components/Header';
import { Edges, SafeAreaView } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';

export interface ContainerWithSubHeaderProps extends SubHeaderProps {
  children: JSX.Element | JSX.Element[];
  style?: StyleProp<any>;
  isShowMainHeader?: boolean;
  isShowPlaceHolder?: boolean;
  androidKeyboardVerticalOffset?: number;
  disabledMainHeader?: boolean;
  isHideBottomSafeArea?: boolean;
}

const getContainerStyle: (backgroundColor?: string) => StyleProp<any> = (backgroundColor?: string) => {
  return {
    flex: 1,
    backgroundColor: backgroundColor || '#0C0C0C',
    paddingTop: Platform.OS === 'ios' && DeviceInfo.hasNotch() ? 0 : 8,
    width: '100%',
  };
};

export const ContainerWithSubHeader = ({
  children,
  style,
  isShowMainHeader = false,
  androidKeyboardVerticalOffset,
  titleTextAlign,
  disabledMainHeader,
  isHideBottomSafeArea = false,
  ...subHeaderProps
}: ContainerWithSubHeaderProps) => {
  const edges = useMemo((): Edges => {
    if (isHideBottomSafeArea) {
      return ['top'];
    }

    return ['top', 'bottom'];
  }, [isHideBottomSafeArea]);

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: subHeaderProps.backgroundColor || '#0C0C0C' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: androidKeyboardVerticalOffset })}
        style={[getContainerStyle(subHeaderProps.backgroundColor), style]}>
        {isShowMainHeader && (
          <View style={{ marginBottom: 16 }}>
            <Header disabled={disabledMainHeader} />
          </View>
        )}
        <SubHeader {...subHeaderProps} titleTextAlign={titleTextAlign} />
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
