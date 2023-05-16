// @ts-nocheck
import React from 'react';
import { View } from 'react-native';
import LogoStyles from './style';
import Image from '../image';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { ImageLogosMap } from 'assets/logo';

type IconShapeType = 'default' | 'circle' | 'squircle';

export interface SWLogoProps {
  defaultLogoKey?: string;
  isShowSubLogo?: boolean;
  isShowSubIcon?: boolean;
  network?: string;
  shape?: IconShapeType;
  size: number;
  subLogoShape?: IconShapeType;
  subNetwork?: string;
  subToken?: string;
  token?: string;
  subIcon?: React.ReactNode;
}

const Logo: React.FC<SWLogoProps> = ({
  defaultLogoKey = 'default',
  isShowSubLogo,
  isShowSubIcon,
  network,
  shape = 'default',
  size,
  subLogoShape = 'circle',
  subNetwork,
  subIcon,
  subToken,
  token,
}) => {
  const theme = useSubWalletTheme().swThemes;
  const { chainLogoMap, assetLogoMap } = useSelector((state: RootState) => state.logoMaps);
  const _style = LogoStyles(theme);
  const subLogoSize = size / 2.5;
  let srcLogo;
  if (token) {
    srcLogo = assetLogoMap[token] || assetLogoMap[defaultLogoKey];
  } else if (network) {
    srcLogo = chainLogoMap[network] || chainLogoMap[defaultLogoKey];
  }

  let srcSubLogo;
  if (subToken) {
    srcSubLogo = assetLogoMap[subToken] || assetLogoMap[defaultLogoKey];
  } else if (subNetwork) {
    srcSubLogo = chainLogoMap[subNetwork] || chainLogoMap[defaultLogoKey];
  }

  return (
    <View>
      <Image
        src={srcLogo ? { uri: srcLogo } : ImageLogosMap.default}
        style={{ width: size, height: size, backgroundColor: 'transparent' }}
        squircleSize={size}
        shape={shape}
      />
      {isShowSubIcon && !isShowSubLogo && <View style={_style.subLogoContainer}>{subIcon}</View>}
      {isShowSubLogo && (
        <Image
          src={srcSubLogo ? { uri: srcSubLogo } : ImageLogosMap.default}
          style={{ width: subLogoSize, height: subLogoSize }}
          squircleSize={subLogoSize}
          shape={subLogoShape}
          containerStyle={_style.subLogoContainer}
        />
      )}
    </View>
  );
};

export default Logo;
