import React, { useMemo } from 'react';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { KeypairType } from '@polkadot/util-crypto/types';
import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import { Text, View } from 'react-native';
import { Avatar } from 'components/design-system-ui';

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
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const noAllAccount: BaseAccountInfo[] = useMemo((): BaseAccountInfo[] => {
    return (_accounts || accounts).filter(account => !isAccountAll(account.address));
  }, [accounts, _accounts]);

  const showCount: number = useMemo((): number => {
    return noAllAccount.length > 2 ? 3 : 2;
  }, [noAllAccount]);

  const countMore: number = useMemo((): number => {
    return noAllAccount.length - 3;
  }, [noAllAccount]);

  return (
    <View>
      {noAllAccount.slice(0, 3).map((account, index) => {
        return (
          <View>
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
        <View>
          <Text>{`+${countMore}`}</Text>
        </View>
      )}
    </View>
  );
};

export default AvatarGroup;
