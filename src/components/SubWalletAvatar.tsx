import { StyleProp, View, ViewProps } from 'react-native';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';
import Identicon from '@polkadot/reactnative-identicon';
// import Avatar from 'react-native-boring-avatars';
import React from 'react';
import { useSVG } from 'hooks/useSVG';

interface AvatarProps extends ViewProps {
  address: string;
  size: number;
}

const wrapperStyle: StyleProp<any> = {
  borderStyle: 'solid',
  borderWidth: 2,
  borderColor: '#004BFF',
  borderRadius: 40,
  padding: 2,
};

export const SubWalletAvatar = ({ address, size, ...viewProp }: AvatarProps) => {
  const Logo = useSVG().Logo;

  return (
    <View style={wrapperStyle} {...viewProp}>
      {address === ALL_ACCOUNT_KEY ? (
        // @ts-ignore
        <Logo.AllAccount width={size} height={size} />
      ) : (
        // <Avatar
        //   colors={['#5F545C', '#EB7072', '#F5BA90', '#F5E2B8', '#A2CAA5']}
        //   name={address}
        //   size={size}
        //   variant={'beam'}
        // />
        <Identicon value={address} size={size} theme={'polkadot'} />
      )}
    </View>
  );
};
