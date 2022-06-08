import {Text, View} from 'react-native';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';
import Identicon from '@polkadot/reactnative-identicon';
import React from 'react';
import { useSVG } from 'hooks/useSVG';

interface AvatarProps {
  address: string;
  size: number;
}

export const Avatar = ({ address, size }: AvatarProps) => {
  const Logo = useSVG().Logo;

  return (
    <View>
      {address === ALL_ACCOUNT_KEY ? (
        // @ts-ignore
        <Logo.AllAccount width={size} height={size} />
      ) : (
          <Text>Avatar</Text>
        // <Identicon value={address} size={size} theme={'polkadot'} />
      )}
    </View>
  );
};
