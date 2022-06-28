import React from 'react';
import { View } from 'react-native';
import { TokenHistoryItem } from 'components/TokenHistoryItem';

export const HistoryTab = () => {
  return (
    <View>
      <TokenHistoryItem isLoading={false} isReceiveHistory={true} />
    </View>
  );
};
