import React from 'react';
import { View } from 'react-native';
import { ChainBalance } from 'components/ChainBalance';

export const TokensTab = () => {
  return (
    <View>
      <ChainBalance
        isLoading={false}
        isToken
        accountInfo={{
          key: 'polkadot',
          networkKey: 'polkadot',
          networkDisplayName: 'Polkadot',
          networkPrefix: -1,
          networkLogo: 'polkadot',
          networkIconTheme: '',
          address: '123',
          formattedAddress: '123',
        }}
      />
    </View>
  );
};
