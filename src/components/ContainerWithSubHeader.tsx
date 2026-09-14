import React, { JSX, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, StyleProp, View } from 'react-native';
import { Header } from 'components/Header';
import { Edges, SafeAreaView } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import { SubHeader, SubHeaderProps } from 'components/SubHeader';

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
      {/* 'padding' on Android too. 'height' keeps its own accumulated state
          (_initialFrameHeight, state.bottom + frame) and re-derives the view height from
          every keyboardDidShow/Hide it receives; on top of the window resize the OS may or
          may not do under edge-to-edge (adjustResize + enableEdgeToEdge), that made the
          footer bounce between the bottom of the screen and mid-screen and sometimes stay
          shrunk after the keyboard closed (MIUI fires several show/hide events). 'padding'
          only adds the part of the keyboard that still overlaps the current frame, so it is
          a no-op when the window already resized and exact when it did not. */}
      <KeyboardAvoidingView
        behavior={'padding'}
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
