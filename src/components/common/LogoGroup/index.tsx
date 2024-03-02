import React, { useCallback, useMemo } from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { Logo } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import AvatarGroupStyle from './style';
import { FontBold } from 'styles/sharedStyles';

interface Props {
  chains: string[];
  logoSize?: number;
}

const sizeLogo = {
  default: 20,
  large: 24,
};

const LogoGroup = ({ chains: _chains, logoSize: _logoSize }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = AvatarGroupStyle();

  const logoSize: number = useMemo((): number => {
    return _logoSize || (_chains.length > 2 ? sizeLogo.default : sizeLogo.large);
  }, [_logoSize, _chains.length]);

  const countMore: number = useMemo((): number => {
    return _chains.length - 3;
  }, [_chains]);

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
      {_chains.slice(0, 3).map((chain, index) => {
        return (
          <View key={index} style={getAvatarStyle(index, _chains.length)}>
            <Logo size={logoSize} network={chain} />
          </View>
        );
      })}
      {countMore > 0 && (
        <Text
          style={{
            fontSize: theme.fontSizeXS,
            lineHeight: theme.fontSizeXS * theme.lineHeightXS,
            position: 'absolute',
            color: theme.colorTextBase,
            ...FontBold,
            right: 0,
            bottom: 0,
            width: logoSize,
            height: logoSize,
            textAlign: 'center',
          }}>{`+${countMore}`}</Text>
      )}
    </View>
  );
};

export default LogoGroup;
