import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { mmkvStore } from 'utils/storage';
import Text from 'components/Text';

const RUNNER_STATE_KEY = 'runnerState';

function readRunnerStateFromMmkv(): string {
  if (!mmkvStore.contains(RUNNER_STATE_KEY)) {
    return '(chưa có runnerState)';
  }
  return mmkvStore.getString(RUNNER_STATE_KEY) ?? '(key có nhưng getString trả undefined)';
}

export function LoadingScreen() {
  const theme = useSubWalletTheme().swThemes;
  const [runnerStateDebug, setRunnerStateDebug] = useState(readRunnerStateFromMmkv);

  useEffect(() => {
    const sub = mmkvStore.addOnValueChangedListener(key => {
      if (key === RUNNER_STATE_KEY) {
        setRunnerStateDebug(readRunnerStateFromMmkv());
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, paddingHorizontal: 16 }}>
      <Text style={{ color: theme.colorWhite, marginBottom: 12, textAlign: 'center' }}>Runner State: {runnerStateDebug}</Text>
      <ActivityIndicator size={40} indicatorColor={theme.colorWhite} />
    </View>
  );
}
