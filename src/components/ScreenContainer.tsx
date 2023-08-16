import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { sharedStyles, STATUS_BAR_HEIGHT, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import LinearGradient from 'react-native-linear-gradient';
import DeviceInfo from 'react-native-device-info';

interface Props {
  children: React.ReactNode | React.ReactNode[];
  backgroundColor?: string;
  safeAreaBottomViewColor?: string;
  gradientBackground?: [string, string];
  statusBarStyle?: StyleProp<ViewStyle>;
}

function getContainerStyle(backgroundColor: string): StyleProp<any> {
  return {
    backgroundColor: backgroundColor,
    position: 'relative',
    ...sharedStyles.container,
  };
}

export const GradientBackgroundColorSet: [string, string][] = [
  ['rgba(76, 234, 172, 0.15)', 'rgba(217, 217, 217, 0)'],
  ['rgba(234, 76, 76, 0.15)', 'rgba(217, 217, 217, 0)'],
  ['rgba(0, 75, 255, 0.15)', 'rgba(217, 217, 217, 0)'],
];

export const ScreenContainer = ({
  children,
  backgroundColor,
  gradientBackground = ['transparent', 'transparent'],
  statusBarStyle,
}: Props) => {
  return (
    <View style={getContainerStyle(backgroundColor || ColorMap.dark1)}>
      <LinearGradient
        locations={[0, 0.5]}
        colors={backgroundColor ? [backgroundColor, backgroundColor] : gradientBackground}
        style={styles.gradientWrapper}
      />
      <SafeAreaView
        style={[statusBarStyle, { marginTop: DeviceInfo.hasNotch() ? 0 : Platform.OS === 'android' ? 0 : 8 }]}>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      </SafeAreaView>
      <View style={styles.contentContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientWrapper: {
    flex: 1,
    marginTop: -STATUS_BAR_HEIGHT,
    paddingTop: STATUS_BAR_HEIGHT,
    height: 600,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  contentContainer: { flex: 1, overflow: 'hidden', paddingTop: Platform.OS === 'ios' ? 0 : 8 },
});
