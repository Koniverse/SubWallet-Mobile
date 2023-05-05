import { View } from 'react-native';
import React from 'react';
import { ActivityIndicator } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

export function LoadingScreen() {
  const theme = useSubWalletTheme().swThemes;
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <ActivityIndicator size={40} indicatorColor={theme.colorWhite} />
    </View>
  );
}
