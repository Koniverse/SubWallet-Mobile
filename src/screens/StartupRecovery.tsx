import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import RNRestart from 'react-native-restart-newarch';
import { ActivityIndicator, Button, Typography } from 'components/design-system-ui';
import { DEV_WEB_RUNNER_URL } from 'constants/localStorage';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { devMode, mmkvStore } from 'utils/storage';

/**
 * Replaces the plain spinner once the app has stayed not-ready for far too long.
 *
 * The web runner is the only way in: App gates the whole navigator on isWebRunnerReady, so a runner
 * that never starts - a custom `__development_web_runner_url__` that stopped answering, Dev Mode
 * stored by a build that ships no DevModeWeb.bundle - used to leave the user on the splash forever,
 * with the Web View Debugger that could undo either setting unreachable behind it. This panel is
 * that missing way out, and it clears only those two debug settings: no accounts, no keyring, no
 * app data. Strings are hardcoded English like the Outdated Webview panel in App.tsx, the other
 * last-resort screen that can show up before i18n is usable.
 */
export function StartupRecovery() {
  const [isResetting, setResetting] = useState(false);
  const restartTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => () => restartTimeout.current && clearTimeout(restartTimeout.current), []);

  const onPressReset = useCallback(() => {
    setResetting(true);
    mmkvStore.remove(DEV_WEB_RUNNER_URL);
    devMode(false);

    // Repair in place first. RNRestart is only a JS-context reload on iOS, inside the same
    // process - which is exactly what leaves a stale native static server behind, so pressing a
    // button that does only that can fail for the very reason the app is stuck. Imported lazily
    // so the handler's AppState listener is not registered ahead of App.tsx's own.
    import('../providers/WebRunnerProvider/instance')
      .then(({ webRunnerHandler }) => webRunnerHandler.recoverRunner('startup-recovery'))
      .catch(e => console.warn('### Startup recovery failed', e))
      .finally(() => {
        // This screen unmounts as soon as the app becomes ready, cancelling the restart with it.
        restartTimeout.current = setTimeout(() => RNRestart.Restart(), 10000);
      });
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size={40} indicatorColor={ColorMap.light} />
      <Typography.Text style={styles.title}>{'Still starting'}</Typography.Text>
      <Typography.Text style={styles.description}>
        {
          'SubWallet is taking much longer than usual to start. Resetting the web runner settings and restarting usually fixes this. Your accounts and settings are not affected.'
        }
      </Typography.Text>
      <Button
        style={styles.button}
        type={'secondary'}
        loading={isResetting}
        disabled={isResetting}
        onPress={onPressReset}
      >
        {'Reset & restart'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    color: ColorMap.light,
    ...FontSemiBold,
  },
  // Not the Button's own `block`, which is flex: 1 and would stretch the button down the whole
  // column here; this panel only wants it full width.
  button: {
    alignSelf: 'stretch',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.65)',
    ...FontMedium,
  },
});
