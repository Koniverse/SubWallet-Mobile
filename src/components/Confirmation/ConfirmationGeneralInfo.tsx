import React from 'react';
import { ConfirmationRequestBase } from '@subwallet/extension-base/background/types';
import { getDomainFromUrl } from '@subwallet/extension-base/utils';
import { StyleProp, View, ViewStyle } from 'react-native';
import DualLogo from 'components/Logo/DualLogo';
import { Image, Typography } from 'components/design-system-ui';
import { SWImageProps } from 'components/design-system-ui/image';
import { ImageLogosMap } from 'assets/logo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  request: ConfirmationRequestBase;
  linkIcon?: React.ReactNode;
  linkIconBg?: string;
  style?: StyleProp<ViewStyle>;
}

const imageProps: Omit<SWImageProps, 'src'> = {
  squircleSize: 56,
  style: { width: 56, height: 56 },
  resizeMode: 'contain',
};

export const ConfirmationGeneralInfo = ({ linkIcon, linkIconBg, request, style }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const domain = getDomainFromUrl(request.url);
  //todo: find better way to get icon
  const leftLogoUrl = `https://icons.duckduckgo.com/ip2/${domain}.ico`;

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <DualLogo
        leftLogo={<Image {...imageProps} src={ImageLogosMap.subwallet} />}
        linkIcon={linkIcon}
        linkIconBg={linkIconBg}
        rightLogo={<Image {...imageProps} src={{ uri: leftLogoUrl }} />}
      />

      <Typography.Text style={{ paddingTop: theme.paddingSM, color: theme.colorTextLight4 }}>{domain}</Typography.Text>
    </View>
  );
};
