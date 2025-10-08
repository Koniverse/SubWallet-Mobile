import React from 'react';
import { KeyboardAvoidingView, Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme.tsx';

interface Props {
  children: React.ReactNode | React.ReactNode[];
  backgroundColor?: string;
  safeAreaBottomViewColor?: string;
  gradientBackground?: [string, string];
  statusBarStyle?: StyleProp<ViewStyle>;
}

export const TransactionContainer = ({ children, statusBarStyle }: Props) => {
  const theme = useSubWalletTheme().swThemes;

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[
        statusBarStyle,
        {
          paddingTop: Platform.select({ ios: DeviceInfo.hasNotch() ? 0 : 0, android: DeviceInfo.hasNotch() ? 0 : 8 }),
          backgroundColor: theme.colorBgDefault,
        },
        styles.container,
      ]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}>
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
