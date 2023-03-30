import React, { useMemo } from 'react';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { KeypairType } from '@polkadot/util-crypto/types';
import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import { Text, View } from 'react-native';
import { Avatar } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import AvatarGroupStyle from './style';
import { FontBold } from 'styles/sharedStyles';

export interface BaseAccountInfo {
  address: string;
  name?: string;
  type?: KeypairType;
}

interface Props {
  accounts?: Array<BaseAccountInfo>;
}

const sizeAva = {
  default: 20,
  large: 24,
};

const AvatarGroup = ({ accounts: _accounts }: Props) => {
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const theme = useSubWalletTheme().swThemes;
  const _style = AvatarGroupStyle(theme);
  const noAllAccount: BaseAccountInfo[] = useMemo((): BaseAccountInfo[] => {
    return (_accounts || accounts).filter(account => !isAccountAll(account.address));
  }, [accounts, _accounts]);

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
              value={account.address}
              identPrefix={42}
              theme={account.type === 'ethereum' ? 'ethereum' : 'polkadot'}
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
            bottom: 1,
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
