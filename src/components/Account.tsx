import {Text, View} from 'react-native';
import {AccountJson} from '@subwallet/extension-base/background/types';
import Identicon from '@polkadot/reactnative-identicon';
import React from 'react';

export interface AccountProps extends AccountJson {
  name: string;
}

export const Account = ({name, address}: AccountProps) => {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center', padding: 4}}>
      <Identicon
        value={address}
        size={48}
        theme={'polkadot'}
      />
      <View style={{marginLeft: 8}}>
        <Text style={{fontSize: 12, marginBottom: 8}}>{name}</Text>
        <Text style={{fontSize: 10, fontFamily: 'monospace'}}>{address}</Text>
      </View>
    </View>
  );
};
