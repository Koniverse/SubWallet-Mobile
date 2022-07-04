import { Image, StyleProp, View, ViewProps } from 'react-native';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';
import Identicon from '@polkadot/reactnative-identicon';
// @ts-ignore
import Avatar from 'react-native-boring-avatars';
import React from 'react';
import { ColorMap } from 'styles/color';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { toDataUrl } from 'utils/blockies';

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

function getEthereumIdenticonStyle(size: number): StyleProp<any> {
  return {
    width: size,
    height: size,
    borderRadius: size,
  };
}

export const SubWalletAvatar = ({ address, size, ...viewProp }: AvatarProps) => {
  const isEthereum = isEthereumAddress(address);

  return (
    <View style={wrapperStyle} {...viewProp}>
      {address === ALL_ACCOUNT_KEY ? (
        <Avatar
          colors={['#5F545C', '#EB7072', '#F5BA90', '#F5E2B8', '#A2CAA5']}
          name={address}
          size={size}
          variant={'beam'}
        />
      ) : isEthereum ? (
        <Image source={{ uri: toDataUrl(address) }} style={getEthereumIdenticonStyle(size)} />
      ) : (
        <Identicon value={address} size={size} theme={'polkadot'} />
      )}
    </View>
  );
};
