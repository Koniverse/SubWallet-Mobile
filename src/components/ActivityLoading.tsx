import React from 'react';
import { ActivityIndicator } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { View } from 'react-native';

export const ActivityLoading = () => {
  const theme = useSubWalletTheme().swThemes;
  return (
    <View style={{ marginVertical: 20 }}>
      <ActivityIndicator size={20} indicatorColor={theme.colorWhite} />
    </View>
  );
};
