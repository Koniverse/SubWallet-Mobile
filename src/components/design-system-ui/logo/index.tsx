// @ts-nocheck
import React from 'react';
import { View } from 'react-native';
import LogoStyles from './style';
import Image from '../image';
import ChainLogoMap, { TokenLogoMap } from './LogoMap';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

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
  defaultLogoKey,
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
  const _style = LogoStyles(theme);
  const subLogoSize = size / 2.5;
  let srcLogo;
  if (token) {
    srcLogo = TokenLogoMap[token] || TokenLogoMap[defaultLogoKey];
  } else if (network) {
    srcLogo = ChainLogoMap[network] || ChainLogoMap[defaultLogoKey];
  }

  let srcSubLogo;
  if (subToken) {
    srcSubLogo = TokenLogoMap[subToken] || TokenLogoMap[defaultLogoKey];
  } else if (subNetwork) {
    srcSubLogo = ChainLogoMap[subNetwork] || ChainLogoMap[defaultLogoKey];
  }

  return (
    <View>
      <Image
        src={srcLogo || TokenLogoMap.subwallet}
        style={{ width: size, height: size, backgroundColor: 'transparent' }}
        squircleSize={size}
        shape={shape}
      />
      {isShowSubIcon && !isShowSubLogo && <View style={_style.subLogoContainer}>{subIcon}</View>}
      {isShowSubLogo && (
        <Image
          src={srcSubLogo || TokenLogoMap.subwallet}
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
