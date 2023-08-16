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
}

const sizeAva = {
  default: 20,
  large: 24,
};

const AvatarGroup = ({ addresses: _addresses, avatarSize: _avatarSize }: Props) => {
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
          }}>{`+${countMore}`}</Text>
      )}
    </View>
  );
};

export default AvatarGroup;
