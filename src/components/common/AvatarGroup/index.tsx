import React, { useMemo } from 'react';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import { Text, View } from 'react-native';
import { Avatar } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import AvatarGroupStyle from './style';
import { FontBold } from 'styles/sharedStyles';
import { isEthereumAddress } from '@polkadot/util-crypto';

interface Props {
  addresses?: string[];
}

const sizeAva = {
  default: 20,
  large: 24,
};

const AvatarGroup = ({ addresses: _addresses }: Props) => {
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const theme = useSubWalletTheme().swThemes;
  const _style = AvatarGroupStyle(theme);
  const noAllAccount: string[] = useMemo((): string[] => {
    if (_addresses) {
      return _addresses.filter(a => !isAccountAll(a));
    }

    return accounts.filter(account => !isAccountAll(account.address)).map(a => a.address);
  }, [_addresses, accounts]);

  const showCount: number = useMemo((): number => {
    return noAllAccount.length > 2 ? 3 : 2;
  }, [noAllAccount]);

  const countMore: number = useMemo((): number => {
    return noAllAccount.length - 3;
  }, [noAllAccount]);

  const getAvatarStyle = (index: number) => {
    let avatarStyles = [_style.avatarContent];

    if (index === 0) {
      avatarStyles.push({ marginLeft: 0, opacity: 0.5 });
    }

    if (index === 2) {
      avatarStyles.push({ opacity: 1 });
    }

    if (index === 2 && countMore > 0) {
      avatarStyles.push(_style.avatarBlur);
    }

    return avatarStyles;
  };

  return (
    <View style={[_style.container, countMore > 0 && _style.mlStrong]}>
      {noAllAccount.slice(0, 3).map((account, index) => {
        return (
          <View key={index} style={getAvatarStyle(index)}>
            <Avatar
              size={showCount === 3 ? sizeAva.default : sizeAva.large}
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
            // backgroundColor: 'red',
            width: theme.sizeMD,
            height: theme.sizeMD,
            alignItems: 'center',
            justifyContent: 'center',
          }}>{`+${countMore}`}</Text>
      )}
    </View>
  );
};

export default AvatarGroup;
