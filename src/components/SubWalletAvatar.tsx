import { Image, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import Identicon from '@polkadot/reactnative-identicon';
// @ts-ignore
import Avatar from 'react-native-boring-avatars';
import React, { useMemo } from 'react';
import { ColorMap } from 'styles/color';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { AvatarSubIcon } from 'types/ui-types';
import { toDataUrl } from 'utils/blockies';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';

interface AvatarProps extends ViewProps {
  address: string;
  size: number;
  hasBorder?: boolean;
  SubIcon?: AvatarSubIcon;
}

const WrapperStyle: StyleProp<any> = {
  borderStyle: 'solid',
  borderColor: ColorMap.secondary,
  borderRadius: 40,
};

const SubIconContainerStyle: StyleProp<ViewStyle> = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: ColorMap.subIconBackgroundColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const getWrapperStyle = (hasBorder: boolean): StyleProp<ViewStyle> => {
  return {
    ...WrapperStyle,
    borderWidth: hasBorder ? 2 : 0,
    padding: hasBorder ? 2 : 0,
  };
};

const getSubIconStyle = (size: number): StyleProp<ViewStyle> => {
  return {
    ...SubIconContainerStyle,
    width: size,
    height: size,
    borderRadius: size,
  };
};

function getEthereumIdenticonStyle(size: number): StyleProp<any> {
  return {
    width: size,
    height: size,
    borderRadius: size,
  };
}

export const SubWalletAvatar = ({ address, size: originSize, hasBorder = true, SubIcon, ...viewProp }: AvatarProps) => {
  const size = useMemo((): number => (hasBorder ? originSize - 8 : originSize), [hasBorder, originSize]);
  const isEthereum = isEthereumAddress(address);

  return (
    <View style={getWrapperStyle(hasBorder)} {...viewProp}>
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
      {SubIcon && (
        <View style={getSubIconStyle(SubIcon.size)}>
          <SubIcon.Icon size={SubIcon.size - 4} color={ColorMap.light} />
        </View>
      )}
    </View>
  );
};
