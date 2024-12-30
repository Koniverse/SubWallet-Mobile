import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isAccountAll } from 'utils/accountAll';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { FontBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

export interface BasicAccountProxyInfo {
  id: string;
  name?: string;
}

interface Props {
  accountProxies?: BasicAccountProxyInfo[];
}

const sizeAva = {
  default: 20,
  large: 24,
};

export const AccountProxyAvatarGroup = ({ accountProxies: _accountProxies }: Props) => {
  const accountProxies = useSelector((state: RootState) => state.accountState.accountProxies);
  const theme = useSubWalletTheme().swThemes;
  const _style = createStyleSheet(theme);
  const noAllAccountProxy: BasicAccountProxyInfo[] = useMemo((): BasicAccountProxyInfo[] => {
    return (_accountProxies || accountProxies).filter(ap => !isAccountAll(ap.id));
  }, [_accountProxies, accountProxies]);

  const showCount: number = useMemo((): number => {
    return noAllAccountProxy.length > 2 ? 3 : 2;
  }, [noAllAccountProxy]);

  const avatarSize: number = useMemo((): number => {
    return showCount === 3 ? sizeAva.default : sizeAva.large;
  }, [showCount]);

  const countMore: number = useMemo((): number => {
    return noAllAccountProxy.length - 3;
  }, [noAllAccountProxy]);

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

      if (index === 1) {
        avatarStyles.push({ opacity: 0.7 });
      }

      if (index === 2 && countMore > 0) {
        avatarStyles.push({ ..._style.avatarBlur, opacity: 0.7 });
      }

      return avatarStyles;
    },
    [_style.avatarBlur, _style.avatarContent, countMore],
  );

  return (
    <View style={_style.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {noAllAccountProxy.slice(0, 3).map((ap, index) => {
          return (
            <View key={index} style={getAvatarStyle(index, noAllAccountProxy.length)}>
              <AccountProxyAvatar size={avatarSize} value={ap.id} />
            </View>
          );
        })}
        {countMore > 0 && (
          <Text
            style={{
              fontSize: 9,
              position: 'absolute',
              color: theme.colorTextBase,
              ...FontBold,
              right: (avatarSize - theme.fontSizeXS - 2) / 2,
              bottom: (avatarSize - theme.fontSizeXS - 2) / 2,
              textAlign: 'center',
            }}>{`+${countMore}`}</Text>
        )}
      </View>
    </View>
  );
};

function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      position: 'relative',
      alignItems: 'center',
    },
    avatarContent: {
      marginLeft: -theme.marginSM,
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
  });
}
