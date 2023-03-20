import React from 'react';
import { SafeAreaView, StatusBar, StyleProp, StyleSheet, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { sharedStyles, STATUS_BAR_HEIGHT, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { randomIntFromInterval } from 'utils/number';
import LinearGradient from 'react-native-linear-gradient';

interface Props {
  children: JSX.Element;
  backgroundColor?: string;
  safeAreaBottomViewColor?: string;
}

function getContainerStyle(backgroundColor: string): StyleProp<any> {
  return {
    backgroundColor: backgroundColor,
    position: 'relative',
    ...sharedStyles.container,
  };
}

const backgroundColorSet = [
  ['rgba(76, 234, 172, 0.15)', 'rgba(217, 217, 217, 0)'],
  ['rgba(234, 76, 76, 0.15)', 'rgba(217, 217, 217, 0)'],
];
const gradientBackground = backgroundColorSet[randomIntFromInterval(0, 1)];

export const ScreenContainer = ({ children, backgroundColor }: Props) => {
  return (
    <View style={getContainerStyle(backgroundColor || ColorMap.dark1)}>
      <LinearGradient
        locations={[0, 0.5]}
        colors={backgroundColor ? [backgroundColor, backgroundColor] : gradientBackground}
        style={styles.gradientWrapper}>
        <SafeAreaView>
          <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
        </SafeAreaView>
        <View style={styles.contentContainer}>{children}</View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientWrapper: { flex: 1, marginTop: -STATUS_BAR_HEIGHT, paddingTop: STATUS_BAR_HEIGHT },
  contentContainer: { flex: 1, overflow: 'hidden' },
});
