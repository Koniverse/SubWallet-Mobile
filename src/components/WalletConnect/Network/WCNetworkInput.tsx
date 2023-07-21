import React from 'react';
import { Icon, Typography, Web3Block } from 'components/design-system-ui';
import { WCNetworkAvatarGroup } from 'components/WalletConnect/Network/WCNetworkAvatarGroup';
import { WalletConnectChainInfo } from 'types/walletConnect';
import { DotsThree } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium } from 'styles/sharedStyles';

interface Props {
  networks: WalletConnectChainInfo[];
  content: string;
  onPress: () => void;
}

export const WCNetworkInput = ({ networks, content }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  return (
    <Web3Block
      customStyle={{
        container: {
          backgroundColor: theme.colorBgSecondary,
          borderRadius: theme.borderRadiusLG,
          paddingRight: theme.padding + 2,
          marginBottom: theme.margin,
        },
      }}
      leftItem={<WCNetworkAvatarGroup networks={networks} />}
      middleItem={
        <Typography.Text
          style={{
            fontSize: theme.fontSize,
            lineHeight: theme.fontSize * theme.lineHeight,
            ...FontMedium,
            color: theme.colorWhite,
          }}>
          {content}
        </Typography.Text>
      }
      rightItem={<Icon phosphorIcon={DotsThree} weight={'fill'} />}
    />
  );
};
