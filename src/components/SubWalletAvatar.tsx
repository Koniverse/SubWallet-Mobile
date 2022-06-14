import { View } from 'react-native';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';
import Identicon from '@polkadot/reactnative-identicon';
// @ts-ignore
import Avatar from 'react-native-boring-avatars';
import React from 'react';
import { useSVG } from 'hooks/useSVG';

interface AvatarProps {
  address: string;
  size: number;
}

export const SubWalletAvatar = ({ address, size }: AvatarProps) => {
  const Logo = useSVG().Logo;

  return (
    <View>
      {address === ALL_ACCOUNT_KEY ? (
        // @ts-ignore
        <Logo.AllAccount width={size} height={size} />
      ) : (
        <Avatar
          colors={['#5F545C', '#EB7072', '#F5BA90', '#F5E2B8', '#A2CAA5']}
          name={'Quang'}
          size={34}
          variant={'beam'}
        />
        // <Identicon value={address} size={size} theme={'polkadot'} />
      )}
    </View>
  );
};
