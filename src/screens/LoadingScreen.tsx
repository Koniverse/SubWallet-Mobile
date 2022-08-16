import { ActivityIndicator, View } from 'react-native';
import React from 'react';

export function LoadingScreen() {
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
