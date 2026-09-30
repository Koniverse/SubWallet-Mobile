import React from 'react';
import { KeyboardAvoidingView, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardVisible } from 'hooks/useKeyboardVisible';
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
  const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible();
  const insets = useSafeAreaInsets();

  /**
   * On iOS the keyboard inset is ours, not KeyboardAvoidingView's.
   *
   * RN's view caches the last computed bottom in an instance field and its componentDidUpdate
   * re-applies that field on *every* re-render, while the height itself is computed in an async
   * method that can resolve after the keyboard has already gone. On a transaction screen, which
   * re-renders constantly from live balance and pool data, that showed up as the form collapsing
   * by a keyboard's height for two to four frames, about once a second, with no keyboard on
   * screen (the scroll area shrank and the footer button jumped to mid-screen).
   *
   * useKeyboardVisible listens to keyboardWillShow/WillHide on iOS, so this is applied just as
   * early, and it is exactly 0 whenever the keyboard is not up - there is nothing to go stale.
   *
   * Android keeps the KeyboardAvoidingView: there the window itself resizes, where 'padding' is a
   * no-op, and it is exact where it does not (see ContainerWithSubHeader for that story).
   */
  const iosKeyboardInset = isKeyboardVisible ? Math.max(keyboardHeight - insets.bottom, 0) : 0;

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
      {Platform.OS === 'ios' ? (
        <View style={[styles.container, { paddingBottom: iosKeyboardInset }]}>{children}</View>
      ) : (
        /* See ContainerWithSubHeader for why this is 'padding' on Android as well. */
        <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={0} style={{ flex: 1 }}>
          {children}
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
