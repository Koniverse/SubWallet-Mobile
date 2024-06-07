import React, { useCallback, useMemo } from 'react';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { Avatar } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import AvatarGroupStyle from './style';
import { FontBold } from 'styles/sharedStyles';
import { isEthereumAddress } from '@polkadot/util-crypto';

interface Props {
  addresses?: string[];
  avatarSize?: number;
  avatarGroupStyle?: ViewStyle;
}

const sizeAva = {
  default: 20,
  large: 24,
};

const AvatarGroup = ({ addresses: _addresses, avatarSize: _avatarSize, avatarGroupStyle }: Props) => {
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const theme = useSubWalletTheme().swThemes;
  const _style = AvatarGroupStyle();
  const noAllAccount: string[] = useMemo((): string[] => {
    if (_addresses) {
      return _addresses.filter(a => !isAccountAll(a));
    }

    return accounts.filter(account => !isAccountAll(account.address)).map(a => a.address);
  }, [_addresses, accounts]);

  const avatarSize: number = useMemo((): number => {
    return _avatarSize || (noAllAccount.length > 2 ? sizeAva.default : sizeAva.large);
  }, [_avatarSize, noAllAccount.length]);

  const countMore: number = useMemo((): number => {
    return noAllAccount.length - 3;
  }, [noAllAccount]);

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
        avatarStyles.push({ opacity: 0.7 });
      }

      if (index === 2 && countMore > 0) {
        avatarStyles.push(_style.avatarBlur);
      }

      return avatarStyles;
    },
    [_style.avatarBlur, _style.avatarContent, countMore],
  );

  return (
    <View style={[_style.container, avatarGroupStyle]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {noAllAccount.slice(0, 3).map((account, index) => {
          return (
            <View key={index} style={getAvatarStyle(index, noAllAccount.length)}>
              <Avatar
                size={avatarSize}
                value={account}
                identPrefix={42}
                theme={isEthereumAddress(account) ? 'ethereum' : 'polkadot'}
              />
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

export default AvatarGroup;
