import { StyleProp, View, ViewProps } from 'react-native';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';
import Identicon from '@polkadot/reactnative-identicon';
// @ts-ignore
import Avatar from 'react-native-boring-avatars';
import React from 'react';
import { ColorMap } from 'styles/color';

interface AvatarProps extends ViewProps {
  address: string;
  size: number;
}

const wrapperStyle: StyleProp<any> = {
  borderStyle: 'solid',
  borderWidth: 2,
  borderColor: ColorMap.secondary,
  borderRadius: 40,
  padding: 2,
};

export const SubWalletAvatar = ({ address, size, ...viewProp }: AvatarProps) => {
  return (
    <View style={wrapperStyle} {...viewProp}>
      {address === ALL_ACCOUNT_KEY ? (
        <Avatar
          colors={['#5F545C', '#EB7072', '#F5BA90', '#F5E2B8', '#A2CAA5']}
          name={address}
          size={size}
          variant={'beam'}
        />
      ) : (
        <Identicon value={address} size={size} theme={'polkadot'} />
      )}
    </View>
  );
};
