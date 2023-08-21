import React, { useCallback, useMemo } from 'react';
import { WalletConnectChainInfo } from 'types/walletConnect';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Logo, Typography } from 'components/design-system-ui';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontBold } from 'styles/sharedStyles';

interface Props {
  networks: WalletConnectChainInfo[];
}

const sizeLogo = {
  default: 20,
  large: 24,
};

export const WCNetworkAvatarGroup = ({ networks }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const showCount: number = useMemo((): number => {
    return networks.length > 2 ? 3 : 2;
  }, [networks]);

  const avatarSize: number = useMemo((): number => {
    return showCount === 3 ? sizeLogo.default : sizeLogo.large;
  }, [showCount]);

  const _style = createStyle(theme, avatarSize);

  const countMore: number = useMemo((): number => {
    return networks.length - 3;
  }, [networks]);

  const getAvatarStyle = useCallback(
    (index: number, arrLength: number) => {
      let avatarStyles: StyleProp<ViewStyle> = [_style.avatarContent];

      if (index === 0) {
        if (index === arrLength - 1) {
          avatarStyles.push({ marginLeft: 0, opacity: 1 });
        } else {
          avatarStyles.push({ marginLeft: 0, opacity: 0.5 });
        }
      }

      if (index === 2) {
        avatarStyles.push({ opacity: 1 });
      }

      if (index === 2 && countMore > 0) {
        avatarStyles.push(_style.avatarBlur);
      }

      return avatarStyles;
    },
    [_style.avatarBlur, _style.avatarContent, countMore],
  );

  return (
    <View style={[_style.container, countMore > 0 && _style.mlStrong]}>
      {networks.slice(0, 3).map((network, index) => {
        return (
          <View key={network.slug} style={getAvatarStyle(index, networks.length)}>
            <Logo
              size={showCount === 3 ? sizeLogo.default : sizeLogo.large}
              shape={'squircle'}
              network={network.slug}
            />
          </View>
        );
      })}
      {countMore > 0 && (
        <Typography.Text
          style={{
            color: theme.colorWhite,
            ...FontBold,
            position: 'absolute',
            right: 4,
            bottom: 0,
            textAlign: 'center',
            shadowOpacity: 1,
            shadowColor: '#000000',
            shadowRadius: 5,
          }}
          size={'sm'}>
          +{countMore}
        </Typography.Text>
      )}
    </View>
  );
};

function createStyle(theme: ThemeTypes, avatarSize: number) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      position: 'relative',
      alignItems: 'center',
    },
    avatarContent: {
      marginLeft: -12,
    },
    mlStrong: {
      marginLeft: -4,
    },
    avatarBlur: {
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowColor: '#000000',
      // opacity: 0.5,
    },
    text: {
      fontSize: theme.fontSizeXS,
      lineHeight: theme.fontSizeXS * theme.lineHeightXS,
      position: 'absolute',
      color: theme.colorTextBase,
      ...FontBold,
      right: 0,
      bottom: 0,
      width: avatarSize,
      height: avatarSize,
      textAlign: 'center',
    },
  });
}
