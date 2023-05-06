import Identicon from '@polkadot/reactnative-identicon';
import { decodeAddress, encodeAddress, isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import React, { useMemo } from 'react';
import { Image, StyleProp, View } from 'react-native';
// @ts-ignore
import { toDataUrl } from './blockies.js';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import AvatarStyles from './style';
import { Images } from 'assets/index';
function getEthereumIdenticonStyle(size: number): StyleProp<any> {
  return {
    width: size,
    height: size,
    borderRadius: size,
  };
}

type IconTheme = 'polkadot' | 'ethereum';

export interface SWLogoProps {
  theme?: IconTheme;
  size?: number;
  value: string | null;
  identPrefix?: number;
}

const Avatar: React.FC<SWLogoProps> = ({ theme, size = 40, value }) => {
  const themes = useSubWalletTheme().swThemes;
  const _style = AvatarStyles(themes);

  const formattedAddress = useMemo((): string | null => {
    try {
      return encodeAddress(decodeAddress(value || ''));
    } catch (e) {
      return value;
    }
  }, [value]);

  const _theme = useMemo((): IconTheme => {
    return theme || isAddress(value) ? (isEthereumAddress(value || '') ? 'ethereum' : 'polkadot') : 'polkadot';
  }, [theme, value]);

  if (!value || !isAddress(value)) {
    return (
      <View style={[_style.container, { width: size, height: size, borderWidth: size / 20 }]}>
        <Image source={Images.avatarPlaceholder} style={getEthereumIdenticonStyle(size - 8)} />
      </View>
    );
  }

  if (_theme === 'ethereum') {
    return (
      <View style={[_style.container, { width: size, height: size, borderWidth: size / 20 }]}>
        <Image source={{ uri: toDataUrl(formattedAddress) }} style={getEthereumIdenticonStyle(size - 8)} />
      </View>
    );
  }
  return (
    <View style={[_style.container, { width: size, height: size, borderWidth: size / 20 }]}>
      <Identicon value={formattedAddress} size={size - 8} theme="polkadot" />
    </View>
  );
};

export default Avatar;
